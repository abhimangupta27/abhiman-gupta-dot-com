import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "_site");

const publicEntries = [
  "index.html",
  "styles.css",
  "script.js",
  "academia",
  "contact",
  "notes",
  "photography",
  "images",
  "fonts",
  "libs",
  "CNAME",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of publicEntries) {
  await cp(join(root, entry), join(output, entry), { recursive: true });
}

// Prevent any alternate Pages/Jekyll processing from changing the curated output.
await writeFile(join(output, ".nojekyll"), "");

console.log(`Built ${publicEntries.length} public entries for GitHub Pages.`);
