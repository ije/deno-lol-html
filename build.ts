import { dirname } from "https://deno.land/std@0.170.0/path/mod.ts";
import { encode } from "https://deno.land/std@0.170.0/encoding/base64.ts";

async function gzip(path: string): Promise<ArrayBuffer> {
  const f = await Deno.open(path);
  return new Response(
    new Response(f.readable).body!.pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
}

function prettyBytes(n: number) {
  return (n / 1024).toFixed(2) + " KB";
}

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
  Deno.chdir(dirname(new URL(import.meta.url).pathname));
  const ok = await run(["wasm-pack", "build", "--target", "web"]);
  if (ok) {
    await Deno.rename("./pkg/deno_lol_html_bg.wasm", "./lol_html.wasm");
    await Deno.rename("./pkg/deno_lol_html.d.ts", "./types.d.ts");
    const wasmStat = await Deno.stat("./lol_html.wasm");
    const wasmGz = await gzip("./lol_html.wasm");
    const jsCode = await Deno.readTextFile("./pkg/deno_lol_html.js");
    await Deno.writeTextFile(
      "./wasm.js",
      `const ungzip = (data) => new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();\nexport default () => ungzip(Uint8Array.from(atob("${
        encode(wasmGz)
      }"), c => c.charCodeAt(0)));`,
    );
    await Deno.writeTextFile(
      "./mod.js",
      jsCode
        .replace(`import * as __wbg_star0 from 'env';`, "")
        .replace(
          `imports['env'] = __wbg_star0;`,
          `imports['env'] = { now: () => Date.now() };`,
        ).replace(
          "deno_lol_html_bg.wasm",
          "lol_html.wasm",
        ),
    );
    await run(["deno", "fmt", "-q", "./mod.js", "./types.d.ts"]);
    console.log(
      `wasm size: ${prettyBytes(wasmStat.size)}, gzipped: ${
        prettyBytes(wasmGz.byteLength)
      }`,
    );
  }
}
