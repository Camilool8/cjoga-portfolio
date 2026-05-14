import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useMotionValue,
  useTransform,
  animate as animateValue,
  useReducedMotion,
} from "framer-motion";
import { FaRedhat, FaAward, FaAws, FaExternalLinkAlt } from "react-icons/fa";
import {
  SiDynatrace,
  SiGitlab,
  SiTerraform,
  SiKubernetes,
} from "react-icons/si";
import {
  sectionVariants,
  itemVariants,
  cardVariants,
  viewportConfig,
} from "../hooks/useMotion";

// Bento — every tile gets a live animation. All tiles are 2 rows tall.
//   lg (6 cols × 6 rows = 36 cells):
//     [KCNA 3×2 — 2026]      [AWS 3×2 — 2025]
//     [HCTA 2×2] [Dyna 2×2] [Partner 2×2]   ← 2023+
//     [RedHat 2×2 — 2024]     [GitLab 4×2 — 2022]
const certGroups = [
  {
    vendor: "Linux Foundation",
    vendorShort: "CNCF",
    tagline: "On the road to Kubestronaut",
    icon: SiKubernetes,
    color: "#326ce5",
    size: "featured",
    liveTile: "kubestronaut",
    progress: { current: 1, total: 5, label: "Kubestronaut path" },
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-3",
    certs: [
      {
        key: "kcna",
        link: "https://www.credly.com/badges/bc307278-2a6d-4065-a1b5-5b1b7bda61bd",
      },
    ],
  },
  {
    vendor: "Amazon Web Services",
    vendorShort: "AWS",
    tagline: "Cloud architecture & operations",
    icon: FaAws,
    color: "#ff9900",
    size: "featured",
    liveTile: "aws",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-3",
    certs: [
      {
        key: "awsSolutionsArchitect",
        link: "https://www.credly.com/badges/4a977479-db27-4850-8962-d038b062a7d2",
      },
    ],
  },
  {
    vendor: "HashiCorp",
    vendorShort: "HashiCorp",
    tagline: "Infrastructure as Code",
    icon: SiTerraform,
    color: "#7f4dff",
    size: "standard",
    liveTile: "terraform",
    spanClasses: "md:col-span-1 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "hcta",
        link: "https://www.credly.com/badges/9f285077-46e9-431d-88f3-e4107546d668",
      },
    ],
  },
  {
    vendor: "Dynatrace",
    vendorShort: "Dynatrace",
    tagline: "Application observability",
    icon: SiDynatrace,
    color: "#73be28",
    size: "standard",
    liveTile: "dynatrace",
    spanClasses: "md:col-span-1 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "dynatrace",
        link: "https://www.credly.com/badges/2239d2e7-c0f8-4ee0-8e04-2429d0c774bc",
      },
    ],
  },
  {
    vendor: "Technology Partners",
    vendorShort: "Partner",
    tagline: "Accredited engineer",
    icon: FaAward,
    color: null,
    size: "standard",
    liveTile: "award",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "partner",
        link: "https://www.credly.com/badges/209bae19-6dbe-4cc2-8350-28cf4102ec46",
      },
    ],
  },
  {
    vendor: "Red Hat",
    vendorShort: "Red Hat",
    tagline: "Linux & system administration",
    icon: FaRedhat,
    color: "#ee0000",
    size: "tall",
    liveTile: "redhat",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-2",
    certs: [
      {
        key: "rhcsa",
        link: "https://www.credly.com/badges/3d2d03bb-5108-41da-81ad-6e47c80e3eed",
      },
      {
        key: "rhce",
        link: "https://www.credly.com/badges/2ba3ac77-f45d-4cfa-a286-7d27d379f429",
      },
    ],
  },
  {
    vendor: "GitLab",
    vendorShort: "GitLab",
    tagline: "DevSecOps & CI/CD",
    icon: SiGitlab,
    color: "#fc6d26",
    size: "wide",
    liveTile: "gitlab",
    spanClasses: "md:col-span-2 md:row-span-2 lg:col-span-4",
    certs: [
      {
        key: "gitlabMigration",
        link: "https://www.credly.com/badges/5a3d21a3-c24a-496c-88d4-5eac982c9cd3",
      },
      {
        key: "gitlabServices",
        link: "https://www.credly.com/badges/4a4a52c6-56b1-4518-acef-24f772434e5e",
      },
      {
        key: "gitlabCicd",
        link: "https://www.credly.com/badges/518a6de5-bae5-432f-9d90-0800eba2d4b5",
      },
      {
        key: "gitlabImplementation",
        link: "https://www.credly.com/badges/585b9001-7570-4e30-99d5-5f043534cf2a",
      },
    ],
  },
];

const totalCerts = certGroups.reduce((sum, g) => sum + g.certs.length, 0);

// ─── Live mini-animations for featured tiles ──────────────────────────
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
              <motion.circle
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
              <motion.circle
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
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
}

// HashiCorp Terraform (HCTA): the iconic `terraform plan` output —
// color-coded resource diff (`+` create, `~` change, `-` destroy) followed
// by the "Plan: X to add..." summary. Anyone who's used Terraform
// recognizes this in <1 second.
function TerraformGraphLive({ color }) {
  const reduced = useReducedMotion();
  const lines = [
    { sym: "+", text: "aws_vpc.main", kind: "create", delay: 0.25 },
    { sym: "+", text: "aws_subnet.public[0]", kind: "create", delay: 0.45 },
    { sym: "+", text: "aws_subnet.public[1]", kind: "create", delay: 0.65 },
    { sym: "~", text: "aws_instance.web", kind: "change", delay: 0.85 },
    { sym: "-", text: "aws_iam_policy.old", kind: "destroy", delay: 1.05 },
  ];
  const kindColor = {
    create: "#4ade80",
    change: "#facc15",
    destroy: "#ef4444",
  };
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl"
      style={{ background: "#0e0817" }}
    >
      {/* Terminal-style header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-1 px-2 py-1"
        style={{
          height: "13px",
          background: "#070410",
          borderBottom: `1px solid ${color}33`,
        }}
      >
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#ee0000" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#f59e0b" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#22c55e" }} />
        <span
          className="ml-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5rem",
            color: "#c4b5fd",
            opacity: 0.75,
            letterSpacing: "0.05em",
          }}
        >
          $ terraform plan
        </span>
      </div>

      {/* Plan diff body */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          top: "15px",
          padding: "4px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.52rem",
          lineHeight: 1.45,
        }}
      >
        {lines.map((line, i) => {
          const c = kindColor[line.kind];
          return (
            <motion.div
              key={i}
              initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: line.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  color: c,
                  fontWeight: 700,
                  width: "8px",
                  textAlign: "center",
                  filter: `drop-shadow(0 0 3px ${c}99)`,
                }}
              >
                {line.sym}
              </span>
              <span style={{ color: "#e5e7eb" }}>{line.text}</span>
            </motion.div>
          );
        })}

        {/* Plan summary line */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: "4px",
            paddingTop: "3px",
            borderTop: `1px solid ${color}22`,
            color: "#c4b5fd",
            opacity: 0.92,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#a78bfa", fontWeight: 600 }}>Plan:</span>{" "}
          <span style={{ color: kindColor.create }}>3 to add</span>
          {", "}
          <span style={{ color: kindColor.change }}>1 to change</span>
          {", "}
          <span style={{ color: kindColor.destroy }}>1 to destroy</span>
          <span style={{ color: "#c4b5fd" }}>.</span>
        </motion.div>
      </div>

      {/* Terraform brand mark, bottom-right */}
      <div className="absolute bottom-1.5 right-2 pointer-events-none">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 0.92, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color,
            display: "flex",
            filter: `drop-shadow(0 4px 12px ${color}88)`,
          }}
        >
          <SiTerraform style={{ fontSize: "1.7rem" }} />
        </motion.div>
      </div>
    </div>
  );
}

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
                <motion.circle
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
                <motion.circle
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
              <motion.circle
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
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
          >
            <rect x="2" y="1.5" width="28" height="5" rx="2.5" fill="#ef444433" stroke="#ef4444" strokeWidth="0.3" />
            <motion.circle
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
          </motion.g>
        )}
      </svg>
      {/* Dynatrace brand mark, top-right */}
      <div className="absolute top-2 right-2 pointer-events-none">
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
}

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
        <motion.g
          animate={reduced ? {} : { rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <text fill={accent} fontSize="2.6" fontFamily="monospace" letterSpacing="0.18em" opacity="0.7">
            <textPath href="#partner-arc">
              ACCREDITED · PARTNER · ENGINEER · ACCREDITED · PARTNER · ENGINEER ·
            </textPath>
          </text>
        </motion.g>

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
            <motion.line
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
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
}

// Red Hat (RHCSA/RHCE): systemd service status board — rows of services
// with status dots, like the output of `systemctl list-units`. Running
// services pulse green; inactive stays dim. Shadowman in the corner.
function RedHatRadarLive({ color }) {
  const reduced = useReducedMotion();
  const services = [
    { name: "nginx.service", state: "running", status: "ok", delay: 0.25 },
    { name: "postgresql.service", state: "running", status: "ok", delay: 0.45 },
    { name: "firewalld.service", state: "running", status: "ok", delay: 0.65 },
    { name: "sshd.service", state: "running", status: "ok", delay: 0.85 },
    { name: "crond.service", state: "inactive", status: "off", delay: 1.05 },
  ];
  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl"
      style={{ background: "#150909" }}
    >
      {/* Terminal-style header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-1 px-2 py-1"
        style={{
          height: "13px",
          background: "#0c0505",
          borderBottom: `1px solid ${color}33`,
        }}
      >
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#ee0000" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#f59e0b" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#22c55e" }} />
        <span
          className="ml-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.5rem",
            color: "#f5b7b7",
            opacity: 0.7,
            letterSpacing: "0.05em",
          }}
        >
          systemctl list-units
        </span>
      </div>

      {/* Service rows */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          top: "15px",
          padding: "5px 10px 5px 10px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.52rem",
          lineHeight: 1.55,
        }}
      >
        {services.map((svc, i) => {
          const ok = svc.status === "ok";
          return (
            <motion.div
              key={svc.name}
              initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: svc.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: ok ? "#e7e5e4" : "#7c7c7c",
                whiteSpace: "nowrap",
              }}
            >
              {ok ? (
                <motion.span
                  style={{
                    color: "#22c55e",
                    fontSize: "0.85rem",
                    lineHeight: 1,
                    display: "inline-block",
                    filter: "drop-shadow(0 0 3px #22c55e)",
                  }}
                  animate={reduced ? {} : { opacity: [0.55, 1, 0.55] }}
                  transition={{
                    duration: 2.4,
                    delay: 1.2 + i * 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ●
                </motion.span>
              ) : (
                <span style={{ color: "#52525b", fontSize: "0.85rem", lineHeight: 1 }}>○</span>
              )}
              <span style={{ flex: "1 1 auto" }}>{svc.name}</span>
              <span
                style={{
                  opacity: ok ? 0.85 : 0.45,
                  color: ok ? "#22c55e" : "#71717a",
                  fontWeight: ok ? 500 : 400,
                  paddingRight: "24px",
                }}
              >
                {svc.state}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Shadowman logo, bottom-right */}
      <div className="absolute bottom-1.5 right-2 pointer-events-none">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 0.92, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color,
            display: "flex",
            filter: `drop-shadow(0 4px 12px ${color}88)`,
          }}
        >
          <FaRedhat style={{ fontSize: "1.7rem" }} />
        </motion.div>
      </div>
    </div>
  );
}

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
          <motion.circle
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
              <motion.circle
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
              <motion.path
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
        <motion.div
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
        </motion.div>
      </div>
    </div>
  );
}

// KCNA: circular progress ring with 5 segment dots + central k8s helm.
function KubestronautRingLive({ color, current = 1, total = 5 }) {
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
        <motion.circle
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
          return (
            <g key={i}>
              {isLit && !reduced && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  opacity={0.35}
                  animate={{ r: [3, 5.5, 3], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="2.4"
                fill={isLit ? color : "var(--bg-surface)"}
                stroke={color}
                strokeWidth="0.7"
                opacity={isLit ? 1 : 0.4}
              />
            </g>
          );
        })}

        {/* Orbital pods — scheduled workloads orbiting the control plane.
            Two rings of pods rotating in opposite directions. */}
        {!reduced && (
          <motion.g
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
          </motion.g>
        )}
        {!reduced && (
          <motion.g
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
          </motion.g>
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={reduced ? {} : { rotate: [0, 360] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{ color, display: "flex" }}
        >
          <SiKubernetes style={{ fontSize: "2.2rem" }} />
        </motion.div>
      </div>
    </div>
  );
}

function CountUp({ value, duration = 1.1 }) {
  const reduced = useReducedMotion();
  const motionVal = useMotionValue(reduced ? value : 0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animateValue(motionVal, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [motionVal, rounded, value, duration, reduced]);

  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        display: "inline-block",
      }}
      aria-label={String(value)}
    >
      {display}
    </span>
  );
}

function CertRow({ cert, brandColor, accentBg, t, featured, divider }) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2"
      style={{
        borderTop: divider ? "1px solid var(--border-subtle)" : "none",
      }}
    >
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontSize: featured ? "0.9rem" : "0.85rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.35,
          }}
        >
          {cert.link ? (
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <span>{t(`certifications.${cert.key}.name`)}</span>
              <FaExternalLinkAlt
                style={{
                  fontSize: "0.55rem",
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              />
            </a>
          ) : (
            t(`certifications.${cert.key}.name`)
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-tertiary)",
            marginTop: "2px",
          }}
        >
          {t(`certifications.${cert.key}.issuer`)}
        </div>
      </div>
      <div
        className="flex-shrink-0"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          fontWeight: 500,
          color: brandColor,
          background: accentBg,
          padding: "3px 10px",
          borderRadius: "6px",
        }}
      >
        {t(`certifications.${cert.key}.date`)}
      </div>
    </div>
  );
}

function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications">
      <div className="section-inner">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">
              {t("certifications.title", "Certifications")}
            </span>
            <h2 className="section-heading">
              {t("certifications.heading", "Credentials & certs.")}
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <span
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                }}
                aria-hidden="true"
              />
              <CountUp value={totalCerts} />
              <span>
                {" "}
                {t("certifications.chipLabel", "certifications earned")}
              </span>
            </span>
          </motion.div>
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
          style={{
            gridAutoFlow: "dense",
            gridAutoRows: "minmax(150px, auto)",
          }}
        >
          {certGroups.map((group, groupIndex) => {
            const brandColor = group.color || "var(--accent)";
            const accentBg = group.color
              ? `${group.color}14`
              : "var(--accent-dim)";
            const isFeatured = group.size === "featured";
            const isWide = group.size === "wide";

            return (
              <motion.div
                key={group.vendorShort}
                custom={groupIndex}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`cert-group-card relative rounded-2xl p-5 md:p-6 cursor-default flex flex-col ${group.spanClasses}`}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `3px solid ${brandColor}`,
                  "--brand-color": brandColor,
                }}
                whileHover={{
                  boxShadow: `0 8px 30px ${
                    group.color ? group.color + "1f" : "rgba(100,255,218,0.08)"
                  }`,
                }}
              >
                {isFeatured && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 0 ${
                        group.color || "rgba(100,255,218,1)"
                      }00`,
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{
                      opacity: [0, 1, 0],
                      boxShadow: [
                        `0 0 0 0 ${brandColor}00`,
                        `0 0 40px 2px ${brandColor}55`,
                        `0 0 0 0 ${brandColor}00`,
                      ],
                    }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 2.2, delay: 0.4 + groupIndex * 0.1, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                )}

                {group.liveTile && (
                  <div
                    className="relative w-full mb-4 rounded-xl overflow-hidden"
                    style={{
                      height: "140px",
                      background: `radial-gradient(ellipse at center, ${brandColor}14 0%, transparent 70%)`,
                      border: `1px solid ${brandColor}1a`,
                    }}
                  >
                    {group.liveTile === "aws" && (
                      <AWSRegionsLive color={brandColor} />
                    )}
                    {group.liveTile === "kubestronaut" && (
                      <KubestronautRingLive
                        color={brandColor}
                        current={group.progress?.current}
                        total={group.progress?.total}
                      />
                    )}
                    {group.liveTile === "terraform" && (
                      <TerraformGraphLive color={brandColor} />
                    )}
                    {group.liveTile === "dynatrace" && (
                      <DynatraceWaveformLive color={brandColor} />
                    )}
                    {group.liveTile === "award" && (
                      <AwardSparkleLive color={group.color} />
                    )}
                    {group.liveTile === "redhat" && (
                      <RedHatRadarLive color={brandColor} />
                    )}
                    {group.liveTile === "gitlab" && (
                      <GitLabPipelineLive color={brandColor} />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: isFeatured ? "1.05rem" : "0.95rem",
                        fontWeight: 700,
                        color: brandColor,
                        lineHeight: 1.2,
                      }}
                    >
                      {group.vendor}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginTop: "2px",
                      }}
                    >
                      {group.certs.length}{" "}
                      {group.certs.length === 1
                        ? "certification"
                        : "certifications"}
                    </div>
                  </div>
                </div>

                {group.tagline && (
                  <div
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {group.tagline}
                  </div>
                )}

                <div
                  className={
                    isWide
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 flex-1"
                      : "flex flex-col flex-1"
                  }
                >
                  {group.certs.map((cert, certIndex) => {
                    const divider = isWide
                      ? certIndex >= 2
                      : certIndex > 0;
                    return (
                      <CertRow
                        key={cert.key}
                        cert={cert}
                        brandColor={brandColor}
                        accentBg={accentBg}
                        t={t}
                        featured={isFeatured}
                        divider={divider}
                      />
                    );
                  })}
                </div>

                {isFeatured && group.progress && (
                  <div
                    className="mt-auto pt-4"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          color: "var(--text-tertiary)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {group.progress.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: brandColor,
                        }}
                      >
                        {group.progress.current} / {group.progress.total}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--border-subtle)" }}
                      role="progressbar"
                      aria-valuenow={group.progress.current}
                      aria-valuemin={0}
                      aria-valuemax={group.progress.total}
                      aria-label={group.progress.label}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${
                            (group.progress.current / group.progress.total) *
                            100
                          }%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                        style={{
                          background: `linear-gradient(90deg, ${brandColor}, ${brandColor}aa)`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Certifications;
