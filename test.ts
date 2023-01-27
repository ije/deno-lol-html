import { concat } from "https://deno.land/std@0.170.0/bytes/mod.ts";
import init, { HTMLRewriter } from "./mod.js";
import getWasmData from "./wasm.js";
import type { Element, TextChunk } from "./types.d.ts";

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
  element(el: Element) {
    el.setAttribute("class", "this-is-a-link");
  },
  text: (chunk: TextChunk) => {
    chunk.replace(chunk.text.replaceAll(/:lol/gi, "😂"));
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
