#!/usr/bin/env node
// WCAG contrast gate for the brand tokens.
//
// Two palettes are checked:
//   handbook — scripts/brand/tokens.css, the shared block synced into both
//              sites.
//   site     — what the portfolio actually ships: every :root and
//              [data-theme="light"] block in src/styles/global.css, merged
//              in cascade order, so later overrides of the synced block are
//              what gets measured.
// Colours may be hex or rgba(); a translucent background is composited
// over the surface it sits on ("--accent-dim over --bg-void"), which is
// how accent text on its own tint is checked. Tolerates a missing
// tokens.css (that palette is skipped with a warning).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tokensPath = join(here, "tokens.css");
const sitePath = join(here, "..", "..", "src", "styles", "global.css");

const COLOR = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\s*;/g;

// Merge every block whose selector is exactly `selector`, in file order.
const collect = (css, selectorRe) => {
  const vars = {};
  for (const block of css.matchAll(new RegExp(`(?:^|\\n)\\s*${selectorRe}\\s*{([^}]*)}`, "g"))) {
    for (const m of block[1].matchAll(COLOR)) vars[m[1]] = m[2];
  }
  return vars;
};

const parse = (value) => {
  if (value.startsWith("#")) {
    const h = value.slice(1);
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1);
  }
  const [r, g, b, a = 1] = value.match(/[\d.]+/g).map(Number);
  return [r, g, b, a];
};

// Resolve "--fg" or "--top over --base" to an opaque [r, g, b].
const resolve = (vars, spec) => {
  const layers = spec.split(/\s+over\s+/).map((name) => {
    const v = vars[name];
    if (!v) throw new Error(`${name} missing`);
    return parse(v);
  });
  let [r, g, b] = layers[layers.length - 1];
  for (let i = layers.length - 2; i >= 0; i--) {
    const [lr, lg, lb, la] = layers[i];
    [r, g, b] = [lr * la + r * (1 - la), lg * la + g * (1 - la), lb * la + b * (1 - la)];
  }
  return [r, g, b];
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Pairs both palettes must meet: [theme, fg, bg, min].
const CORE = [
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

// Pairs the portfolio's components rely on: text on cards, and accent
// text on its own tint (chips, badges, the active nav item).
const SITE = [
  ["dark", "--text-tertiary", "--bg-void", 4.5],
  ["dark", "--text-tertiary", "--bg-surface", 4.5],
  ["dark", "--accent-ink", "--accent-dim over --bg-void", 4.5],
  ["dark", "--accent-ink", "--accent-dim over --bg-surface", 4.5],
  ["light", "--accent", "--bg-surface", 4.5],
  ["light", "--text-secondary", "--bg-surface", 4.5],
  ["light", "--text-tertiary", "--bg-surface", 4.5],
  ["light", "--text-tertiary", "--bg-elevated", 4.5],
  ["light", "--accent-ink", "--accent-dim over --bg-void", 4.5],
  ["light", "--accent-ink", "--accent-dim over --bg-surface", 4.5],
  ["light", "--accent-ink", "--accent-dim over --bg-elevated", 4.5],
];

const palettes = [];
if (existsSync(tokensPath)) {
  const css = readFileSync(tokensPath, "utf8");
  palettes.push({
    name: "handbook",
    dark: collect(css, "(?::root|\\.dark)"),
    light: collect(css, '(?:\\[data-theme="light"\\]|\\.light)'),
    pairs: CORE,
  });
} else {
  console.warn("contrast:check — scripts/brand/tokens.css not found; skipping the handbook palette.");
}
if (existsSync(sitePath)) {
  const css = readFileSync(sitePath, "utf8");
  palettes.push({
    name: "site",
    dark: collect(css, ":root"),
    light: collect(css, '\\[data-theme="light"\\]'),
    pairs: [...CORE, ...SITE],
  });
}

let failures = 0;
for (const palette of palettes) {
  for (const [theme, fg, bg, min] of palette.pairs) {
    const vars = palette[theme];
    const label = `[${palette.name}/${theme}] ${fg} on ${bg}`;
    let r;
    try {
      r = ratio(resolve(vars, fg), resolve(vars, bg));
    } catch (err) {
      console.error(`FAIL ${label}: ${err.message}`);
      failures++;
      continue;
    }
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? " ok " : "FAIL"} ${label} = ${r.toFixed(2)}:1 (min ${min})`);
  }
}

if (failures) {
  console.error(`\ncontrast:check — ${failures} failing pair(s).`);
  process.exit(1);
}
console.log("\ncontrast:check — all pairs pass.");
