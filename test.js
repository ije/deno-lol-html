import { concat } from "https://deno.land/std@0.125.0/bytes/mod.ts";
import init, { HTMLRewriter } from "./mod.js";
import wasm from "./wasm.js";

await init(wasm());

const enc = new TextEncoder()
const dec = new TextDecoder()
const chunks = [];
const parts = [
  "<div><a href=",
  "http://example.com>",
  "</a></div>",
]
const rewriter = new HTMLRewriter("utf8", (chunk) => {
  chunks.push(chunk);
});

rewriter.on("a[href]", {
  element(el) {
    const href = el
      .getAttribute("href")
      .replace("http:", "https:");
    el.setAttribute("href", href);
  },
});

for (const part of parts) {
  rewriter.write(enc.encode(part));
}

rewriter.end();
console.log(dec.decode(concat(...chunks)));
