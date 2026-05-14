#!/usr/bin/env node
/**
 * Build per-doc OG images for the blog. Walks `blog-site/docs/**`, extracts
 * each MDX's frontmatter (title, description, slug), renders a unique
 * 1200×630 cover, and writes it to `blog-site/static/img/og/<flat-slug>.png`.
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const DOCS = join(REPO, "blog-site", "docs");
const OUT = join(REPO, "blog-site", "static", "img", "og");

const ACCENT = "#64FFDA";
const ACCENT2 = "#38BDF8";
const TEXT = "#e2e8f0";
const MUTED = "#8892b0";
const SURFACE = "#0B0F1A";
const BG = "#06080d";

// ── XML escape so titles with `<`, `&`, etc. don't blow up the SVG. ────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Crude word-wrap. Targets a max-char count per line for the chosen
//    font size; good enough for OG cards where titles are short. Always
//    appends an ellipsis when content was dropped due to maxLines so the
//    reader sees the strapline was cut, not just chopped mid-thought. ──
function wrapWords(text, maxCharsPerLine, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  let truncated = false;

  for (const w of words) {
    if (lines.length >= maxLines) {
      truncated = true;
      break;
    }
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }

  if (current) {
    if (lines.length < maxLines) {
      lines.push(current);
      current = "";
    } else {
      truncated = true;
    }
  }

  if (truncated && lines.length > 0) {
    const idx = lines.length - 1;
    let last = lines[idx];
    if (last.length > maxCharsPerLine - 1) {
      last = last.slice(0, maxCharsPerLine - 1).trimEnd();
    }
    lines[idx] = last.replace(/[,;:—–-]+$/, "") + "…";
  }
  return lines;
}

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

// ── Section tag inferred from slug ────────────────────────────────────
function sectionFor(slug) {
  const seg = slug.split("/").filter(Boolean)[0] || "handbook";
  return seg.toUpperCase();
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

function svgForDoc({ title, description, slug }) {
  const sec = sectionFor(slug);
  // Title sizing — fewer chars per line as font scales up. We pick a font
  // size per line count so single-line titles get the loudest treatment.
  const tentativeTwo = wrapWords(title, 22, 2);
  const titleLines = tentativeTwo;
  const titleFont = titleLines.length === 1 ? 110 : 88;
  const titleLineHeight = titleLines.length === 1 ? 0 : 96;

  // Description: 2 lines max, monospace, sits below the rule like a strapline.
  const descLines = wrapWords(description || "", 78, 2);

  const titleSpans = titleLines
    .map(
      (line, i) =>
        `<tspan x="0" y="${i * titleLineHeight}" fill="${
          i === titleLines.length - 1 ? "url(#brand)" : TEXT
        }">${esc(line)}</tspan>`,
    )
    .join("");

  // Description text — left-aligned, in the lower band below the accent rule.
  const descSpans = descLines
    .map(
      (line, i) =>
        `<text x="64" y="${510 + i * 32}" fill="${MUTED}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="22" font-weight="400">${esc(line)}</text>`,
    )
    .join("");

  // Compute a sensible chip width from the slug length so it always frames
  // the text without being lopsided.
  const slugChipWidth = Math.max(slug.length * 11 + 32, 160);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0e1a"/>
        <stop offset="100%" stop-color="#04060b"/>
      </linearGradient>
      <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${ACCENT}"/>
        <stop offset="100%" stop-color="${ACCENT2}"/>
      </linearGradient>
      <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.28"/>
        <stop offset="55%" stop-color="${ACCENT}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${ACCENT2}" stop-opacity="0.20"/>
        <stop offset="55%" stop-color="${ACCENT2}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.1" fill="${ACCENT}" fill-opacity="0.10"/>
      </pattern>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#dots)"/>
    <circle cx="1100" cy="100" r="360" fill="url(#orb1)"/>
    <circle cx="120" cy="580" r="420" fill="url(#orb2)"/>

    <!-- Masthead -->
    <line x1="64" y1="80" x2="1136" y2="80" stroke="${ACCENT}" stroke-opacity="0.22" stroke-width="1"/>
    <g transform="translate(64 60)">
      <text fill="${ACCENT}" font-family="Menlo, Monaco, 'Courier New', monospace"
            font-size="13" font-weight="500" letter-spacing="0.22em">BLOG.CJOGA.CLOUD · CAMILO'S HANDBOOK · ${esc(sec)}</text>
    </g>
    <g transform="translate(1136 60)" text-anchor="end">
      <text fill="rgba(136,146,176,0.7)" font-family="Menlo, Monaco, 'Courier New', monospace"
            font-size="13" font-weight="500" letter-spacing="0.22em" text-anchor="end">VOL. II — HANDBOOK</text>
    </g>

    <!-- Brand mark + slug chip -->
    <g transform="translate(64 124)">
      <rect width="78" height="78" rx="16" fill="#0a0e1a" stroke="${ACCENT}" stroke-opacity="0.28" stroke-width="1"/>
      <g transform="translate(11 11) scale(0.22)">
        <g fill="url(#brand)">
          <circle cx="90" cy="86" r="22"/>
          <circle cx="128" cy="68" r="30"/>
          <circle cx="168" cy="86" r="24"/>
          <rect x="74" y="92" width="110" height="26" rx="13"/>
        </g>
        <text x="128" y="204"
              fill="url(#brand)"
              font-family="ui-monospace, Menlo, 'JetBrains Mono', 'Courier New', monospace"
              font-size="118" font-weight="900"
              text-anchor="middle" letter-spacing="-0.04em">CJ</text>
      </g>
    </g>
    <g transform="translate(164 153)">
      <rect width="${slugChipWidth}" height="42" rx="10" fill="rgba(100,255,218,0.06)"
            stroke="rgba(100,255,218,0.22)" stroke-width="1"/>
      <text x="18" y="27" fill="${ACCENT}"
            font-family="Menlo, Monaco, 'Courier New', monospace"
            font-size="17" font-weight="500" letter-spacing="0.04em">${esc(slug)}</text>
    </g>

    <!-- Eyebrow — section name with decorative rule -->
    <g transform="translate(64 256)">
      <circle cx="6" cy="-7" r="6" fill="${ACCENT}"/>
      <text x="22" y="0" fill="${ACCENT}"
            font-family="Menlo, Monaco, 'Courier New', monospace"
            font-size="17" font-weight="500" letter-spacing="0.22em">HANDBOOK · ${esc(sec)}</text>
      <line x1="${22 + 14 * (10 + sec.length)}" y1="-7" x2="900" y2="-7"
            stroke="${ACCENT}" stroke-opacity="0.22" stroke-width="1"/>
    </g>

    <!-- Title — the masthead of the card. y origin sits well below the eyebrow
         so the cap-line never reaches up into it. -->
    <g transform="translate(64 ${titleLines.length === 1 ? 410 : 350})">
      <text font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
            font-size="${titleFont}" font-weight="800" letter-spacing="-0.04em">
        ${titleSpans}
      </text>
    </g>

    <!-- Short accent rule between title and description -->
    <line x1="64" y1="478" x2="180" y2="478" stroke="${ACCENT}" stroke-opacity="0.7" stroke-width="2"/>

    <!-- Description -->
    ${descSpans}

  </svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = await walk(DOCS);
  console.log(`Found ${files.length} doc files.`);

  let generated = 0;
  let patched = 0;

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
    const outPath = join(OUT, filename);

    const svg = svgForDoc({ title, description, slug });
    await sharp(Buffer.from(svg), { density: 220 })
      .resize(1200, 630, { fit: "fill" })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    generated++;

    // Patch frontmatter with image reference if absent.
    const imageRef = `img/og/${filename}`;
    const newRaw = rewriteFrontmatter(raw, imageRef);
    if (newRaw !== raw) {
      await writeFile(file, newRaw);
      patched++;
    }
    console.log(`  og: ${relative(REPO, outPath)} ← ${slug}`);
  }

  console.log(`\nGenerated ${generated} OG images. Patched frontmatter on ${patched} docs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
