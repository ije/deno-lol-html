# LOL(😂) HTML

Wasm bindings of [cloudflare/lol-html](https://github.com/cloudflare/lol-html) for Deno, the Low Output
Latency streaming HTML rewriter/parser with CSS-selector based API, in
Webassembly.

> The wasm bindings code is based on
> https://github.com/cloudflare/lol-html/pull/100 by @devsnek

## Documentation

See https://developers.cloudflare.com/workers/runtime-apis/html-rewriter

## Example

```ts
import { concat } from "https://deno.land/std@0.200.0/bytes/mod.ts";
import init, { HTMLRewriter } from "https://deno.land/x/lol_html@0.1.0/mod.ts";

await init();

const enc = new TextEncoder();
const dec = new TextDecoder();
const chunks: Uint8Array[] = [];
const parts = [
  "<h1><a href=",
  '"https://lol-html.fun">',
  "LOL(:lol) HTML</",
  "a></h1>",
];

const rewriter = new HTMLRewriter("utf8", (chunk: Uint8Array) => {
  chunks.push(chunk);
});

// add handlers before calling `write` or `end`
rewriter.on("a[href]", {
  element(el) {
    el.setAttribute("class", "this-is-a-link");
  },
  text(chunk) {
    chunk.replace(chunk.text.replaceAll(":lol", "😂"));
  },
});

try {
  for (const part of parts) {
    rewriter.write(enc.encode(part));
  }
  rewriter.end();
  console.log(dec.decode(concat(...chunks)));
} finally {
  // don't forget to free the memory
  rewriter.free();
}
```

## Using Stream

The wasm binding version doesn't implement the `transform` method in the [docs](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter), you can use
the `ReadableStream` instead.

```ts
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import init, { HTMLRewriter } from "https://deno.land/x/lol_html@0.1.0/mod.ts";

await init();

serve(() => {
  const readable = new ReadableStream({
    async start(controller) {
      const rewriter = new HTMLRewriter("utf8", (chunk: Uint8Array) => {
        controller.enqueue(chunk);
      });
      const res = await fetch("https://lol-html.fun");
      const pump = async () => {
        const { done, value } = await res.body!.read();
        if (done) {
          controller.close();
          try {
            rewriter.end();
          } finally {
            rewriter.free();
          }
          return;
        }
        rewriter.write(value!);
        pump();
      };
      pump();
    },
  });
  return new Response(readable, {
    headers: { "content-type": "text/html" },
  });
});
```
