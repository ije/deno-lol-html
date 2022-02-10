# LOL(😂) HTML for Deno

Deno bindings for the Rust crate [cloudflare/lol-html](https://github.com/cloudflare/lol-html), the Low Output Latency streaming HTML rewriter/parser with CSS-selector based API, via Webassembly.

## Example

```ts
import { concat } from "https://deno.land/std@0.125.0/bytes/mod.ts";
import init, { HTMLRewriter } from "https://deno.land/x/lol_html/mod.js";
import wasm from "https://deno.land/x/lol_html/wasm.js";

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
```
