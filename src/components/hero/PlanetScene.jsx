import { useEffect, useRef } from "react";
import { buildGlobe, drawGlobeDots, drawGlobeArcs } from "./globe";

// Hero backdrop, rendered on canvas: a shaded planet (lit limb, night
// side, atmosphere), orbits inclined in 3D that pass in front of and
// behind it, satellites with fading trails and coverage beams, and a
// depth-layered starfield that answers the pointer. No text, no data.
// One static frame under reduced motion; paused offscreen/hidden.
// variant "hero": a moon rising at the right edge. variant "horizon":
// the same world seen from orbit, a limb across the lower frame.

const TAU = Math.PI * 2;

// Orbits: radius (× planet radius), inclination, node rotation, angular
// speed (rad/s), satellites (phase offsets).
const ORBITS = [
  { k: 1.38, inc: 1.02, node: -0.55, speed: 0.12, sats: [0.4] },
  { k: 1.75, inc: 1.12, node: -0.2, speed: -0.075, sats: [2.1, 4.6] },
  { k: 2.2, inc: 0.94, node: -0.85, speed: 0.05, sats: [1.2] },
  { k: 2.75, inc: 1.2, node: -0.4, speed: -0.034, sats: [3.4, 5.6] },
];

function readColors(el) {
  const cs = getComputedStyle(el);
  const v = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    accent: v("--accent", "#64ffda"),
    void: v("--bg-void", "#06080d"),
    elevated: v("--bg-elevated", "#1a2332"),
    surface: v("--bg-surface", "#111827"),
    ink: v("--text-primary", "#e2e8f0"),
  };
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Light theme = a light ground; read from the host's own tokens so a
// section that pins the dark palette renders dark in either theme.
function isLightGround(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
}

// quiet: a still backdrop (no orbits, no loop) for pages where the
// content itself is the activity, like the terminal.
// avoid: selector for content the orbits must stay clear of; linework
// only fades in to the right of those elements' measured right edge.
// still: draw a single frame (no animation loop, no pointer tracking).
// Used behind the terminals, where the content is the activity and a
// full-section animated canvas cost too many frames.
export default function PlanetScene({ variant = "hero", quiet = false, still = false, avoid = "" }) {
  const canvasRef = useRef(null);
  const starsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduced =
      quiet || still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = canvas.parentElement;
    // Phones and low-core devices: fewer stars and globe dots and a
    // capped pixel ratio, so the backdrop never competes with input.
    const lowPower =
      window.matchMedia("(max-width: 760px)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4;

    const rand = seeded(1729);
    const stars = Array.from({ length: lowPower ? 170 : 340 }, () => ({
      x: rand(),
      y: rand(),
      depth: rand() ** 2.2,
      r: 0.35 + rand() * 0.9,
      tw: rand() * TAU,
    }));

    // One dotted globe everywhere. The horizon (cluster chapter, terminal
    // page) is the same world seen up close: no tilt, dots only in the
    // band of latitudes on screen, and lower arcs so they stay off the copy.
    const sink = quiet ? 0.9 : 0.74;
    const globe =
      variant === "hero"
        ? buildGlobe(seeded(4099), lowPower)
        : buildGlobe(seeded(4099), lowPower, {
            band: sink - 0.08,
            tilt: 0,
            lift: 0.35,
            total: lowPower ? 9000 : 16000,
          });

    let colors = readColors(host);
    colors.light = isLightGround(colors.void);
    let accent = hexToRgb(colors.accent);
    let ink = hexToRgb(colors.ink);
    let W = 0;
    let H = 0;
    let globeT = 0;
    // On the light theme the planet stays dark, so its dots use the bright
    // mint rather than the darker teal text accent.
    const globeAccent = () => (colors.light ? [94, 234, 212] : accent);
    const seaInk = () => (colors.light ? [203, 220, 240] : ink);
    let avoidX = 0;
    let raf = null;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();

    // Stars live on their own canvas, painted once per resize or theme
    // change; pointer parallax moves that canvas with a GPU transform, so
    // the per-frame canvas only redraws what actually moves.
    const starsCanvas = starsRef.current;
    const sctx = starsCanvas ? starsCanvas.getContext("2d") : null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (sctx) {
        starsCanvas.width = canvas.width;
        starsCanvas.height = canvas.height;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      measureAvoid();
      paintStars();
    };

    function measureAvoid() {
      if (!avoid) return;
      // The canvas's layout left edge, not its painted one: the hero scales
      // the scene in from 0.96 on load, and measuring the scaled box sized
      // the planet for a moment, then snapped it once the scale settled.
      const box = canvas.getBoundingClientRect();
      const left = box.left + (box.width - W) / 2;
      avoidX = 0;
      // Measure the content, not the box: headings and the button row are
      // full-width blocks, but only their text and buttons need room.
      const range = document.createRange();
      document.querySelectorAll(avoid).forEach((el) => {
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        if (r.width > 0) avoidX = Math.max(avoidX, r.right - left);
      });
    }

    const geometry = () => {
      if (variant === "horizon") {
        const R = Math.max(W * 0.8, H * 0.9);
        // Quiet pages keep the limb low, below the page's own content.
        return { R, cx: W * 0.62, cy: H + R * sink, narrow: false, horizon: true, lightX: 0, lightY: -0.95 };
      }
      // Desktop: a moon rising at the right edge, mid-height, clear of
      // the copy column. Phones: a horizon in the band the hero reserves
      // below the copy, so no text ever sits over the animation.
      const narrow = W < 760;
      if (narrow) {
        const R = W * 0.9;
        return { R, cx: W * 0.5, cy: H + R * 0.5, narrow, lightX: 0, lightY: -0.95 };
      }
      // Sized from both the height and the free width right of the copy,
      // so a short laptop viewport (125–150% scaling) still gets a large
      // planet; centred inside the edge so more than half the disc shows.
      const left = avoidX ? avoidX + 64 : W * 0.56;
      const want = Math.max(H * 0.42, W * 0.24);
      const R = Math.max(120, Math.min(want, (W - left) / 1.15, H * 0.46));
      return { R, cx: W - R * 0.15, cy: H * 0.48, narrow, lightX: -0.55, lightY: -0.62 };
    };

    // Copy column stays clean: orbital linework fades out toward the left.
    const fadeX = (x, narrow, horizon, y = 0) => {
      if (horizon) return 0.4;
      if (narrow) {
        // Only in the reserved band at the bottom of the hero.
        const t = Math.min(Math.max((y - (H - 260)) / 120, 0), 1);
        return 0.6 * t * t * (3 - 2 * t);
      }
      const from = Math.max(W * 0.5, avoidX + 24);
      const t = Math.min(Math.max((x - from) / (W * 0.18), 0), 1);
      return t * t * (3 - 2 * t);
    };

    // Point on an inclined circular orbit, projected orthographically.
    const project = (o, R, cx, cy, theta, drift) => {
      const r = o.k * R;
      const x0 = r * Math.cos(theta);
      const y0 = r * Math.sin(theta);
      const y1 = y0 * Math.cos(o.inc);
      const z1 = y0 * Math.sin(o.inc);
      const node = o.node + drift;
      return {
        x: cx + x0 * Math.cos(node) - y1 * Math.sin(node),
        y: cy + x0 * Math.sin(node) + y1 * Math.cos(node),
        z: z1,
      };
    };

    const hidden = (p, R, cx, cy) => p.z < 0 && Math.hypot(p.x - cx, p.y - cy) < R;

    function paintStars() {
      if (!sctx) return;
      sctx.clearRect(0, 0, W, H);
      // Daylight washes most stars out; only the nearest survive, faintly.
      const daylight = colors.light ? 0.28 : 1;
      for (const s of stars) {
        const d = 2 * s.r * (0.6 + s.depth);
        sctx.fillStyle = rgba(ink, (0.12 + s.depth * 0.55) * daylight);
        sctx.fillRect(s.x * W - d / 2, s.y * H - d / 2, d, d);
      }
    }

    let starShift = "";
    const moveStars = () => {
      if (!starsCanvas) return;
      const next = `translate3d(${(pointer.x * 14).toFixed(1)}px, ${(pointer.y * 10).toFixed(1)}px, 0)`;
      if (next !== starShift) {
        starsCanvas.style.transform = next;
        starShift = next;
      }
    };

    // The planet's gradients (atmosphere, body, terminator, rim, glow,
    // bands) never change between frames, but filling them is the most
    // expensive work per pixel. They are rendered once into a cached
    // layer and stamped each frame, with the globe dots drawn on top.
    const layers = { key: "", x0: 0, y0: 0, w: 0, h: 0, under: null };
    const MARGIN = 24; // > the pointer parallax shift

    const paintUnder = (c, R, cx, cy, lightX, lightY) => {
      const halo = c.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.55);
      halo.addColorStop(0, rgba(accent, colors.light ? 0.2 : 0.16));
      halo.addColorStop(0.18, rgba(accent, 0.05));
      halo.addColorStop(1, rgba(accent, 0));
      c.fillStyle = halo;
      c.beginPath();
      c.arc(cx, cy, R * 1.55, 0, TAU);
      c.fill();

      // Body: lit from the light side, falling into the night side.
      const lx = cx + R * lightX;
      const ly = cy + R * lightY;
      const body = c.createRadialGradient(lx, ly, R * 0.05, cx, cy, R * 1.05);
      if (colors.light) {
        // Daylight: the planet stays a dark body against a pale sky.
        body.addColorStop(0, "#2b4a6f");
        body.addColorStop(0.45, "#16283f");
        body.addColorStop(1, "#0b1626");
      } else {
        body.addColorStop(0, "#1b2b44");
        body.addColorStop(0.45, "#0d1626");
        body.addColorStop(1, colors.void);
      }
      c.fillStyle = body;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.fill();

      const night = c.createLinearGradient(lx, ly, cx - R * lightX, cy - R * lightY);
      night.addColorStop(0.45, "rgba(0,0,0,0)");
      night.addColorStop(1, colors.light ? "rgba(2,6,23,0.45)" : "rgba(0,0,0,0.55)");
      c.fillStyle = night;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.fill();
    };

    const paintOver = (c, R, cx, cy, lightX, lightY) => {
      const lx = cx + R * lightX;
      const ly = cy + R * lightY;
      const rim = c.createLinearGradient(lx, ly, cx - R * lightX * 0.4, cy - R * lightY * 0.4);
      rim.addColorStop(0, rgba(accent, 0.95));
      rim.addColorStop(0.55, rgba(accent, 0.35));
      rim.addColorStop(1, rgba(accent, 0));
      c.strokeStyle = rim;
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.stroke();

      const inner = c.createRadialGradient(cx, cy, R * 0.9, cx, cy, R);
      inner.addColorStop(0, rgba(accent, 0));
      inner.addColorStop(1, rgba(accent, colors.light ? 0.12 : 0.18));
      c.fillStyle = inner;
      c.beginPath();
      c.arc(cx, cy, R, 0, TAU);
      c.fill();

      // Face-on bands (after Turion): hairlines and one wide soft band.
      [
        [1.06, 1, 0.22],
        [1.1, 1, 0.12],
        [1.19, 12, 0.035],
        [1.3, 1, 0.07],
      ].forEach(([k, w, a]) => {
        c.strokeStyle = rgba(accent, a);
        c.lineWidth = w;
        c.beginPath();
        c.arc(cx, cy, R * k, 0, TAU);
        c.stroke();
      });
    };

    // The cached box is the planet's extent clipped to the canvas (plus a
    // margin for parallax), so even the huge horizon body stays small.
    const ensureLayers = ({ R, cx, cy, lightX, lightY }) => {
      const dpr = canvas.width / Math.max(W, 1);
      const key = [Math.round(R), Math.round(W), Math.round(H), lightX, lightY, colors.light, colors.accent, dpr.toFixed(2)].join("|");
      if (layers.key === key) return;
      const pad = Math.ceil(R * 1.6) + 4;
      const x0 = Math.floor(Math.max(cx - pad, -MARGIN));
      const y0 = Math.floor(Math.max(cy - pad, -MARGIN));
      const x1 = Math.ceil(Math.min(cx + pad, W + MARGIN));
      const y1 = Math.ceil(Math.min(cy + pad, H + MARGIN));
      const w = Math.max(1, x1 - x0);
      const h = Math.max(1, y1 - y0);
      const make = (paint) => {
        const off = document.createElement("canvas");
        off.width = Math.ceil(w * dpr);
        off.height = Math.ceil(h * dpr);
        const c = off.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
        paint(c, R, cx, cy, lightX, lightY);
        return off;
      };
      // One bitmap for the whole body (atmosphere through bands): the dots
      // draw on top, which halves the per-frame compositing.
      layers.under = make((c, ...args) => {
        paintUnder(c, ...args);
        paintOver(c, ...args);
      });
      // Stored relative to the centre, so a parallax shift just moves it.
      layers.x0 = x0 - cx;
      layers.y0 = y0 - cy;
      layers.w = w;
      layers.h = h;
      layers.key = key;
    };

    const drawPlanet = (g) => {
      const { R, cx, cy, lightX, lightY } = g;
      ensureLayers(g);
      const lx0 = cx + layers.x0;
      const ly0 = cy + layers.y0;
      ctx.drawImage(layers.under, lx0, ly0, layers.w, layers.h);

      if (globe) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.clip();
        drawGlobeDots(ctx, globe, { R, cx, cy, lightX, lightY }, globeT, globeAccent(), seaInk(), colors.light);
        ctx.restore();
      }

    };

    const drawOrbits = (g, t, front) => {
      const { R, cx, cy, narrow } = g;
      const drift = reduced ? 0 : t * 0.006;
      ORBITS.forEach((o) => {
        const steps = 220;
        for (let i = 0; i < steps; i += 1) {
          const p = project(o, R, cx, cy, (i / steps) * TAU, drift);
          if ((p.z >= 0) !== front || hidden(p, R, cx, cy)) continue;
          const f = fadeX(p.x, narrow, g.horizon, p.y);
          if (f <= 0.01) continue;
          const depth = 0.5 + 0.5 * (p.z / (o.k * R));
          ctx.fillStyle = rgba(ink, (0.14 + 0.46 * depth) * f);
          ctx.fillRect(p.x - 0.8, p.y - 0.8, 1.6, 1.6);
        }

        o.sats.forEach((phase) => {
          const theta = phase + (reduced ? 0 : t * o.speed);
          const head = project(o, R, cx, cy, theta, drift);
          if ((head.z >= 0) !== front || hidden(head, R, cx, cy)) return;
          const f = fadeX(head.x, narrow, g.horizon, head.y);
          if (f <= 0.01) return;

          // Coverage beam toward the surface (front side only).
          if (front) {
            const dx = cx - head.x;
            const dy = cy - head.y;
            const len = Math.hypot(dx, dy);
            const reach = Math.max(len - R, 0) * 0.9;
            const ux = dx / len;
            const uy = dy / len;
            const spread = reach * 0.16;
            const ex = head.x + ux * reach;
            const ey = head.y + uy * reach;
            const beam = ctx.createLinearGradient(head.x, head.y, ex, ey);
            beam.addColorStop(0, rgba(accent, 0.16 * f));
            beam.addColorStop(1, rgba(accent, 0));
            ctx.fillStyle = beam;
            ctx.beginPath();
            ctx.moveTo(head.x, head.y);
            ctx.lineTo(ex - uy * spread, ey + ux * spread);
            ctx.lineTo(ex + uy * spread, ey - ux * spread);
            ctx.closePath();
            ctx.fill();
          }

          // Trail: the last stretch of the orbit, fading out.
          const dir = Math.sign(o.speed) || 1;
          for (let k = 1; k <= 26; k += 1) {
            const p = project(o, R, cx, cy, theta - dir * k * 0.012, drift);
            if (hidden(p, R, cx, cy)) break;
            ctx.fillStyle = rgba(accent, (1 - k / 26) * 0.55 * f);
            ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
          }

          // Body: a small diamond with a soft core.
          const core = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9);
          core.addColorStop(0, rgba(accent, 0.45 * f));
          core.addColorStop(1, rgba(accent, 0));
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 9, 0, TAU);
          ctx.fill();
          ctx.save();
          ctx.translate(head.x, head.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = rgba(ink, 0.95 * f);
          ctx.fillRect(-2.6, -2.6, 5.2, 5.2);
          ctx.restore();
        });
      });
    };

    const frame = (now) => {
      const t = (now - start) / 1000;
      globeT = reduced ? 0 : t;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      ctx.clearRect(0, 0, W, H);
      const g = geometry();
      const shifted = { ...g, cx: g.cx + pointer.x * 10, cy: g.cy + pointer.y * 8 };
      moveStars();
      if (!quiet) drawOrbits(shifted, t, false);
      drawPlanet(shifted);
      if (!quiet) drawOrbits(shifted, t, true);
      if (globe) {
        drawGlobeArcs(ctx, globe, shifted, globeT, globeAccent(), (x, y) => fadeX(x, shifted.narrow, shifted.horizon, y), reduced);
      }
    };

    // Every frame, on every device: motion is time-based, and half-rate
    // rendering read as stutter. Low-power devices draw fewer points
    // instead (stars, globe dots, capped DPR).
    const loop = (now) => {
      frame(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : null;
    };
    const play = () => {
      if (reduced || raf !== null) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };

    resize();
    frame(performance.now());
    // The web font can widen the copy once it loads; measure again then,
    // while the scene is still fading in.
    let alive = true;
    if (avoid && document.fonts) {
      document.fonts.ready.then(() => alive && measureAvoid());
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else stop();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      frame(performance.now());
    });
    ro.observe(canvas);

    const onPointer = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    const onVisibility = () => (document.hidden ? stop() : play());
    document.addEventListener("visibilitychange", onVisibility);

    // Re-read the palette when the theme flips.
    const mo = new MutationObserver(() => {
      colors = readColors(host);
      colors.light = isLightGround(colors.void);
      accent = hexToRgb(colors.accent);
      ink = hexToRgb(colors.ink);
      paintStars();
      frame(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      alive = false;
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant, quiet, still, avoid]);

  return (
    <>
      <canvas ref={starsRef} className="planet-scene planet-scene--stars" aria-hidden="true" />
      <canvas ref={canvasRef} className="planet-scene" aria-hidden="true" />
    </>
  );
}
