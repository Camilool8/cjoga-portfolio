/**
 * Social cards (1200×630) for both sites, rendered as HTML in Chromium so
 * they set in the self-hosted Mona Sans — librsvg (sharp) can't load
 * webfonts and fell back to Helvetica. One template, filled per card:
 *
 *   mark + wordmark (top left)            section label (top right)
 *   title, two-tone where the copy has a natural break
 *   description, Moon Gray, at most two lines
 *   domain (bottom left)                  planet limb rising (bottom right)
 *
 * The limb is the handbook landing's horizon: a dark body with a thin
 * mint rim, one faint orbit and a satellite. Graphics only, no labels.
 *
 * Chromium comes from Playwright (installed in blog-site/node_modules for
 * rehype-mermaid); the executable is PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
 * or /usr/bin/chromium.
 */
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const FONTS = join(REPO, "public", "fonts");

const requireFromBlog = createRequire(join(REPO, "blog-site", "package.json"));

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Deterministic starfield, so re-runs produce identical images.
function stars() {
  let s = 1729;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  let out = "";
  for (let i = 0; i < 46; i++) {
    const x = 560 + rand() * 640;
    const y = 24 + rand() * 360;
    const r = 0.6 + rand() * 1.1;
    const a = 0.12 + rand() * 0.38;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#e2e8f0" fill-opacity="${a.toFixed(2)}"/>`;
  }
  return out;
}

// Planet centre and radius: the limb tops out at y=420 near the right
// edge and leaves the text column clear (its left edge stays right of
// x≈814 down to the description's last line).
const PX = 1080;
const PY = 1040;
const PR = 620;

// One slightly inclined orbit just outside the limb; it fades out toward
// the text column (as the hero's orbits do) and its satellite sits in the
// open sky right of the title.
const ORBIT = { rx: 720, ry: 660, tilt: -8 };
const SAT_T = (278 * Math.PI) / 180;

function orbitPoint(t) {
  const x = ORBIT.rx * Math.cos(t);
  const y = ORBIT.ry * Math.sin(t);
  const a = (ORBIT.tilt * Math.PI) / 180;
  return [PX + x * Math.cos(a) - y * Math.sin(a), PY + x * Math.sin(a) + y * Math.cos(a)];
}

const [SX, SY] = orbitPoint(SAT_T);
const limbLeftX = PX - Math.sqrt(PR ** 2 - (630 - PY) ** 2);
const limbRightY = PY - Math.sqrt(PR ** 2 - (1200 - PX) ** 2);

const SCENE = `<svg class="scene" viewBox="0 0 1200 630" aria-hidden="true">
  <defs>
    <linearGradient id="orbit" gradientUnits="userSpaceOnUse" x1="660" y1="0" x2="980" y2="0">
      <stop offset="0" stop-color="#64ffda" stop-opacity="0"/>
      <stop offset="1" stop-color="#64ffda" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#132238"/>
      <stop offset="0.12" stop-color="#0b1626"/>
      <stop offset="0.3" stop-color="#06080d"/>
    </linearGradient>
  </defs>
  ${stars()}
  <ellipse cx="${PX}" cy="${PY}" rx="${ORBIT.rx}" ry="${ORBIT.ry}" transform="rotate(${ORBIT.tilt} ${PX} ${PY})"
           fill="none" stroke="url(#orbit)" stroke-width="1.5"/>
  <circle cx="${PX}" cy="${PY}" r="${PR}" fill="url(#body)"/>
  <path d="M ${limbLeftX.toFixed(1)} 630 A ${PR} ${PR} 0 0 1 1200 ${limbRightY.toFixed(1)}"
        fill="none" stroke="#64ffda" stroke-width="2.5" stroke-opacity="0.9"/>
  <circle cx="${SX.toFixed(1)}" cy="${SY.toFixed(1)}" r="5" fill="#64ffda"/>
</svg>`;

const MARK = `<svg class="mark" viewBox="0 0 256 256" aria-hidden="true">
  <rect width="256" height="256" rx="58" fill="#0b0f1a"/>
  <path d="M 182.97 168.67 A 70 70 0 1 1 182.97 87.33" fill="none" stroke="#64ffda" stroke-width="28" stroke-linecap="round"/>
  <circle cx="196" cy="128" r="17" fill="#64ffda"/>
  <rect x="0.75" y="0.75" width="254.5" height="254.5" rx="57.25" fill="none" stroke="#64ffda" stroke-opacity="0.16" stroke-width="1.5"/>
</svg>`;

async function template() {
  const font = async (f) => (await readFile(join(FONTS, f))).toString("base64");
  const [latin, latinExt] = await Promise.all([
    font("mona-sans-latin.woff2"),
    font("mona-sans-latin-ext.woff2"),
  ]);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Mona Sans"; font-weight: 200 900; font-stretch: 75% 125%;
  src: url(data:font/woff2;base64,${latinExt}) format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+A720-A7FF; }
@font-face { font-family: "Mona Sans"; font-weight: 200 900; font-stretch: 75% 125%;
  src: url(data:font/woff2;base64,${latin}) format("woff2"); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; background: #06080d; overflow: hidden; }
body { font-family: "Mona Sans", sans-serif; -webkit-font-smoothing: antialiased; }
.card { position: relative; width: 1200px; height: 630px; padding: 56px 64px 52px;
  display: grid; grid-template-rows: auto minmax(0, 1fr) auto; isolation: isolate; }
.scene { position: absolute; inset: 0; width: 1200px; height: 630px; z-index: -1; }
.head { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 28px; font-weight: 700;
  letter-spacing: -0.02em; color: #e2e8f0; }
.mark { width: 52px; height: 52px; }
.brand span { color: #8794ab; font-weight: 600; }
.section { font-size: 24px; font-weight: 500; color: #8794ab; }
.body { align-self: start; padding-top: 64px; }
.title { max-width: 880px; font-weight: 700; line-height: 1.06; letter-spacing: -0.035em;
  color: #e2e8f0; text-wrap: balance; }
.title .muted { color: #8794ab; }
.desc { max-width: 660px; margin-top: 24px; font-size: 28px; line-height: 1.4; color: #94a3b8;
  text-wrap: pretty; }
.foot { font-size: 24px; font-weight: 500; color: #8794ab; }
</style></head><body>
<div class="card">${SCENE}
  <div class="head"><div class="brand">${MARK}<div id="wordmark"></div></div><div class="section" id="section"></div></div>
  <div class="body"><h1 class="title" id="title"></h1><p class="desc" id="desc"></p></div>
  <div class="foot" id="domain"></div>
</div></body></html>`;
}

/**
 * Fill the template in the page and size the title, so short titles land
 * loud and long ones never overflow (see the loop below).
 */
async function fill(page, card) {
  await page.evaluate((c) => {
    const $ = (id) => document.getElementById(id);
    $("wordmark").innerHTML = c.wordmark;
    $("section").textContent = c.section || "";
    $("title").innerHTML = c.titleHtml;
    // Description: at most two lines, cut at a whole word with an ellipsis
    // (and without a dangling comma or dash before it).
    const d = $("desc");
    d.style.display = c.description ? "" : "none";
    d.textContent = c.description || "";
    if (c.description) {
      const twoLines = parseFloat(getComputedStyle(d).lineHeight) * 2 + 1;
      const words = c.description.split(/\s+/);
      while (words.length > 1 && d.getBoundingClientRect().height > twoLines) {
        words.pop();
        d.textContent = words.join(" ").replace(/[\s.,;:—–-]+$/, "") + "…";
      }
    }
    $("domain").textContent = c.domain;
    // Largest step at which the title fits in maxLines and the whole
    // block (title + description) clears the domain line by 32px. The
    // middle row is minmax(0, 1fr), so the domain line never moves.
    const t = $("title");
    const footTop = $("domain").getBoundingClientRect().top;
    for (const size of c.sizes) {
      t.style.fontSize = `${size}px`;
      const lines = Math.round(t.getBoundingClientRect().height / (size * 1.06));
      const last = c.description ? $("desc") : t;
      if (lines <= c.maxLines && last.getBoundingClientRect().bottom <= footTop - 32) break;
    }
  }, card);
  await page.evaluate(() => document.fonts.ready);
}

// Compound words ("right-sizing", "auto-unseal") keep their halves on one
// line: a non-breaking hyphen (U+2011) instead of a break opportunity.
const keepCompounds = (s) => s.replace(/(\w)-(\w)/g, "$1\u2011$2");

/** Split "Claim — continuation" into a two-tone title; otherwise one tone. */
export function twoTone(title) {
  const t = keepCompounds(title);
  const i = t.indexOf(" — ");
  if (i === -1) return esc(t);
  return `${esc(t.slice(0, i))} <span class="muted">${esc(t.slice(i + 1))}</span>`;
}

export const WORDMARK = {
  portfolio: "cjoga.cloud",
  handbook: "cjoga.cloud<span>/handbook</span>",
};

/**
 * Render cards. Each card: { out, wordmark, section?, titleHtml,
 * description?, domain, sizes?, maxLines? }. Returns PNG buffers in order.
 */
export async function renderCards(cards) {
  const { chromium } = requireFromBlog("playwright");
  const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const executablePath = envPath || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  const browser = await chromium.launch({ executablePath });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(await template(), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const out = [];
    for (const card of cards) {
      await fill(page, {
        sizes: [92, 84, 76, 70, 64, 58, 54],
        maxLines: 3,
        ...card,
      });
      out.push(await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1200, height: 630 } }));
    }
    return out;
  } finally {
    await browser.close();
  }
}
