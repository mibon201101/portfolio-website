import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const client = resolve(output, "client");
const server = resolve(output, "server");

await rm(output, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

await Promise.all([
  cp(resolve(root, "index.html"), resolve(client, "index.html")),
  cp(resolve(root, "style.css"), resolve(client, "style.css")),
  cp(resolve(root, "script.js"), resolve(client, "script.js")),
  cp(resolve(root, "assets"), resolve(client, "assets"), { recursive: true }),
]);

const worker = `const securityHeaders = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN"
};

export default {
  async fetch(request, env) {
    if (!env?.ASSETS) {
      return new Response("Static asset binding unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
`;

await writeFile(resolve(server, "index.js"), worker);
