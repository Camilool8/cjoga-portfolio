import { m, useReducedMotion } from "framer-motion";
import { SiDynatrace } from "react-icons/si";

// Dynatrace: Smartscape topology — service dependency graph with traffic
// flowing along edges, one node pulsing red as Davis AI flags an anomaly.
// Signature Dynatrace visualization (the actual product look).
function DynatraceWaveformLive({ color }) {
  const reduced = useReducedMotion();
  const nodes = [
    { id: "frontend", x: 10, y: 24, label: "frontend" },
    { id: "api", x: 30, y: 12, label: "api" },
    { id: "auth", x: 30, y: 38, label: "auth" },
    { id: "cart", x: 50, y: 24, label: "cart-svc" },
    { id: "postgres", x: 72, y: 12, label: "postgres", anomaly: true },
    { id: "redis", x: 72, y: 38, label: "redis" },
    { id: "queue", x: 90, y: 24, label: "queue" },
  ];
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [
    { from: "frontend", to: "api" },
    { from: "frontend", to: "auth" },
    { from: "api", to: "cart" },
    { from: "auth", to: "cart" },
    { from: "cart", to: "postgres" },
    { from: "cart", to: "redis" },
    { from: "postgres", to: "queue" },
    { from: "redis", to: "queue" },
  ];
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "440px" }}
        aria-hidden="true"
      >
        {/* Edges */}
        {edges.map((e, i) => {
          const from = nodeById[e.from];
          const to = nodeById[e.to];
          const edgeColor = e.to === "postgres" ? "#ef4444" : color;
          return (
            <g key={i}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={edgeColor}
                strokeWidth="0.3"
                opacity={e.to === "postgres" ? "0.6" : "0.38"}
                strokeDasharray="0.9 0.7"
              />
              {/* Traffic packet flowing along edge */}
              {!reduced && (
                <m.circle
                  r="0.7"
                  fill={edgeColor}
                  initial={{ cx: from.x, cy: from.y, opacity: 0 }}
                  animate={{
                    cx: [from.x, to.x],
                    cy: [from.y, to.y],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2.6,
                    delay: 0.4 + i * 0.32,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.9, 1],
                  }}
                  style={{ filter: `drop-shadow(0 0 2px ${edgeColor})` }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const nodeColor = n.anomaly ? "#ef4444" : color;
          return (
            <g key={n.id}>
              {/* Anomaly pulse ring */}
              {n.anomaly && !reduced && (
                <m.circle
                  cx={n.x}
                  cy={n.y}
                  r="2.6"
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth="0.5"
                  animate={{ r: [2.6, 5.2, 2.6], opacity: [0.85, 0, 0.85] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <m.circle
                cx={n.x}
                cy={n.y}
                r="2.4"
                fill={`${nodeColor}33`}
                stroke={nodeColor}
                strokeWidth="0.5"
                initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: 0.2 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
              <text
                x={n.x}
                y={n.y + (n.y < 20 ? -3.6 : 6.2)}
                fill={n.anomaly ? "#ef4444" : "var(--text-primary)"}
                fontSize="2.2"
                textAnchor="middle"
                fontFamily="monospace"
                opacity="0.88"
                fontWeight={n.anomaly ? 600 : 400}
              >
                {n.label}
              </text>
            </g>
          );
        })}

        {/* Davis AI anomaly banner — top-left, out of the way of the brand mark */}
        {!reduced && (
          <m.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
          >
            <rect x="2" y="1.5" width="28" height="5" rx="2.5" fill="#ef444433" stroke="#ef4444" strokeWidth="0.3" />
            <m.circle
              cx="5"
              cy="4"
              r="0.7"
              fill="#ef4444"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <text x="17" y="5" fill="#ef4444" fontSize="2.4" textAnchor="middle" fontFamily="monospace" fontWeight="600" letterSpacing="0.05em">
              DAVIS · ANOMALY
            </text>
          </m.g>
        )}
      </svg>
      {/* Dynatrace brand mark, top-right */}
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
          <SiDynatrace style={{ fontSize: "1.5rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default DynatraceWaveformLive;
