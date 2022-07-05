import { dim } from "https://deno.land/std@0.145.0/fmt/colors.ts";
import { encode } from "https://deno.land/std@0.145.0/encoding/base64.ts";
import { ensureDir } from "https://deno.land/std@0.145.0/fs/ensure_dir.ts";
import { compress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";

async function run(cmd: string[]) {
  const p = Deno.run({
    cmd,
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await p.status();
  p.close();
  return status.success;
}

if (import.meta.main) {
  const ok = await run(["wasm-pack", "build", "--target", "web"]);
  if (ok) {
    const wasmData = await Deno.readFile("./pkg/deno_lol_html_bg.wasm");
    const jsCode = await Deno.readTextFile("./pkg/deno_lol_html.js");
    const dtsCode = await Deno.readTextFile("./pkg/deno_lol_html.d.ts");
    let prevWasmSize = 0;
    try {
      prevWasmSize = (await Deno.stat("./wasm.js")).size;
    } catch (e) {}
    await Deno.writeTextFile(
      "./wasm.js",
      `import { decompress } from "https://deno.land/x/lz4@v0.1.2/mod.ts";\nexport default () => decompress(Uint8Array.from(atob("${
        encode(compress(wasmData))
      }"), c => c.charCodeAt(0)));`,
    );
    await Deno.writeTextFile(
      "./mod.js",
      jsCode
        .replace(`import * as __wbg_star0 from 'env';`, "")
        .replace(
          `imports['env'] = __wbg_star0;`,
          `imports['env'] = { now: () => Date.now() };`,
        ),
    );
    await Deno.writeTextFile("./types.d.ts", dtsCode);
    await run(["deno", "fmt", "-q", "./mod.js", "./types.d.ts"]);
    const wasmSize = (await Deno.stat("./wasm.js")).size;
    const increased = ((wasmSize - prevWasmSize) / prevWasmSize) * 100;
    if (increased) {
      console.log(
        `${dim("[INFO]")}: wasm.js ${increased.toFixed(2)}% (${
          [prevWasmSize, wasmSize].filter(Boolean).map((n) =>
            (n / (1024 * 1024)).toFixed(2) + "MB"
          )
            .join(" -> ")
        })`,
      );
    }
  }
}
