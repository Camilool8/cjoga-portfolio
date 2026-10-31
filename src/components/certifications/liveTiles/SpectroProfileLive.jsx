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

// Palette: a cluster profile builds layer by layer — OS, Kubernetes,
// network, storage, add-ons — then the same profile lands on a cloud, a
// datacenter and an edge cluster. One profile, many clusters: the idea
// the certification is about.
const LAYERS = ["os", "k8s", "cni", "csi", "add-ons"];
const TARGETS = [
  { y: 15, label: "cloud" },
  { y: 30, label: "datacenter" },
  { y: 45, label: "edge" },
];
const CYCLE = 7;

function SpectroProfileLive({ color }) {
  const reduced = useReducedMotion();
  const layerY = (i) => 46 - i * 7.2;
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "380px" }}
        aria-hidden="true"
      >
        <text
          x="27"
          y="9"
          fill={color}
          fontSize="2.4"
          textAnchor="middle"
          fontFamily="monospace"
          letterSpacing="0.12em"
          opacity="0.7"
        >
          cluster profile
        </text>

        {/* Layer slots, always visible */}
        {LAYERS.map((label, i) => (
          <rect
            key={`slot-${label}`}
            x="12"
            y={layerY(i)}
            width="30"
            height="5.4"
            rx="1"
            fill="none"
            stroke={color}
            strokeWidth="0.3"
            strokeDasharray="0.8 0.8"
            opacity="0.3"
          />
        ))}

        {/* Layers settling in, bottom up */}
        {LAYERS.map((label, i) => (
          <m.g
            key={label}
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
            animate={
              reduced
                ? {}
                : { opacity: [0, 1, 1, 0], y: [-6, 0, 0, 0] }
            }
            transition={{
              duration: CYCLE,
              delay: i * 0.35,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.08, 0.86, 1],
            }}
          >
            <rect
              x="12"
              y={layerY(i)}
              width="30"
              height="5.4"
              rx="1"
              fill={`color-mix(in srgb, ${color} ${18 + i * 6}%, transparent)`}
              stroke={color}
              strokeWidth="0.4"
            />
            <text
              x="27"
              y={layerY(i) + 3.6}
              fill={color}
              fontSize="2.5"
              textAnchor="middle"
              fontFamily="monospace"
              letterSpacing="0.08em"
            >
              {label}
            </text>
          </m.g>
        ))}

        {/* One profile out to three clusters */}
        {TARGETS.map((target, i) => (
          <g key={target.label}>
            <path
              d={`M 43,30 C 54,30 56,${target.y} 66,${target.y}`}
              stroke={color}
              strokeWidth="0.3"
              fill="none"
              opacity="0.3"
              strokeDasharray="0.8 0.8"
            />
            {!reduced && (
              <m.path
                d={`M 43,30 C 54,30 56,${target.y} 66,${target.y}`}
                stroke={color}
                strokeWidth="0.6"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 0, 1, 1, 1],
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: CYCLE,
                  delay: i * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.45, 0.86, 1],
                }}
              />
            )}
            <rect
              x="66"
              y={target.y - 3.2}
              width="6.4"
              height="6.4"
              rx="1"
              transform={`rotate(45 69.2 ${target.y})`}
              fill="var(--bg-surface)"
              stroke={color}
              strokeWidth="0.45"
              opacity="0.7"
            />
            <m.rect
              x="67.4"
              y={target.y - 1.8}
              width="3.6"
              height="3.6"
              rx="0.6"
              transform={`rotate(45 69.2 ${target.y})`}
              fill={color}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={reduced ? {} : { opacity: [0, 0, 1, 1, 0] }}
              transition={{
                duration: CYCLE,
                delay: i * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.42, 0.5, 0.86, 1],
              }}
            />
            <text
              x="76"
              y={target.y + 0.9}
              fill={color}
              fontSize="2.5"
              fontFamily="monospace"
              letterSpacing="0.08em"
              opacity="0.85"
            >
              {target.label}
            </text>
          </g>
        ))}
      </svg>
      {/* Spectro Cloud mark, top-right */}
      <div className="absolute top-2 right-2 pointer-events-none">
        <m.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color,
            display: "flex",
            filter: `drop-shadow(0 4px 12px ${color}66)`,
          }}
        >
          <SpectroMark style={{ width: "1.25rem", height: "1.5rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default SpectroProfileLive;
