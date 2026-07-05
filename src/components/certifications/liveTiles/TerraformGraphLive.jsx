import { m, useReducedMotion } from "framer-motion";
import { SiTerraform } from "react-icons/si";

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
        <span
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
            <m.div
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
            </m.div>
          );
        })}

        {/* Plan summary line */}
        <m.div
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
        </m.div>
      </div>

      {/* Terraform brand mark, bottom-right */}
      <div className="absolute bottom-1.5 right-2 pointer-events-none">
        <m.div
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
        </m.div>
      </div>
    </div>
  );
}

export default TerraformGraphLive;
