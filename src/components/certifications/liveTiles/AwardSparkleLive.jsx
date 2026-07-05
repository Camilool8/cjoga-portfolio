import { m, useReducedMotion } from "framer-motion";
import { FaAward } from "react-icons/fa";

// Partner: compact verified stamp — outer rotating "ACCREDITED · PARTNER"
// text ring + inner ring with sequential tick marks animating around. Award
// glyph centered. Sized to stay compact and centered in any container.
function AwardSparkleLive({ color }) {
  const reduced = useReducedMotion();
  const accent = color || "var(--accent)";
  const ticks = Array.from({ length: 24 }, (_, i) => (i / 24) * 360);
  const CX = 50;
  const CY = 30;
  const TEXT_R = 22;
  const RING_R = 16.5;
  const TICK_OUTER = 18;
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "260px" }}
        aria-hidden="true"
      >
        <defs>
          <path
            id="partner-arc"
            d={`M ${CX},${CY} m -${TEXT_R},0 a ${TEXT_R},${TEXT_R} 0 1,1 ${TEXT_R * 2},0 a ${TEXT_R},${TEXT_R} 0 1,1 -${TEXT_R * 2},0`}
          />
        </defs>
        {/* Outer rotating text ring */}
        <m.g
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <text fill={accent} fontSize="2.6" fontFamily="monospace" letterSpacing="0.18em" opacity="0.7">
            <textPath href="#partner-arc">
              ACCREDITED · PARTNER · ENGINEER · ACCREDITED · PARTNER · ENGINEER ·
            </textPath>
          </text>
        </m.g>

        {/* Inner stamp ring */}
        <circle cx={CX} cy={CY} r={RING_R} stroke={accent} strokeWidth="0.45" fill="none" opacity="0.45" />
        <circle cx={CX} cy={CY} r={RING_R - 2.2} stroke={accent} strokeWidth="0.3" fill={`${accent}10`} opacity="0.7" />

        {/* Sequentially lighting tick marks */}
        {ticks.map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const x1 = CX + RING_R * Math.cos(a);
          const y1 = CY + RING_R * Math.sin(a);
          const x2 = CX + TICK_OUTER * Math.cos(a);
          const y2 = CY + TICK_OUTER * Math.sin(a);
          return (
            <m.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={accent}
              strokeWidth="0.4"
              initial={{ opacity: 0.25 }}
              animate={reduced ? {} : { opacity: [0.25, 1, 0.25] }}
              transition={{
                duration: 3,
                delay: (i / ticks.length) * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>
      {/* Central award glyph */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <m.div
          initial={reduced ? { scale: 1 } : { scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: accent,
            display: "flex",
            filter: `drop-shadow(0 6px 18px ${accent}55)`,
          }}
        >
          <FaAward style={{ fontSize: "1.5rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default AwardSparkleLive;
