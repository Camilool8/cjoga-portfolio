#!/usr/bin/env node
// Propagates the canonical brand token block (scripts/brand/tokens.css)
// into both stylesheets, between `/* @brand-tokens:start */` and
// `/* @brand-tokens:end */` markers. Selector names are translated per
// target in case the two sites ever use different theme selectors
// (both currently use `:root` + `[data-theme="light"]`).
//
// Usage:
//   node scripts/brand/sync-tokens.mjs          # write
//   node scripts/brand/sync-tokens.mjs --check  # diff only; exit 1 on drift
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const tokensPath = join(here, "tokens.css");

const START = "/* @brand-tokens:start */";
const END = "/* @brand-tokens:end */";

// tokens.css convention: `:root` = dark theme, `[data-theme="light"]` = light.
const TARGETS = [
  {
    file: join(repoRoot, "src", "styles", "global.css"),
    dark: ":root",
    light: '[data-theme="light"]',
  },
  {
    file: join(repoRoot, "blog-site", "src", "css", "custom.css"),
    dark: ":root",
    light: '[data-theme="light"]',
  },
];

const check = process.argv.includes("--check");

const tokensCss = readFileSync(tokensPath, "utf8");

// Strip the file-header comment; keep only the selector blocks.
const blocks = tokensCss.match(/(?::root|\[data-theme="light"\])\s*{[^}]*}/gs);
if (!blocks || blocks.length !== 2) {
  console.error("sync-tokens: expected exactly a `:root` and a `[data-theme=\"light\"]` block in tokens.css.");
  process.exit(1);
}
const canonical = blocks.join("\n\n");

const translate = (css, target) =>
  css
    .replace(/^:root(?=\s*{)/m, target.dark)
    .replace(/^\[data-theme="light"\](?=\s*{)/m, target.light);

let drift = 0;
for (const target of TARGETS) {
  const rel = relative(repoRoot, target.file);
  const src = readFileSync(target.file, "utf8");
  const startIdx = src.indexOf(START);
  const endIdx = src.indexOf(END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.error(`sync-tokens: markers missing or malformed in ${rel}.`);
    process.exit(1);
  }

  const expectedInner = `\n${translate(canonical, target)}\n`;
  const currentInner = src.slice(startIdx + START.length, endIdx);

  if (currentInner === expectedInner) {
    console.log(` ok  ${rel} — in sync`);
    continue;
  }

  if (check) {
    console.error(`DRIFT ${rel} — token block differs from scripts/brand/tokens.css`);
    drift++;
    continue;
  }

  const next = src.slice(0, startIdx + START.length) + expectedInner + src.slice(endIdx);
  writeFileSync(target.file, next);
  console.log(`sync ${rel} — token block rewritten`);
}

if (check && drift) {
  console.error(`\nsync-tokens --check: ${drift} file(s) drifted. Run \`node scripts/brand/sync-tokens.mjs\` to fix.`);
  process.exit(1);
}
