#!/usr/bin/env node
/**
 * Build brand assets — favicons, app icons, and OG cards — for both the
 * portfolio and the blog. Icons come from mark.svg / maskable.svg; the two
 * default social cards come from the shared card template (og-card.mjs).
 *
 * Usage:
 *   node scripts/brand/build-brand.mjs
 *
 * Outputs:
 *   public/favicon.ico                              (16, 32, 48)
 *   public/apple-touch-icon.png                     (180×180)
 *   public/icons/icon-192.png                       (192×192)
 *   public/icons/icon-512.png                       (512×512)
 *   public/icons/icon-maskable-512.png              (512×512, safe zone)
 *   public/icons/logo.svg                           (vector master)
 *   public/images/og-image.png                      (1200×630)
 *   public/images/og-image.webp                     (1200×630)
 *
 *   blog-site/static/img/favicon.ico                (mirrored)
 *   blog-site/static/img/apple-touch-icon.png
 *   blog-site/static/img/logo.svg                   (replaces Docusaurus cat)
 *   blog-site/static/img/icon-192.png
 *   blog-site/static/img/icon-512.png
 *   blog-site/static/img/icon-maskable-512.png
 *   blog-site/static/img/og-default.png             (default social card)
 *   blog-site/static/img/og-default.webp
 *   blog-site/static/img/social-card.jpg            (Docusaurus config target)
 */
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { renderCards, WORDMARK } from "./og-card.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const BRAND = __dirname;

const PORTFOLIO_PUBLIC = join(REPO, "public");
const BLOG_STATIC = join(REPO, "blog-site", "static", "img");

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function svgToPng(svgPath, size) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function writePng(buf, dest) {
  await ensureDir(dirname(dest));
  await writeFile(dest, buf);
  console.log("  →", dest.replace(REPO + "/", ""));
}

async function build() {
  console.log("Building brand assets...");

  const markSvg = join(BRAND, "mark.svg");
  const maskableSvg = join(BRAND, "maskable.svg");

  // 1. Master SVG mark — copied verbatim to both sites.
  const markRaw = await readFile(markSvg);
  await ensureDir(join(PORTFOLIO_PUBLIC, "icons"));
  await ensureDir(BLOG_STATIC);
  await writeFile(join(PORTFOLIO_PUBLIC, "icons", "logo.svg"), markRaw);
  await writeFile(join(BLOG_STATIC, "logo.svg"), markRaw);
  console.log("  → public/icons/logo.svg");
  console.log("  → blog-site/static/img/logo.svg");

  // 2. PNG raster targets from mark.svg.
  const pngTargets = [16, 32, 48, 64, 180, 192, 512];
  const rendered = {};
  for (const size of pngTargets) {
    rendered[size] = await svgToPng(markSvg, size);
  }

  // 3. favicon.ico — bundles 16, 32, 48.
  const ico = await pngToIco([rendered[16], rendered[32], rendered[48]]);
  await writeFile(join(PORTFOLIO_PUBLIC, "favicon.ico"), ico);
  await writeFile(join(BLOG_STATIC, "favicon.ico"), ico);
  console.log("  → public/favicon.ico");
  console.log("  → blog-site/static/img/favicon.ico");

  // 4. apple-touch-icon (180×180).
  await writePng(rendered[180], join(PORTFOLIO_PUBLIC, "apple-touch-icon.png"));
  await writePng(rendered[180], join(BLOG_STATIC, "apple-touch-icon.png"));

  // 5. Web app icons (192, 512).
  await writePng(rendered[192], join(PORTFOLIO_PUBLIC, "icons", "icon-192.png"));
  await writePng(rendered[512], join(PORTFOLIO_PUBLIC, "icons", "icon-512.png"));
  await writePng(rendered[192], join(BLOG_STATIC, "icon-192.png"));
  await writePng(rendered[512], join(BLOG_STATIC, "icon-512.png"));

  // 6. Maskable icon (512×512).
  const maskable = await svgToPng(maskableSvg, 512);
  await writePng(maskable, join(PORTFOLIO_PUBLIC, "icons", "icon-maskable-512.png"));
  await writePng(maskable, join(BLOG_STATIC, "icon-maskable-512.png"));

  // 7–8. Default social cards: the portfolio's and the handbook's.
  const [ogP, ogB] = await renderCards([
    {
      wordmark: WORDMARK.portfolio,
      titleHtml: 'José Camilo <span class="muted">Joga Guerrero.</span>',
      description: "DevOps & Cloud Engineer",
      domain: "cjoga.cloud",
    },
    {
      wordmark: WORDMARK.handbook,
      titleHtml: 'Opinions, the lab, <span class="muted">and cert guides.</span>',
      domain: "blog.cjoga.cloud",
    },
  ]);

  await writePng(await sharp(ogP).png({ compressionLevel: 9 }).toBuffer(), join(PORTFOLIO_PUBLIC, "images", "og-image.png"));
  await sharp(ogP)
    .webp({ quality: 88 })
    .toFile(join(PORTFOLIO_PUBLIC, "images", "og-image.webp"));
  console.log("  → public/images/og-image.webp");

  await writePng(await sharp(ogB).png({ compressionLevel: 9 }).toBuffer(), join(BLOG_STATIC, "og-default.png"));
  await sharp(ogB)
    .webp({ quality: 88 })
    .toFile(join(BLOG_STATIC, "og-default.webp"));
  console.log("  → blog-site/static/img/og-default.webp");
  // Docusaurus default social card path is still referenced by some
  // historical config; mirror to social-card.jpg too.
  await sharp(ogB)
    .jpeg({ quality: 88 })
    .toFile(join(BLOG_STATIC, "social-card.jpg"));
  console.log("  → blog-site/static/img/social-card.jpg");

  console.log("Done.");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
