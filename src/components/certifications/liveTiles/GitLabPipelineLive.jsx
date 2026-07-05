import { m, useReducedMotion } from "framer-motion";
import { SiGitlab } from "react-icons/si";

// GitLab: compact CI/CD pipeline — 4 named stages with running indicator
// flowing through, status fills + checkmarks. SVG uses `meet` so it scales
// down to fit and centers inside the wide tile.
function GitLabPipelineLive({ color }) {
  const reduced = useReducedMotion();
  const stages = [
    { x: 18, label: "build", delay: 0.2 },
    { x: 40, label: "test", delay: 1.0 },
    { x: 60, label: "deploy", delay: 1.8 },
    { x: 82, label: "review", delay: 2.6 },
  ];
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "420px" }}
        aria-hidden="true"
      >
        {/* Pipeline bus */}
        <line
          x1={stages[0].x}
          y1="26"
          x2={stages[stages.length - 1].x}
          y2="26"
          stroke={color}
          strokeWidth="0.4"
          opacity="0.35"
          strokeDasharray="1.2 0.8"
        />

        {/* Running indicator traveling the bus */}
        {!reduced && (
          <m.circle
            r="1.4"
            cy="26"
            fill={color}
            initial={{ cx: stages[0].x }}
            animate={{ cx: stages.map((s) => s.x) }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.33, 0.66, 1],
            }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}

        {/* Stage nodes */}
        {stages.map((s, i) => (
          <g key={s.label}>
            <circle
              cx={s.x}
              cy="26"
              r="3.4"
              fill="var(--bg-surface)"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.55"
            />
            {!reduced && (
              <m.circle
                cx={s.x}
                cy="26"
                r="3.4"
                fill={color}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 1, 0] }}
                transition={{
                  duration: 5,
                  delay: s.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.5, 0.85, 1],
                }}
              />
            )}
            {!reduced && (
              <m.path
                d={`M ${s.x - 1.3},${26} L ${s.x - 0.2},${27.1} L ${s.x + 1.5},${25.1}`}
                stroke="var(--bg-surface)"
                strokeWidth="0.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 1, 1, 0],
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 5,
                  delay: s.delay + 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.18, 0.5, 0.85, 1],
                }}
              />
            )}
            <text
              x={s.x}
              y="37"
              fill={color}
              fontSize="2.6"
              textAnchor="middle"
              fontFamily="monospace"
              letterSpacing="0.08em"
              opacity="0.85"
            >
              {s.label}
            </text>
            {i < stages.length - 1 && (
              <line
                x1={s.x + 4}
                y1="26"
                x2={stages[i + 1].x - 4}
                y2="26"
                stroke={color}
                strokeWidth="0.3"
                opacity="0.4"
                strokeDasharray="0.7 0.7"
              />
            )}
          </g>
        ))}

        {/* Subtle git-graph trace below */}
        <line x1="18" y1="50" x2="82" y2="50" stroke={color} strokeWidth="0.2" opacity="0.2" />
        {[24, 36, 48, 60, 72].map((x) => (
          <circle key={x} cx={x} cy="50" r="0.55" fill={color} opacity="0.32" />
        ))}
      </svg>
      {/* GitLab tanuki brand mark, top-right */}
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
          <SiGitlab style={{ fontSize: "1.5rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default GitLabPipelineLive;
