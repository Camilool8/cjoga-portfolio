import { m, useReducedMotion } from "framer-motion";

// Spectro Cloud mark (stacked diamonds), from the official logo in
// spectrocloud/librarium, drawn in one colour at three strengths.
export function SpectroMark({ style }) {
  return (
    <svg viewBox="0 0 274 334" style={style} aria-hidden="true">
      <path
        fill="currentColor"
        d="M125.78,329.6L4.95,234.22c-6.42-5.07-6.43-14.8-.01-19.88l120.83-95.61c6.59-5.21,15.89-5.21,22.47,0l120.83,95.61c6.41,5.08,6.41,14.81-.01,19.88l-120.83,95.39c-6.58,5.19-15.86,5.19-22.44,0Z"
      />
      <path
        fill="currentColor"
        opacity="0.45"
        d="M268.86,214.21s-.01,0-.02-.01l-122.78-96.83c-5.88-4.63-13.14-7.16-20.62-7.17l-115.83-.2c-5.07-.02-7.62-.92-8.71-4.39-.57,1.56-.78,3.06-.78,4.23,0,2.33.57,6.7,5,10.2,0,0,0,0,0,0l122.78,96.93c5.88,4.65,13.16,7.17,20.66,7.18l116.12.11c4.85.05,7.33.99,8.4,4.38.57-1.56.78-3.06.78-4.23,0-2.34-.57-6.71-5.01-10.21Z"
      />
      <path
        fill="currentColor"
        d="M269.06,100.02L148.24,4.41c-6.59-5.21-15.89-5.21-22.47,0L4.94,100.02c-6.42,5.08-6.41,14.81.01,19.88l119.88,94.64c.14.16.31.33.53.51,6.77,5.44,10.23,6.76,14.77,8.01,4.54,1.25,8.44,1.1,10.05,1.1h6.03c-4.04-.54-5.79-3-6.37-4.98-.75-2.55.49-5.28,2.88-7.45l116.33-91.83c6.42-5.07,6.43-14.8.01-19.88Z"
      />
      <path
        fill="currentColor"
        opacity="0.7"
        d="M152.72,211.73l56.47-44.58-63.12-49.78c-5.88-4.63-13.14-7.16-20.62-7.17l-115.83-.2c-5.07-.02-7.63-.95-8.72-4.41-.82,2.38-.88,4.15-.65,6,.23,1.91,1.05,4.13,2.3,5.82.67.91,1.52,1.79,2.59,2.64,0,0,0,0,0,0l119.7,94.49s0,0,0,0c0,0,2.85,2.46,5.51,4.17,3.06,1.97,6.4,3.47,9.9,4.38.06.02.11.03.17.04,2.65.67,5.39,1.02,8.17,1.03h7.64c-4.04-.54-5.79-2.99-6.37-4.97-.75-2.55.49-5.28,2.88-7.45Z"
      />
    </svg>
  );
}

// Palette, in its own idiom (the cluster-animation on spectrocloud.com's
// Palette page): a cluster profile as a stack of hexagonal layers, OS at
// the bottom to system apps on top, each layer pinned to a pack and
// version; then the same profile deploys to every target, and the step
// rail walks build → deploy → operate → scale. Layer colours follow
// Palette's ramp: deep teal for the infrastructure layers, green for
// observability, gold and orange for the app layers.
const LAYERS = [
  { name: "OS", pack: "ubuntu 24.04", top: "#0f4544", side: "#0a3130" },
  { name: "KUBERNETES", pack: "pxk 1.33", top: "#12504f", side: "#0c3a39" },
  { name: "NETWORK", pack: "cilium 1.17", top: "#176160", side: "#104746" },
  { name: "STORAGE", pack: "portworx 3.2", top: "#21807c", side: "#185f5c" },
  { name: "MONITORING", pack: "prometheus 3.2", top: "#7d9a58", side: "#5f7a40" },
  { name: "SERVICE MESH", pack: "istio 1.24", top: "#f0c776", side: "#d2a656" },
  { name: "SYSTEM APP", pack: "argo cd 2.14", top: "#f2915a", side: "#d47340" },
];
const CLUSTERS = [
  { y: 21, cloud: "aws", name: "eks-prod" },
  { y: 28, cloud: "azure", name: "aks-west" },
  { y: 35, cloud: "edge", name: "edge-store" },
];
const STEPS = [1, 2, 3, 4];
const CYCLE = 10;

// Stack geometry, in viewBox units (150 × 50).
const CX = 33;
const HW = 12; // half width of a hexagon
const D = 2.6; // half depth of the top face
const T = 2.2; // thickness of a layer's front band
const BASE = 42; // top-face centre of the bottom layer
const STEP = 4.4;

const topFace = (y) =>
  `${CX - HW},${y} ${CX - HW / 2},${y - D} ${CX + HW / 2},${y - D} ${CX + HW},${y} ${CX + HW / 2},${y + D} ${CX - HW / 2},${y + D}`;
const band = (y) =>
  `${CX - HW},${y} ${CX - HW / 2},${y + D} ${CX + HW / 2},${y + D} ${CX + HW},${y} ${CX + HW},${y + T} ${CX + HW / 2},${y + D + T} ${CX - HW / 2},${y + D + T} ${CX - HW},${y + T}`;
const hexBadge = (cx, cy, r) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

// Each step owns a slice of the cycle; the rail's active badge moves with it.
const STEP_WINDOWS = [
  [0, 0.42],
  [0.42, 0.6],
  [0.6, 0.76],
  [0.76, 0.88],
];

// One clock for the whole tile. Every element keys its keyframes off the
// same cycle (no per-element delays, which drifted out of phase and let
// a new stack start building under the last one): the stack builds
// bottom-up, the clusters come up, everything is gone by HIDE, and the
// tile stays empty until the cycle restarts.
const SHOW_END = 0.84;
const HIDE = 0.88;
const layerAt = (i) => 0.02 + i * 0.03;

// Opacity keyframes for "visible from `from` until the shared fade-out".
function visibleFrom(from, fadeIn = 0.03) {
  return {
    opacity: [0, 0, 1, 1, 0, 0],
    times: [0, from, from + fadeIn, SHOW_END, HIDE, 1],
  };
}

function stepKeyframes([from, to]) {
  const e = 0.01;
  return {
    opacity: [0, 0, 1, 1, 0, 0],
    times: [0, Math.max(from - e, 0), from + e, to - e, to + e, 1].map((t) =>
      Math.min(Math.max(t, 0), 1),
    ),
  };
}

function SpectroProfileLive({ color }) {
  const reduced = useReducedMotion();
  const layerY = (i) => BASE - i * STEP;
  const loop = (times) => ({
    duration: CYCLE,
    repeat: Infinity,
    ease: "easeOut",
    times,
  });
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 150 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Step rail: build, deploy, operate, scale */}
        <line x1="7" y1="9" x2="7" y2="42" stroke="var(--border-medium)" strokeWidth="0.25" />
        {STEPS.map((n, i) => {
          const cy = 9 + i * 11;
          return (
            <g key={n}>
              <polygon
                points={hexBadge(7, cy, 2.9)}
                fill="var(--bg-elevated)"
                stroke="var(--border-medium)"
                strokeWidth="0.25"
              />
              <m.polygon
                points={hexBadge(7, cy, 2.9)}
                fill="#1f7a78"
                initial={{ opacity: reduced && i === 0 ? 1 : 0 }}
                animate={reduced ? {} : { opacity: stepKeyframes(STEP_WINDOWS[i]).opacity }}
                transition={{ ...loop(stepKeyframes(STEP_WINDOWS[i]).times), ease: "linear" }}
              />
              <text
                x="7"
                y={cy + 0.9}
                fill="var(--text-primary)"
                fontSize="2.6"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-display), sans-serif"
              >
                {n}
              </text>
            </g>
          );
        })}

        {/* The cluster profile: hexagonal layers settling bottom-up */}
        {LAYERS.map((layer, i) => {
          const y = layerY(i);
          const kf = visibleFrom(layerAt(i));
          return (
            <m.g
              key={layer.name}
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
              animate={reduced ? {} : { opacity: kf.opacity, y: [-5, -5, 0, 0, 0, -5] }}
              transition={loop(kf.times)}
            >
              <polygon points={band(y)} fill={layer.side} />
              <polygon
                points={topFace(y)}
                fill={layer.top}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="0.15"
              />
              <text
                x={CX}
                y={y + D + T - 0.55}
                fill={i < 5 ? "rgba(255,255,255,0.88)" : "rgba(20,20,20,0.82)"}
                fontSize="1.35"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-body), sans-serif"
              >
                {layer.name}
              </text>
            </m.g>
          );
        })}

        {/* Pack per layer, joined to its layer like Palette's profile view */}
        {LAYERS.map((layer, i) => {
          const y = layerY(i) + D * 0.4;
          const kf = visibleFrom(layerAt(i) + 0.02);
          return (
            <m.g
              key={layer.pack}
              initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 3 }}
              animate={reduced ? {} : { opacity: kf.opacity, x: [3, 3, 0, 0, 0, 3] }}
              transition={loop(kf.times)}
            >
              <line
                x1={CX + HW + 0.4}
                y1={y}
                x2="52.5"
                y2={y}
                stroke={layer.top}
                strokeWidth="0.3"
                opacity="0.9"
              />
              <circle cx="52.5" cy={y} r="0.45" fill="none" stroke={layer.top} strokeWidth="0.3" />
              <rect
                x="53.4"
                y={y - 1.75}
                width="30"
                height="3.5"
                rx="0.5"
                fill="var(--bg-surface)"
                stroke="var(--border-subtle)"
                strokeWidth="0.2"
              />
              <rect x="54.4" y={y - 0.75} width="1.5" height="1.5" rx="0.3" fill={layer.top} />
              <text
                x="57"
                y={y + 0.8}
                fill="var(--text-primary)"
                fontSize="2.1"
                fontFamily="var(--font-mono), monospace"
              >
                {layer.pack}
              </text>
            </m.g>
          );
        })}

        {/* Deploy anywhere: the same profile running on every target */}
        <m.text
          x="92"
          y="16"
          fill={color}
          fontSize="1.8"
          fontWeight="700"
          letterSpacing="0.12em"
          fontFamily="var(--font-body), sans-serif"
          initial={{ opacity: reduced ? 0.85 : 0 }}
          animate={reduced ? {} : { opacity: visibleFrom(0.42).opacity.map((o) => o * 0.85) }}
          transition={loop(visibleFrom(0.42).times)}
        >
          CLUSTERS
        </m.text>
        {CLUSTERS.map((c, i) => {
          const row = visibleFrom(0.44 + i * 0.02);
          // Provisioning, then Running, a beat apart per cluster.
          const flip = [0, 0.56 + i * 0.03, 0.57 + i * 0.03, 1];
          return (
          <m.g
            key={c.name}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={reduced ? {} : { opacity: row.opacity }}
            transition={loop(row.times)}
          >
            <rect
              x="91"
              y={c.y - 2}
              width="53"
              height="4"
              rx="0.5"
              fill="var(--bg-surface)"
              stroke="var(--border-subtle)"
              strokeWidth="0.2"
            />
            <text x="92.4" y={c.y + 0.8} fill="var(--text-tertiary)" fontSize="1.9" fontFamily="var(--font-mono), monospace">
              {c.cloud}
            </text>
            <text x="100.5" y={c.y + 0.8} fill={color} fontSize="2.1" fontFamily="var(--font-mono), monospace">
              {c.name}
            </text>
            <m.g
              initial={{ opacity: reduced ? 0 : 1 }}
              animate={reduced ? {} : { opacity: [1, 1, 0, 0] }}
              transition={{ ...loop(flip), ease: "linear" }}
            >
              <circle cx="128.6" cy={c.y} r="0.6" fill="#e3a43a" />
              <text x="130" y={c.y + 0.7} fill="#e3a43a" fontSize="1.85" fontFamily="var(--font-body), sans-serif">
                Provisioning
              </text>
            </m.g>
            <m.g
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={reduced ? {} : { opacity: [0, 0, 1, 1] }}
              transition={{ ...loop(flip), ease: "linear" }}
            >
              <circle cx="128.6" cy={c.y} r="0.6" fill="#3fbf8a" />
              <text x="130" y={c.y + 0.7} fill="#3fbf8a" fontSize="1.85" fontFamily="var(--font-body), sans-serif">
                Running
              </text>
            </m.g>
          </m.g>
          );
        })}
      </svg>

      {/* Palette by Spectro Cloud: the product's mark top-right, the
          company's wordmark bottom-right, both their dark-background
          artwork. */}
      <img
        src="/images/logos/palette.svg"
        alt=""
        width="60"
        height="20"
        className="absolute top-2.5 right-3 pointer-events-none"
        style={{ height: "18px", width: "auto" }}
      />
      <img
        src="/images/logos/spectrocloud.svg"
        alt=""
        width="47"
        height="18"
        className="absolute bottom-2.5 right-3 pointer-events-none opacity-90"
        style={{ height: "16px", width: "auto" }}
      />
    </div>
  );
}

export default SpectroProfileLive;
