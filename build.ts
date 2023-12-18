import { dirname } from "https://deno.land/std@0.200.0/path/mod.ts";
import { encode } from "https://deno.land/std@0.200.0/encoding/base64.ts";

async function gzip(path: string): Promise<ArrayBuffer> {
  const f = await Deno.open(path);
  return new Response(
    new Response(f.readable).body!.pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
}

function prettyBytes(n: number) {
  return (n / 1024).toFixed(2) + " KB";
}

async function run(cmd: string, ...args: string[]) {
  const p = new Deno.Command(cmd, {
    args,
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await p.spawn().status;
  return status.success;
}

if (import.meta.main) {
  Deno.chdir(dirname(new URL(import.meta.url).pathname));
  const ok = await run("wasm-pack", "build", "--target", "web");
  if (ok) {
    await Deno.copyFile("./pkg/deno_lol_html_bg.wasm", "./lol_html.wasm");
    const wasmStat = await Deno.stat("./lol_html.wasm");
    const wasmGz = await gzip("./lol_html.wasm");
    const jsCode = await Deno.readTextFile("./pkg/deno_lol_html.js");
    const dts = await Deno.readTextFile("./pkg/deno_lol_html.d.ts");
    await Deno.writeTextFile(
      "./wasm.js",
      `const ungzip = (data) => new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();\nexport default () => ungzip(Uint8Array.from(atob("${
        encode(wasmGz)
      }"), c => c.charCodeAt(0)));`,
    );
    await Deno.writeTextFile(
      "./lol_html.js",
      jsCode
        .replace(
          /on\(selector, handlers\) \{([\s\S]+?)\}(\s+)\/\*\*/,
          "on(selector, handlers) {$1;return this}$2/**",
        ).replace(
          /onDocument\(handlers\) \{([\s\S]+?)\}(\s+)\/\*\*/,
          "onDocument(handlers) {$1;return this}$2/**",
        )
        .replace(
          "deno_lol_html_bg.wasm",
          "lol_html.wasm",
        ),
    );
    await Deno.writeTextFile(
      "./types.d.ts",
      dts.replace(
        "on(selector: string, handlers: any): void",
        "on(selector: string, handlers: ElementHandlers): this",
      ).replace(
        "onDocument(handlers: any): void",
        "onDocument(handlers: DocumentHandlers): this",
      ).replaceAll(
        "content_type?: any",
        "content_type?: ContentType",
      ) + [
        `export interface ElementHandlers { element?: (el: Element) => void, comments?: (comment: Comment) => void, text?: (chunk: TextChunk) => void }`,
        `export interface DocumentHandlers { doctype?: (doctype: Doctype) => void, comments?: (comment: Comment) => void, text?: (chunk: TextChunk) => void, end?: (end: DocumentEnd) => void }`,
        `export interface ContentType { html: Boolean }`,
      ].join("\n"),
    );
    await run("deno", "fmt", "-q", "./lol_html.js", "./types.d.ts");
    console.log(
      `wasm size: ${prettyBytes(wasmStat.size)}, gzipped: ${
        prettyBytes(wasmGz.byteLength)
      }`,
    );
  }
}
