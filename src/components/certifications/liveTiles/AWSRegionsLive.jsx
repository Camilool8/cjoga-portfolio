import { m, useReducedMotion } from "framer-motion";
import { FaAws } from "react-icons/fa";

// AWS Solutions Architect: multi-AZ VPC topology — ELB at top, request
// packets flowing down through subnets to EC2/RDS instances across 3 AZs.
function AWSRegionsLive({ color }) {
  const reduced = useReducedMotion();
  const azs = [
    { x: 22, label: "1a" },
    { x: 50, label: "1b" },
    { x: 78, label: "1c" },
  ];
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* VPC dashed boundary */}
        <rect
          x="6"
          y="14"
          width="88"
          height="62"
          rx="2.5"
          stroke={color}
          strokeWidth="0.3"
          fill="none"
          strokeDasharray="1.6 1.4"
          opacity="0.45"
        />
        {/* ELB pill */}
        <rect
          x="38"
          y="4"
          width="24"
          height="6.5"
          rx="2"
          stroke={color}
          strokeWidth="0.4"
          fill={`${color}24`}
          opacity="0.95"
        />
        <text
          x="50"
          y="8.6"
          fill={color}
          fontSize="3.4"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="600"
          opacity="0.85"
        >
          ELB
        </text>
        {/* Backbone bus */}
        <line x1="50" y1="11" x2="50" y2="20" stroke={color} strokeWidth="0.35" opacity="0.6" />
        <line x1="22" y1="20" x2="78" y2="20" stroke={color} strokeWidth="0.35" opacity="0.6" />

        {/* 3 AZ columns */}
        {azs.map((az, i) => (
          <g key={i}>
            <line x1={az.x} y1="20" x2={az.x} y2="28" stroke={color} strokeWidth="0.35" opacity="0.5" />
            <rect
              x={az.x - 9}
              y="28"
              width="18"
              height="44"
              rx="1.5"
              stroke={color}
              strokeWidth="0.25"
              fill="none"
              strokeDasharray="0.9 0.8"
              opacity="0.32"
            />
            <text x={az.x} y="33.5" fill={color} fontSize="2.4" textAnchor="middle" fontFamily="monospace" opacity="0.7">
              az-{az.label}
            </text>
            {/* EC2 box */}
            <rect x={az.x - 6.5} y="38" width="13" height="11" rx="1" stroke={color} strokeWidth="0.3" fill={`${color}1c`} opacity="0.85" />
            <text x={az.x} y="44.5" fill={color} fontSize="2.6" textAnchor="middle" fontFamily="monospace" fontWeight="600">EC2</text>
            {/* RDS box */}
            <rect x={az.x - 6.5} y="52" width="13" height="11" rx="1" stroke={color} strokeWidth="0.3" fill="none" opacity="0.55" />
            <text x={az.x} y="58.5" fill={color} fontSize="2.6" textAnchor="middle" fontFamily="monospace" opacity="0.75">RDS</text>
            {/* Health indicator dot */}
            {!reduced && (
              <m.circle
                cx={az.x + 5}
                cy="65.5"
                r="0.9"
                fill={color}
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {/* Packet ELB → EC2 in this AZ */}
            {!reduced && (
              <m.circle
                r="1"
                fill={color}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                animate={{
                  cx: [50, 50, az.x, az.x],
                  cy: [11, 20, 20, 38],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 2.8,
                  delay: i * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.22, 0.62, 1],
                }}
              />
            )}
          </g>
        ))}
      </svg>
      {/* AWS brand mark, top-right */}
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
          <FaAws style={{ fontSize: "1.6rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default AWSRegionsLive;
