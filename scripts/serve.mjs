import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] === "dist" ? "dist" : "source";
const base = path.join(root, mode === "dist" ? "dist" : "");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

async function localEnv() {
  try {
    const text = await readFile(path.join(root, ".env"), "utf8");
    return Object.fromEntries(text.split(/\r?\n/).map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^(['"])(.*)\1$/, "$2")]));
  } catch { return {}; }
}
const env = await localEnv();
const config = JSON.stringify({
  supabaseUrl: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "",
}).replaceAll("<", "\\u003c");

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end("Bad request"); return; }
  if (pathname.split("/").some((part) => part.startsWith("."))) { response.writeHead(404).end("Not found"); return; }
  let target = path.resolve(base, `.${pathname}`);
  if (target === base) target = path.join(base, "index.html");
  if (!target.startsWith(`${base}${path.sep}`) && target !== path.join(base, "index.html")) { response.writeHead(403).end("Forbidden"); return; }
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = path.join(target, "index.html");
    const ext = path.extname(target).toLowerCase();
    if (ext === ".html") {
      let html = await readFile(target, "utf8");
      html = html.replace("<!-- recipe-share-runtime-config -->", `<script>window.RECIPE_SHARE_CONFIG=${config};</script>`);
      response.writeHead(200, { "Content-Type": mime[ext] });
      response.end(request.method === "HEAD" ? undefined : html);
      return;
    }
    if (mode === "source" && !target.startsWith(path.join(root, "src") + path.sep)) { response.writeHead(404).end("Not found"); return; }
    const content = await readFile(target);
    response.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    if (!path.extname(pathname)) {
      try {
        let html = await readFile(path.join(base, "index.html"), "utf8");
        html = html.replace("<!-- recipe-share-runtime-config -->", `<script>window.RECIPE_SHARE_CONFIG=${config};</script>`);
        response.writeHead(200, { "Content-Type": mime[".html"] }); response.end(html);
      } catch { response.writeHead(404).end("Not found"); }
    } else response.writeHead(404).end("Not found");
  }
}).listen(Number(process.env.PORT || 4173), "127.0.0.1", () => console.log(`RecipeShare ${mode} server: http://localhost:${process.env.PORT || 4173}`));
