import { concat } from "https://deno.land/std@0.145.0/bytes/mod.ts";
import init, { HTMLRewriter } from "./mod.js";
import wasm from "./wasm.js";
import type { Element } from "./types.d.ts";

await init(wasm());

const enc = new TextEncoder();
const dec = new TextDecoder();
const chunks: Uint8Array[] = [];
const parts = [
  "<div><a href=",
  '"https://example.com">',
  "...",
  "</a></div>",
];
const rewriter = new HTMLRewriter("utf8", (chunk: Uint8Array) => {
  chunks.push(chunk);
});

rewriter.on("a[href]", {
  element(el: Element) {
    el.setAttribute("class", "link");
    el.setInnerContent("Link");
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
