#!/usr/bin/env node
/**
 * Build-time prerender for the portfolio SPA.
 *
 * Serves the built `dist/` through a tiny static server, loads `/` and
 * `/es/` in headless chromium, waits for the app's own readiness flag
 * (`html[data-prerender-ready="true"]`, set by App.jsx after i18n has
 * resolved and the tree has painted), and writes the rendered document
 * back to `dist/index.html` and `dist/es/index.html`.
 *
 * All scripts are kept in the snapshot: the client bundle re-renders via
 * createRoot over the prerendered DOM (accepted behavior — do NOT switch
 * to hydrateRoot). Idempotent: the SPA fallback always serves the
 * ORIGINAL built index.html (read into memory before anything is
 * overwritten), so re-runs never snapshot a snapshot.
 *
 * Usage: npm run build && node scripts/prerender.mjs
 * Env:   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH — system chromium (Docker).
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const ORIGIN = "https://cjoga.cloud";

const ES_TITLE = "Jose Camilo Joga Guerrero | Ingeniero DevOps y Cloud";
// Derived from public/locales/es/translation.json hero.description (≤160).
const ES_DESCRIPTION =
  "Ingeniero DevOps y Cloud que construye plataformas de Kubernetes sobre " +
  "AWS y Azure con Terraform, GitOps y observabilidad. Portafolio de Camilo Joga.";
const ES_OG_TITLE = "Jose Camilo Joga Guerrero — Ingeniero DevOps y Cloud";

const ROUTES = [
  { route: "/", out: "index.html", lang: "en", canonical: `${ORIGIN}/` },
  { route: "/es/", out: "es/index.html", lang: "es", canonical: `${ORIGIN}/es/` },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("prerender: dist/index.html not found — run `npm run build` first.");
  process.exit(1);
}

// The idempotency guard: capture the pristine SPA shell BEFORE any route
// overwrites dist/index.html, and serve it for every SPA path.
const originalIndex = fs.readFileSync(path.join(DIST, "index.html"));

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);

  // The hero does a single /api/health fetch; answer like prod does so the
  // snapshot captures the steady-state "systems online" strip.
  if (urlPath === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (urlPath.startsWith("/api/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  const filePath = path.join(DIST, urlPath);
  if (
    filePath.startsWith(DIST) &&
    !urlPath.endsWith("/") &&
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isFile()
  ) {
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // SPA fallback — always the original shell, never a prerendered snapshot.
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(originalIndex);
});

const replaceOnce = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) {
    throw new Error(`prerender: could not find ${label} in captured HTML`);
  }
  return html.replace(pattern, replacement);
};

const fixupHead = (html, { lang, canonical }) => {
  // The readiness flag is transient app state — keep it out of the snapshot.
  let out = html.replace(/\s*data-prerender-ready="true"/, "");

  out = replaceOnce(out, /<html\s+lang="[^"]*"/, `<html lang="${lang}"`, "<html lang>");

  // Drop any hreflang alternates already present (e.g. when re-running the
  // prerenderer over a dist/ that was already snapshotted) so the insert
  // below never duplicates them.
  out = out.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, "");

  out = replaceOnce(
    out,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}"/>` +
      `<link rel="alternate" hreflang="en" href="${ORIGIN}/"/>` +
      `<link rel="alternate" hreflang="es" href="${ORIGIN}/es/"/>` +
      `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`,
    "canonical link"
  );

  if (lang === "es") {
    out = replaceOnce(out, /<title>[^<]*<\/title>/, `<title>${ES_TITLE}</title>`, "<title>");
    out = replaceOnce(
      out,
      /(<meta name="description"\s+content=")[^"]*(")/,
      `$1${ES_DESCRIPTION}$2`,
      "meta description"
    );
    out = replaceOnce(
      out,
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${ES_OG_TITLE}$2`,
      "og:title"
    );
    out = replaceOnce(
      out,
      /(<meta property="og:description"\s+content=")[^"]*(")/,
      `$1${ES_DESCRIPTION}$2`,
      "og:description"
    );
    out = replaceOnce(
      out,
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonical}$2`,
      "og:url"
    );
    out = replaceOnce(
      out,
      /(<meta property="og:locale" content=")[^"]*(")/,
      "$1es_DO$2",
      "og:locale"
    );
    out = replaceOnce(
      out,
      /(<meta property="og:locale:alternate" content=")[^"]*(")/,
      "$1en_US$2",
      "og:locale:alternate"
    );
    out = replaceOnce(
      out,
      /(<meta name="twitter:title" content=")[^"]*(")/,
      `$1${ES_OG_TITLE}$2`,
      "twitter:title"
    );
    out = replaceOnce(
      out,
      /(<meta name="twitter:description"\s+content=")[^"]*(")/,
      `$1${ES_DESCRIPTION}$2`,
      "twitter:description"
    );
  }
  return out;
};

const main = async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  console.log(`prerender: serving dist/ on http://127.0.0.1:${port}`);

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const target of ROUTES) {
      const url = `http://127.0.0.1:${port}${target.route}`;
      console.log(`prerender: rendering ${target.route}`);
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(url, { waitUntil: "load", timeout: 30_000 });
      await page.waitForSelector('html[data-prerender-ready="true"]', {
        timeout: 30_000,
      });
      // Best-effort settle; the readiness flag above is the real gate.
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

      const captured = await page.evaluate(
        () => `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
      );
      await page.close();

      const html = fixupHead(captured, target);
      const outPath = path.join(DIST, target.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html);
      console.log(`prerender: wrote dist/${target.out} (${html.length} bytes)`);
    }
  } finally {
    await browser.close();
    server.close();
  }
};

main().catch((err) => {
  console.error(`prerender: failed — ${err.message}`);
  process.exit(1);
});
