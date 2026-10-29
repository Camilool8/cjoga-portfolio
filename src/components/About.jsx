import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { FaAws, FaMicrosoft, FaDocker } from "react-icons/fa";
import {
  SiTerraform, SiAnsible, SiKubernetes, SiGitlab,
  SiJenkins, SiDynatrace, SiGithubactions,
  SiClaude, SiModelcontextprotocol, SiArgo, SiGrafana, SiOpentelemetry,
  SiGnubash, SiAnthropic,
} from "react-icons/si";
import SectionHeading from "./SectionHeading";
import { VscTerminalPowershell } from "react-icons/vsc";
import {
  sectionVariants, itemVariants,
  useParallax, viewportConfig,
} from "../hooks/useMotion";

// Desktop only: the monitoring loop as one path, from under the last
// stage's last tool, along the bottom, up into the first stage's last
// tool. One path gives even dots through the corners, and the signal
// rides the same path (offset-path), so it rounds them too. Measured
// from the layout, so it follows the columns at any width.
function useLoopPath(trackRef) {
  const [loop, setLoop] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const stages = track.querySelectorAll(".stack-stage");
      if (!wide.matches || stages.length < 2) {
        setLoop(null);
        return;
      }
      const box = track.getBoundingClientRect();
      const tip = (stage) => {
        const r = stage.querySelector(".stack-chips").lastElementChild.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.bottom - box.top + 4];
      };
      const [x1, y1] = tip(stages[0]);
      const [x2, y2] = tip(stages[stages.length - 1]);
      const ol = track.querySelector(".stack-flow").getBoundingClientRect();
      const yb = ol.bottom - box.top + 26;
      const r = 14;
      const f = (n) => Math.round(n * 10) / 10;
      setLoop({
        d: `M${f(x2)} ${f(y2)} V${f(yb - r)} A${r} ${r} 0 0 1 ${f(x2 - r)} ${f(yb)} H${f(x1 + r)} A${r} ${r} 0 0 1 ${f(x1)} ${f(yb - r)} V${f(y1)}`,
        arrow: `M${f(x1 - 4.5)} ${f(y1 + 5)} L${f(x1)} ${f(y1 + 0.5)} L${f(x1 + 4.5)} ${f(y1 + 5)}`,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    wide.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, [trackRef]);

  return loop;
}

function About() {
  const { t } = useTranslation();
  const photoRef = useRef(null);
  const photoY = useParallax(photoRef, 30);
  const [live, setLive] = useState(false);
  const trackRef = useRef(null);
  const loop = useLoopPath(trackRef);

  // The stack in the order a change travels it, from a script to
  // production and back through monitoring. AI and automation is not a
  // stage: it runs alongside all of them.
  const stages = [
    { id: "scripting", items: [["Bash", SiGnubash, "#4eaa25"], ["PowerShell", VscTerminalPowershell, "#5391fe"]] },
    { id: "delivery", items: [["ArgoCD", SiArgo, "#ef7b4d"], ["GitLab CI", SiGitlab, "#fc6d26"], ["GitHub Actions", SiGithubactions, "#2088ff"], ["Azure DevOps", FaMicrosoft, "#0078d4"], ["Jenkins", SiJenkins, "#d24939"]] },
    { id: "platform", items: [["Kubernetes", SiKubernetes, "#326ce5"], ["Terraform", SiTerraform, "#7b42bc"], ["Ansible", SiAnsible, "#ee0000"], ["Docker", FaDocker, "#2496ed"]] },
    { id: "cloud", items: [["AWS · EKS", FaAws, "#ff9900"], ["Azure · AKS", FaMicrosoft, "#0078d4"]] },
    { id: "observability", items: [["OpenTelemetry", SiOpentelemetry, "#f5a800"], ["Grafana", SiGrafana, "#f46800"], ["Dynatrace", SiDynatrace, "#1496ff"]] },
  ];
  const agents = [["Claude Code", SiClaude, "#d97757"], ["MCP servers", SiModelcontextprotocol, "#8b8bf5"], ["Agent Skills", SiAnthropic, "#d97757"]];

  const chips = (items) => (
    <ul className="stack-chips">
      {items.map(([name, Icon, brand]) => (
        <li key={name} className="about-stack__item" style={{ "--brand": brand }}>
          <span aria-hidden="true"><Icon /></span>
          {name}
        </li>
      ))}
    </ul>
  );

  return (
    <section id="about">
      <div className="section-inner">
        <div className="grid grid-cols-1 gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <div>
              <m.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfig}
              >
                <SectionHeading title={t("about.heading")} muted={t("about.headingMuted")} />

                <m.div variants={itemVariants}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "20px" }}>
                    {t("about.paragraph1")}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "20px" }}>
                    {t("about.paragraph2")}
                  </p>
                </m.div>

              </m.div>
            </div>

            <m.div
              ref={photoRef}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              <m.div
                variants={itemVariants}
                style={{ y: photoY }}
                className="relative rounded-2xl overflow-hidden"
              >
                <div
                  style={{
                    aspectRatio: "1/1",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src="/images/camilo.webp"
                    alt="José Camilo Joga Guerrero"
                    className="photo-img w-full h-full object-cover object-top transition-[filter] duration-500"
                    width="560"
                    height="560"
                    style={{ filter: "grayscale(0.8) contrast(1.05)" }}
                    loading="lazy"
                  />
                  <div
                    className="absolute top-[-1px] left-[-1px] w-10 h-10 z-10"
                    style={{ borderTop: "2px solid var(--accent)", borderLeft: "2px solid var(--accent)", borderRadius: "16px 0 0 0" }}
                  />
                  <div
                    className="absolute bottom-[-1px] right-[-1px] w-10 h-10 z-10"
                    style={{ borderBottom: "2px solid var(--accent)", borderRight: "2px solid var(--accent)", borderRadius: "0 0 16px 0" }}
                  />
                </div>
              </m.div>
            </m.div>
          </div>

          {/* Full width under the text and the photo: the stack as a
              pipeline. Phones read it down a vertical line; desktop lays
              it out left to right. One signal travels the line the first
              time it scrolls into view, lighting each stage it reaches. */}
          <m.div
            className={`stack-map${live ? " is-live" : ""}`}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            onViewportEnter={() => setLive(true)}
          >
            <h3 className="stack-map__title">{t("about.stack.title")}</h3>
            <div className="stack-lane">
              <p className="stack-lane__name">
                {t("about.stack.agents")}
                <span>{t("about.stack.lane")}</span>
              </p>
              {chips(agents)}
            </div>
            {/* The track holds the stages and the return line. On desktop
                the loop leaves the last tool of the last stage and comes
                back up into the last tool of the first. */}
            <div className="stack-track" ref={trackRef}>
              {loop && (
                <svg className="stack-loop-line" aria-hidden="true">
                  <path d={loop.d} />
                  <path d={loop.arrow} className="stack-loop-line__arrow" />
                </svg>
              )}
              {loop && (
                <span className="stack-loop-dot" style={{ offsetPath: `path("${loop.d}")` }} aria-hidden="true" />
              )}
              <ol className="stack-flow">
                {stages.map((stage, i) => (
                  <li key={stage.id} className="stack-stage" style={{ "--i": i }}>
                    {i < stages.length - 1 && (
                      <span className="stack-stage__seg" aria-hidden="true">
                        <i />
                      </span>
                    )}
                    <span className="stack-stage__node" aria-hidden="true" />
                    <p className="stack-stage__name">{t(`about.stack.${stage.id}`)}</p>
                    {chips(stage.items)}
                  </li>
                ))}
              </ol>
              <p className="stack-loop">
                <span>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="M13 9a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t("about.stack.loop")}
                </span>
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

export default About;
