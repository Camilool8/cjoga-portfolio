#!/usr/bin/env node
// One-off migration: pull homelab posts from Supabase and emit MDX files
// into blog/ with proper frontmatter. Downloads cover images alongside.
//
// Filter: posts whose tags include "home-lab" or whose slug starts with
// "home-lab-". Skips everything else.
//
// Run from blog-site/: `node scripts/migrate-from-supabase.mjs`

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: path.resolve("../.env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const BLOG_DIR = path.resolve("blog");
const IMG_DIR = path.resolve("static/img/blog");

function yamlEscape(str) {
  if (str == null) return '""';
  const s = String(str);
  if (/[:'"#\n]/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

function isHomelabPost(post) {
  const tags = post.tags || [];
  return (
    tags.some((t) => /home.?lab/i.test(t)) ||
    /^home.?lab/i.test(post.slug)
  );
}

async function downloadCover(url, slug) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ext = path.extname(new URL(url).pathname) || ".webp";
    const filename = `${slug}${ext}`;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(IMG_DIR, { recursive: true });
    await fs.writeFile(path.join(IMG_DIR, filename), buf);
    return `/img/blog/${filename}`;
  } catch (err) {
    console.warn(`  ⚠ cover download failed for ${slug}: ${err.message}`);
    return null;
  }
}

function escapeMdxBraces(content) {
  // MDX 3 treats `{` and `}` as JSX expressions. Escape literal braces
  // that aren't inside fenced code blocks or inline code.
  const lines = content.split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      if (/^```/.test(line.trim())) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      // Don't touch inline code spans
      return line.replace(/(`[^`]*`)|([{}])/g, (m, code, brace) => {
        if (code) return code;
        return `\\${brace}`;
      });
    })
    .join("\n");
}

function buildFrontmatter(post, coverPath) {
  const dateIso = post.published_at || post.created_at;
  const date = new Date(dateIso).toISOString().slice(0, 10);

  const lines = [
    "---",
    `slug: ${post.slug}`,
    `title: ${yamlEscape(post.title)}`,
    `date: ${dateIso}`,
    `authors: [camilo]`,
  ];

  if (post.tags && post.tags.length) {
    const normalized = post.tags.map((t) => {
      // Normalize tag formats: "Home Lab" → "home-lab", "RHCSA" → "RHCSA"
      // For our tags.yml ids, lowercase + hyphenate the well-known ones.
      const lower = t.toLowerCase().replace(/\s+/g, "-");
      return lower;
    });
    lines.push(`tags: [${normalized.map(yamlEscape).join(", ")}]`);
  }

  if (post.excerpt) {
    lines.push(`description: ${yamlEscape(post.excerpt)}`);
  }

  if (coverPath) {
    lines.push(`image: ${coverPath}`);
  }

  if (post.seo_keywords) {
    const rawKws = Array.isArray(post.seo_keywords)
      ? post.seo_keywords
      : String(post.seo_keywords).split(",");
    const kws = rawKws.map((s) => String(s).trim()).filter(Boolean);
    if (kws.length) {
      lines.push(`keywords: [${kws.map(yamlEscape).join(", ")}]`);
    }
  }

  lines.push("---", "");
  return { content: lines.join("\n"), date };
}

async function writePost(post) {
  console.log(`\n→ ${post.slug}`);
  const coverPath = await downloadCover(post.cover_image, post.slug);
  const { content: frontmatter, date } = buildFrontmatter(post, coverPath);

  let body = post.content || "";
  // Inject an MDX-compatible truncate marker after the first paragraph
  // so the blog index shows a clean preview. MDX 3 doesn't accept
  // `<!--truncate-->`; use the JSX comment form.
  const TRUNCATE = "{/* truncate */}";
  const truncateIdx = body.indexOf("\n\n");
  if (truncateIdx > 0 && body.indexOf(TRUNCATE) === -1) {
    body =
      body.slice(0, truncateIdx) +
      `\n\n${TRUNCATE}\n` +
      body.slice(truncateIdx);
  }

  body = escapeMdxBraces(body);

  const filename = `${date}-${post.slug}.mdx`;
  const fullPath = path.join(BLOG_DIR, filename);
  await fs.writeFile(fullPath, frontmatter + body + "\n", "utf8");
  console.log(`  ✓ wrote ${filename} (${body.length} chars)`);
  if (coverPath) console.log(`  ✓ cover → ${coverPath}`);
}

async function main() {
  console.log("Querying Supabase...");
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  const homelab = data.filter(isHomelabPost);
  console.log(`Found ${data.length} published posts; ${homelab.length} match homelab filter.`);

  await fs.mkdir(BLOG_DIR, { recursive: true });

  for (const post of homelab) {
    try {
      await writePost(post);
    } catch (err) {
      console.error(`  ✗ ${post.slug}:`, err.message);
    }
  }

  console.log("\nDone.");
}

main();
