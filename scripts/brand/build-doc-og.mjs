#!/usr/bin/env node
/**
 * Build per-doc OG images for the blog. Walks `blog-site/docs/**`, extracts
 * each MDX's frontmatter (title, description, slug), renders a unique
 * 1200×630 cover with the shared card template (og-card.mjs, Mona Sans in
 * Chromium), and writes it to `blog-site/static/img/og/<flat-slug>.png`.
 *
 * Also patches each doc's frontmatter with `image: img/og/<flat-slug>.png`
 * if it isn't already set, so Docusaurus picks it up for OG/Twitter automatically.
 *
 * Idempotent — re-runs regenerate images but never re-patch existing image keys.
 *
 * Usage:
 *   node scripts/brand/build-doc-og.mjs
 */
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { renderCards, twoTone, WORDMARK } from "./og-card.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const DOCS = join(REPO, "blog-site", "docs");
const OUT = join(REPO, "blog-site", "static", "img", "og");

// ── Parse frontmatter (between two `---` fences). Lightweight YAML reader
//    handling `key: value` and `key: [a, b, c]` — enough for our docs. ──
function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, body: raw, raw, hasFM: false };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw, raw, hasFM: false };
  const fmBlock = raw.slice(3, end).trim();
  const rest = raw.slice(end + 4); // skip "\n---"
  const data = {};
  const lines = fmBlock.split("\n");
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, body: rest, raw, fmBlock, hasFM: true };
}

function rewriteFrontmatter(originalRaw, imageValue) {
  const fmEnd = originalRaw.indexOf("\n---", 3);
  if (fmEnd === -1 || !originalRaw.startsWith("---")) return originalRaw;
  const fmBlock = originalRaw.slice(3, fmEnd);
  const rest = originalRaw.slice(fmEnd + 4);
  if (/\nimage:\s/.test(fmBlock) || /^image:\s/.test(fmBlock)) return originalRaw;
  const insertLine = `image: ${imageValue}`;
  // Keep frontmatter ordering predictable: prepend image right after `title`.
  const lines = fmBlock.split("\n");
  let inserted = false;
  const out = [];
  for (const line of lines) {
    out.push(line);
    if (!inserted && /^title:\s/.test(line)) {
      out.push(insertLine);
      inserted = true;
    }
  }
  if (!inserted) out.push(insertLine);
  return `---${out.join("\n")}\n---${rest}`;
}

// ── Recursive walker for .mdx/.md ──────────────────────────────────────
async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(mdx|md)$/.test(e.name)) out.push(full);
  }
  return out;
}

// ── Section label from the slug: the top-level part (Me / Engineering /
//    Learn), plus the group below it when there is one (Opinions, Lab, Work).
const SECTION_NAMES = {
  me: "Me",
  engineering: "Engineering",
  learn: "Learn",
  opinions: "Opinions",
  lab: "Lab",
  work: "Work",
};

function sectionFor(slug) {
  const [top, group] = slug.split("/").filter(Boolean);
  const parts = [SECTION_NAMES[top], SECTION_NAMES[group]].filter(Boolean);
  return parts.join(" · ");
}

// ── Slug → safe filename ──────────────────────────────────────────────
function slugToFilename(slug) {
  return (
    slug
      .replace(/^\/+/, "")
      .replace(/\/+/g, "-")
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase() || "index"
  );
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = await walk(DOCS);
  console.log(`Found ${files.length} doc files.`);

  let patched = 0;
  const docs = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, hasFM } = parseFrontmatter(raw);
    if (!hasFM) {
      console.log(`  skip (no frontmatter): ${relative(REPO, file)}`);
      continue;
    }
    const slug = data.slug || ("/" + relative(DOCS, file).replace(/\.(mdx|md)$/, "").replace(/\/index$/, ""));
    const title = data.title || slug;
    const description = data.description || "";
    const filename = `${slugToFilename(slug)}.png`;
    docs.push({ file, raw, slug, title, description, filename });
  }

  // One browser for every card.
  const pngs = await renderCards(
    docs.map((d) => ({
      wordmark: WORDMARK.handbook,
      section: sectionFor(d.slug),
      titleHtml: twoTone(d.title),
      description: d.description,
      domain: "blog.cjoga.cloud",
    })),
  );

  for (const [i, d] of docs.entries()) {
    const outPath = join(OUT, d.filename);
    await sharp(pngs[i]).png({ compressionLevel: 9 }).toFile(outPath);

    // Patch frontmatter with image reference if absent.
    const imageRef = `img/og/${d.filename}`;
    const newRaw = rewriteFrontmatter(d.raw, imageRef);
    if (newRaw !== d.raw) {
      await writeFile(d.file, newRaw);
      patched++;
    }
    console.log(`  og: ${relative(REPO, outPath)} ← ${d.slug}`);
  }
  const generated = docs.length;

  console.log(`\nGenerated ${generated} OG images. Patched frontmatter on ${patched} docs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
