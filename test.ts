import { concat } from "https://deno.land/std@0.200.0/bytes/mod.ts";
import init, { HTMLRewriter } from "./mod.ts";
import getWasmData from "./wasm.js";

await init(getWasmData());

const enc = new TextEncoder();
const dec = new TextDecoder();
const chunks: Uint8Array[] = [];
const parts = [
  "<h1><a href=",
  '"https://lol-html.com">',
  "LOL(:lol) HTML</",
  "a></h1>",
];

const rewriter = new HTMLRewriter("utf8", (chunk: Uint8Array) => {
  chunks.push(chunk);
});

rewriter.on("a[href]", {
  element(el) {
    el.setAttribute("class", "this-is-a-link");
  },
  text(chunk) {
    chunk.replace(chunk.text.replaceAll(":lol", "😂"));
  },
});

for (const part of parts) {
  rewriter.write(enc.encode(part));
}

try {
  rewriter.end();
  console.log(dec.decode(concat(...chunks)));
} finally {
  rewriter.free();
}
