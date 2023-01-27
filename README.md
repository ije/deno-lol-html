# LOL(😂) HTML for Deno

Deno bindings for the Rust crate [cloudflare/lol-html](https://github.com/cloudflare/lol-html), the Low Output Latency streaming HTML rewriter/parser with CSS-selector based API, in Webassembly.

## Example

```ts
import { concat } from "https://deno.land/std@0.170.0/bytes/mod.ts";
import init, { HTMLRewriter } from "https://deno.land/x/lol_html@0.0.5/mod.js";
import type { Element, TextChunk } from "https://deno.land/x/lol_html@0.0.5/types.d.ts";

await init();

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
```
