import { m, useReducedMotion } from "framer-motion";
import { SiKubernetes } from "react-icons/si";

// KCNA: circular progress ring with 5 segment dots + central k8s helm.
function KubestronautRingLive({ color, current = 1, inProgress = 0, total = 5 }) {
  const reduced = useReducedMotion();
  const RADIUS = 36;
  const CIRC = 2 * Math.PI * RADIUS;
  const progressLen = (current / total) * CIRC;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ maxHeight: "150px" }}
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={color}
          strokeWidth="0.8"
          fill="none"
          opacity="0.18"
        />
        <m.circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          whileInView={{ strokeDashoffset: CIRC - progressLen }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: reduced ? 0 : 1.4,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
        />
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + RADIUS * Math.cos(angle);
          const y = 50 + RADIUS * Math.sin(angle);
          const isLit = i < current;
          const isInProgress = i >= current && i < current + inProgress;
          return (
            <g key={i}>
              {isLit && !reduced && (
                <m.circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  opacity={0.35}
                  animate={{ r: [3, 5.5, 3], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {isInProgress && !reduced && (
                <m.circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.7"
                  strokeDasharray="1.2 1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="2.4"
                fill={isLit ? color : isInProgress ? `${color}33` : "var(--bg-surface)"}
                stroke={color}
                strokeWidth="0.7"
                opacity={isLit ? 1 : isInProgress ? 0.85 : 0.4}
              />
            </g>
          );
        })}

        {/* Orbital pods — scheduled workloads orbiting the control plane.
            Two rings of pods rotating in opposite directions. */}
        {!reduced && (
          <m.g
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            {[0, 120, 240].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const x = 50 + 22 * Math.cos(a);
              const y = 50 + 22 * Math.sin(a);
              return (
                <rect
                  key={deg}
                  x={x - 1.7}
                  y={y - 1.7}
                  width="3.4"
                  height="3.4"
                  rx="0.5"
                  fill={color}
                  opacity="0.7"
                />
              );
            })}
          </m.g>
        )}
        {!reduced && (
          <m.g
            animate={{ rotate: -360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            {[60, 180, 300].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const x = 50 + 28 * Math.cos(a);
              const y = 50 + 28 * Math.sin(a);
              return (
                <rect
                  key={deg}
                  x={x - 1.2}
                  y={y - 1.2}
                  width="2.4"
                  height="2.4"
                  rx="0.4"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              );
            })}
          </m.g>
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <m.div
          animate={reduced ? {} : { rotate: [0, 360] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ color, display: "flex" }}
        >
          <SiKubernetes style={{ fontSize: "2.2rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default KubestronautRingLive;
