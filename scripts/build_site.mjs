import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
const serverOutput = join(output, "server", "index.js");

const siteEntries = [
  "index.html",
  "styles.css",
  "script.js",
  "academia",
  "notes",
  "photography",
  "images",
  "fonts",
  "libs",
];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function collectFiles(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    if (entry.isFile()) files.push(entryPath);
  }

  return files;
}

const sourceFiles = [];
for (const entry of siteEntries) {
  const path = join(root, entry);
  if (extname(entry)) sourceFiles.push(path);
  else sourceFiles.push(...(await collectFiles(path)));
}

const assets = {};
for (const path of sourceFiles.sort()) {
  const webPath = `/${relative(root, path).split(sep).join("/")}`;
  const body = await readFile(path);
  assets[webPath] = {
    body: body.toString("base64"),
    type: contentTypes[extname(path).toLowerCase()] || "application/octet-stream",
  };
}

const worker = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function assetPath(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname.endsWith("/")) return pathname + "index.html";
  if (!pathname.split("/").at(-1).includes(".")) return pathname + "/index.html";
  return pathname;
}

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const asset = assets[assetPath(pathname)];
    if (!asset) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": asset.type,
      "X-Content-Type-Options": "nosniff",
    });
    if (asset.type.startsWith("text/html")) {
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else {
      headers.set("Cache-Control", "public, max-age=3600");
    }

    return new Response(request.method === "HEAD" ? null : decodeBase64(asset.body), {
      status: 200,
      headers,
    });
  },
};
`;

await rm(output, { recursive: true, force: true });
await mkdir(join(output, "server"), { recursive: true });
await writeFile(serverOutput, worker);
console.log(`Built ${sourceFiles.length} files for Sites.`);

