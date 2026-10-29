#!/usr/bin/env node
// Copies the portfolio's orbital scene (src/components/hero/) into the
// handbook (blog-site/src/components/OrbitalScene/). The handbook's
// Docker build only sees blog-site/, so it can't import across the repo;
// the copies carry a generated header and are never edited by hand.
//
// Usage:
//   node scripts/brand/sync-scene.mjs          # write
//   node scripts/brand/sync-scene.mjs --check  # diff only; exit 1 on drift
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const fromDir = join(repoRoot, "src", "components", "hero");
const toDir = join(repoRoot, "blog-site", "src", "components", "OrbitalScene");

const FILES = ["PlanetScene.jsx", "globe.js"];

const check = process.argv.includes("--check");

let drift = 0;
mkdirSync(toDir, { recursive: true });
for (const name of FILES) {
  const source = join(fromDir, name);
  const target = join(toDir, name);
  const rel = relative(repoRoot, target);
  const header =
    `// GENERATED from ${relative(repoRoot, source)} by scripts/brand/sync-scene.mjs.\n` +
    `// Edit the source, then run \`npm run scene:sync\` from the repo root.\n\n`;
  const expected = header + readFileSync(source, "utf8");
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;

  if (current === expected) {
    console.log(` ok  ${rel} — in sync`);
    continue;
  }

  if (check) {
    console.error(`DRIFT ${rel} — differs from ${relative(repoRoot, source)}`);
    drift++;
    continue;
  }

  writeFileSync(target, expected);
  console.log(`sync ${rel} — copied`);
}

if (check && drift) {
  console.error(`\nsync-scene --check: ${drift} file(s) drifted. Run \`npm run scene:sync\` to fix.`);
  process.exit(1);
}
