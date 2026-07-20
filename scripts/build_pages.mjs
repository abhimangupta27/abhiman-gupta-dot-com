import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "_site");
const measurementId = process.env.GA_MEASUREMENT_ID?.trim();

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

if (measurementId && !/^G-[A-Z0-9]+$/.test(measurementId)) {
  throw new Error("GA_MEASUREMENT_ID must be a Google Analytics 4 ID such as G-ABC123DEF4.");
}

function analyticsSnippet(id) {
  return `  <!-- Google Analytics 4 (injected only in the GitHub Pages build) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    gtag('set', 'ads_data_redaction', true);
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    gtag('js', new Date());
    gtag('config', '${id}', {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  </script>`;
}

async function injectAnalytics(directory, id) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await injectAnalytics(path, id);
      continue;
    }
    if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".html") continue;

    const html = await readFile(path, "utf8");
    if (!html.includes("</head>")) {
      throw new Error(`Cannot inject Google Analytics because ${path} has no </head> tag.`);
    }
    await writeFile(path, html.replace("</head>", `${analyticsSnippet(id)}\n</head>`));
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of publicEntries) {
  await cp(join(root, entry), join(output, entry), { recursive: true });
}

if (measurementId) {
  await injectAnalytics(output, measurementId);
  console.log(`Added Google Analytics ${measurementId} to the GitHub Pages output.`);
} else {
  console.log("Skipped Google Analytics because GA_MEASUREMENT_ID is not set.");
}

// Prevent any alternate Pages/Jekyll processing from changing the curated output.
await writeFile(join(output, ".nojekyll"), "");

console.log(`Built ${publicEntries.length} public entries for GitHub Pages.`);
