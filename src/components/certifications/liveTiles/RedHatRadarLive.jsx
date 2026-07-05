import { m, useReducedMotion } from "framer-motion";
import { FaRedhat } from "react-icons/fa";

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
        <span
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
            <m.div
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
                <m.span
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
                </m.span>
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
            </m.div>
          );
        })}
      </div>

      {/* Shadowman logo, bottom-right */}
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
          <FaRedhat style={{ fontSize: "1.7rem" }} />
        </m.div>
      </div>
    </div>
  );
}

export default RedHatRadarLive;
