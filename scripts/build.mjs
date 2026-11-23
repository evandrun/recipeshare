import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

async function readLocalEnv() {
  const values = {};
  const file = path.join(root, ".env");
  if (!existsSync(file)) return values;
  for (const line of (await readFile(file, "utf8")).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return values;
}

const local = await readLocalEnv();
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || local.VITE_SUPABASE_URL || "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || local.VITE_SUPABASE_ANON_KEY || "",
};
const safeConfig = JSON.stringify(config).replaceAll("<", "\\u003c");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "src"), path.join(output, "src"), { recursive: true });
await cp(path.join(root, "privacy.html"), path.join(output, "privacy.html"));
const html = await readFile(path.join(root, "index.html"), "utf8");
await writeFile(path.join(output, "index.html"), html.replace("<!-- recipe-share-runtime-config -->", `<script>window.RECIPE_SHARE_CONFIG=${safeConfig};</script>`));
console.log("Built RecipeShare into dist/");
