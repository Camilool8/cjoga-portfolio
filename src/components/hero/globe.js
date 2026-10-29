// Dotted globe for the hero planet: a Fibonacci-sphere point cloud with
// noise "continents", shaded by a day/night light, slowly rotating, and
// a handful of nodes linked by great-circle arcs with travelling pulses —
// a picture of multi-region infrastructure. Pure geometry; the caller
// owns the canvas, the planet body and the frame loop.

const TAU = Math.PI * 2;
const AXIAL_TILT = 0.38;
const SPIN = 0.045; // rad/s

// ---- 3D value noise (deterministic, no allocations per sample) ----
function hash(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function noise3(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const zf = smooth(z - zi);
  const lerp = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
}

function fbm(x, y, z) {
  return (
    noise3(x * 1.6, y * 1.6, z * 1.6) * 0.55 +
    noise3(x * 3.4, y * 3.4, z * 3.4) * 0.3 +
    noise3(x * 7.1, y * 7.1, z * 7.1) * 0.15
  );
}

const LAND = 0.53;

// ---- Build ----
// band: lowest latitude (y on the unit sphere) that gets dots. A horizon
// only shows the top of a very large sphere, so dots are generated just
// for that band and stay dense. tilt: axial tilt; lift: arc height scale.
export function buildGlobe(rand, lowPower, { band = -1, tilt = AXIAL_TILT, lift: liftScale = 1, total: wanted } = {}) {
  const total = wanted || (lowPower ? 7000 : 10000);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const xs = [];
  const ys = [];
  const zs = [];
  const land = [];
  for (let i = 0; i < total; i += 1) {
    const y = 1 - (i / (total - 1)) * (1 - band);
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const isLand = fbm(x + 3.1, y + 7.7, z + 1.3) > LAND;
    // Keep every land dot; thin the ocean to a faint lattice.
    if (!isLand && i % 4 !== 0) continue;
    xs.push(x);
    ys.push(y);
    zs.push(z);
    land.push(isLand ? 1 : 0);
  }

  // Nodes: well-separated land points.
  const nodes = [];
  for (let tries = 0; tries < 4000 && nodes.length < 7; tries += 1) {
    const i = Math.floor(rand() * xs.length);
    if (!land[i]) continue;
    const p = [xs[i], ys[i], zs[i]];
    if (nodes.every((q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2] < 0.55)) nodes.push(p);
  }

  // Arcs: a ring through the nodes plus two cross links.
  const pairs = nodes.map((_, i) => [i, (i + 1) % nodes.length]);
  if (nodes.length > 4) pairs.push([0, 3], [2, 5 % nodes.length]);
  const SAMPLES = 48;
  const arcs = pairs.map(([a, b], k) => {
    const p = nodes[a];
    const q = nodes[b];
    const dot = Math.min(1, Math.max(-1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]));
    const omega = Math.acos(dot);
    const pts = new Float32Array(SAMPLES * 3);
    for (let s = 0; s < SAMPLES; s += 1) {
      const t = s / (SAMPLES - 1);
      const sa = Math.sin((1 - t) * omega) / Math.sin(omega);
      const sb = Math.sin(t * omega) / Math.sin(omega);
      // Lift: arcs rise in proportion to the distance they span.
      const lift = 1 + Math.sin(Math.PI * t) * (0.06 + omega * 0.09) * liftScale;
      pts[s * 3] = (p[0] * sa + q[0] * sb) * lift;
      pts[s * 3 + 1] = (p[1] * sa + q[1] * sb) * lift;
      pts[s * 3 + 2] = (p[2] * sa + q[2] * sb) * lift;
    }
    return {
      pts,
      phase: k * 0.37,
      speed: 0.11 + (k % 3) * 0.025,
      // Reused every frame: no per-frame allocation, so no GC hitches.
      sx: new Float32Array(SAMPLES),
      sy: new Float32Array(SAMPLES),
      ok: new Uint8Array(SAMPLES),
    };
  });

  const n = xs.length;
  return {
    tilt,
    xs: Float32Array.from(xs),
    ys: Float32Array.from(ys),
    zs: Float32Array.from(zs),
    land: Uint8Array.from(land),
    nodes,
    arcs,
    // Bucketed screen positions, reused every frame.
    buf: new Float32Array(n * 3),
    counts: new Int32Array(BUCKETS * 2),
    starts: new Int32Array(BUCKETS * 2),
    order: new Int32Array(n),
    sorted: new Int32Array(n),
  };
}

// Rotate a unit-sphere point: spin about the polar axis, then tilt.
function rotator(t, tilt = AXIAL_TILT) {
  const a = t * SPIN;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return (x, y, z, out) => {
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    out[0] = x1;
    out[1] = y * ct - z1 * st;
    out[2] = y * st + z1 * ct;
  };
}

const BUCKETS = 6;

// Surface dots. Clipped to the disc by the caller. Two passes over
// preallocated buffers (count, then place) so a frame allocates nothing.
export function drawGlobeDots(ctx, globe, { R, cx, cy, lightX, lightY }, t, accent, ink, light) {
  const rot = rotator(t, globe.tilt);
  const v = [0, 0, 0];
  let lx = lightX;
  let ly = -lightY;
  let lz = 0.65;
  const ln = Math.hypot(lx, ly, lz);
  lx /= ln;
  ly /= ln;
  lz /= ln;

  const { xs, ys, zs, land, buf, counts, order } = globe;
  counts.fill(0);
  const n = xs.length;
  // Pass 1: project, classify into (land|sea, brightness) buckets.
  for (let i = 0; i < n; i += 1) {
    rot(xs[i], ys[i], zs[i], v);
    if (v[2] <= 0.02) {
      order[i] = -1;
      continue;
    }
    const day = Math.max(0, v[0] * lx + v[1] * ly + v[2] * lz);
    const shade = 0.22 + 0.78 * day; // night side keeps a faint glow
    const b = Math.min(BUCKETS - 1, Math.floor(shade * Math.sqrt(v[2]) * BUCKETS));
    const key = (land[i] ? BUCKETS : 0) + b;
    order[i] = key;
    counts[key] += 1;
    buf[i * 3] = cx + v[0] * R;
    buf[i * 3 + 1] = cy - v[1] * R;
    buf[i * 3 + 2] = v[2];
  }

  // Counting sort by bucket, so pass 2 visits each dot exactly once.
  const { starts, sorted } = globe;
  let acc = 0;
  for (let key = 0; key < BUCKETS * 2; key += 1) {
    starts[key] = acc;
    acc += counts[key];
  }
  for (let i = 0; i < n; i += 1) {
    const key = order[i];
    if (key >= 0) {
      sorted[starts[key]] = i;
      starts[key] += 1;
    }
  }

  // Pass 2: one fillStyle per bucket.
  const landSize = Math.max(1.3, Math.min(2.4, R / 230));
  let at = 0;
  for (let key = 0; key < BUCKETS * 2; key += 1) {
    const end = at + counts[key];
    if (at === end) continue;
    const isLand = key >= BUCKETS;
    const k = ((key % BUCKETS) + 1) / BUCKETS;
    ctx.fillStyle = isLand
      ? rgba(accent, 0.12 + 0.78 * k)
      : rgba(ink, (light ? 0.1 : 0.08) * k + 0.03);
    for (; at < end; at += 1) {
      const i = sorted[at];
      const x = buf[i * 3];
      const y = buf[i * 3 + 1];
      if (isLand) {
        const s = landSize * (0.55 + 0.45 * buf[i * 3 + 2]);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      } else {
        ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    }
  }
}

// Arcs and nodes on the visible hemisphere, with travelling pulses.
// fade(x, y) lets the caller keep linework clear of the copy. Pulses move
// continuously (interpolated between samples), not sample to sample.
export function drawGlobeArcs(ctx, globe, { R, cx, cy }, t, accent, fade, still) {
  const rot = rotator(t, globe.tilt);
  const v = [0, 0, 0];
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  globe.arcs.forEach((arc) => {
    const { pts, sx, sy, ok } = arc;
    const n = sx.length;
    let fsum = 0;
    let fcount = 0;
    for (let s = 0; s < n; s += 1) {
      rot(pts[s * 3], pts[s * 3 + 1], pts[s * 3 + 2], v);
      sx[s] = cx + v[0] * R;
      sy[s] = cy - v[1] * R;
      ok[s] = v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1 ? 1 : 0;
      if (ok[s]) {
        fsum += fade(sx[s], sy[s]);
        fcount += 1;
      }
    }
    if (!fcount) return;
    const f = fsum / fcount;
    if (f <= 0.01) return;

    // Base arc: a single path, broken only where it passes behind.
    ctx.strokeStyle = rgba(accent, 0.26 * f);
    ctx.lineWidth = 1;
    ctx.beginPath();
    let pen = false;
    for (let s = 0; s < n; s += 1) {
      if (!ok[s]) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(sx[s], sy[s]);
      else ctx.moveTo(sx[s], sy[s]);
      pen = true;
    }
    ctx.stroke();
    if (still) return;

    // Pulse: a comet whose head moves continuously along the arc.
    const span = n - 1;
    const head = (((t * arc.speed + arc.phase) % 1.25) / 1.25) * (span + 12);
    const at = (u) => {
      const i0 = Math.max(0, Math.min(span - 1, Math.floor(u)));
      const fr = Math.max(0, Math.min(1, u - i0));
      if (!ok[i0] || !ok[i0 + 1]) return null;
      return [sx[i0] + (sx[i0 + 1] - sx[i0]) * fr, sy[i0] + (sy[i0 + 1] - sy[i0]) * fr];
    };
    const TAIL = 10;
    const STEP = 0.5;
    let prev = null;
    for (let k = 0; k <= TAIL / STEP; k += 1) {
      const u = head - k * STEP;
      const p = u >= 0 && u <= span ? at(u) : null;
      if (p && prev) {
        const a = 1 - (k * STEP) / TAIL;
        ctx.strokeStyle = rgba(accent, a * a * 0.95 * f);
        ctx.lineWidth = 0.8 + 1.6 * a;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      }
      prev = p;
    }
    const h = head >= 0 && head <= span ? at(head) : null;
    if (h) {
      ctx.fillStyle = rgba(accent, 0.95 * f);
      ctx.beginPath();
      ctx.arc(h[0], h[1], 1.9, 0, TAU);
      ctx.fill();
    }
  });

  // Nodes: a solid point and a slow expanding ring.
  globe.nodes.forEach((p, i) => {
    rot(p[0], p[1], p[2], v);
    if (v[2] <= 0.05) return;
    const x = cx + v[0] * R;
    const y = cy - v[1] * R;
    const f = fade(x, y) * Math.sqrt(v[2]);
    if (f <= 0.01) return;
    ctx.fillStyle = rgba(accent, 0.95 * f);
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, TAU);
    ctx.fill();
    if (still) return;
    const ph = (t * 0.35 + i * 0.29) % 1;
    const e = 1 - (1 - ph) * (1 - ph); // ease-out ring growth
    ctx.strokeStyle = rgba(accent, (1 - ph) * 0.6 * f);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 2.4 + e * 13, 0, TAU);
    ctx.stroke();
  });
}

function rgba([r, g, b], a) {
  return `rgba(${r},${g},${b},${a})`;
}
