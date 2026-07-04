#!/usr/bin/env node
// WCAG contrast gate for the shared brand tokens.
// Reads scripts/brand/tokens.css and asserts every required pair meets its
// threshold. Tolerates a missing tokens.css (exits 0 with a warning) so this
// can run before the design-tokens workstream lands.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const tokensPath = join(dirname(fileURLToPath(import.meta.url)), "tokens.css");

if (!existsSync(tokensPath)) {
  console.warn("contrast:check — scripts/brand/tokens.css not found yet; skipping (OK before WS-A lands).");
  process.exit(0);
}

const css = readFileSync(tokensPath, "utf8");

// Collect custom properties per theme block. Convention in tokens.css:
// `:root`/`.dark` block = dark theme, `[data-theme="light"]`/`.light` = light.
const collect = (blockRe) => {
  const vars = {};
  const block = css.match(blockRe)?.[0] ?? "";
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    vars[m[1]] = m[2];
  }
  return vars;
};

const dark = collect(/(?::root|\.dark)\s*{[^}]*}/s);
const light = collect(/(?:\[data-theme="light"\]|\.light)\s*{[^}]*}/s);

const luminance = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Required pairs: [theme, fg var or hex, bg var or hex, min ratio, label]
const REQUIRED = [
  ["dark", "--accent", "--bg-void", 4.5],
  ["dark", "--accent", "--bg-surface", 4.5],
  ["dark", "--accent", "--bg-elevated", 4.5],
  ["dark", "--accent-secondary", "--bg-void", 4.5],
  ["dark", "--accent-secondary", "--bg-elevated", 4.5],
  ["dark", "--text-primary", "--bg-void", 4.5],
  ["dark", "--text-secondary", "--bg-elevated", 4.5],
  ["dark", "--text-tertiary", "--bg-elevated", 4.5],
  ["dark", "--accent-warm", "--bg-void", 4.5],
  ["light", "--accent", "--bg-void", 4.5],
  ["light", "--accent", "--bg-elevated", 4.5],
  ["light", "--accent-secondary", "--bg-void", 4.5],
  ["light", "--text-secondary", "--bg-void", 4.5],
  ["light", "--text-tertiary", "--bg-void", 4.5],
  ["light", "--accent-warm", "--bg-void", 4.5],
];

let failures = 0;
for (const [theme, fgVar, bgVar, min] of REQUIRED) {
  const vars = theme === "dark" ? dark : light;
  const fg = vars[fgVar];
  const bg = vars[bgVar];
  if (!fg || !bg) {
    console.error(`FAIL [${theme}] ${fgVar} on ${bgVar}: token missing from tokens.css`);
    failures++;
    continue;
  }
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failures++;
  console.log(`${ok ? " ok " : "FAIL"} [${theme}] ${fgVar} (${fg}) on ${bgVar} (${bg}) = ${r.toFixed(2)}:1 (min ${min})`);
}

if (failures) {
  console.error(`\ncontrast:check — ${failures} failing pair(s).`);
  process.exit(1);
}
console.log("\ncontrast:check — all pairs pass.");
