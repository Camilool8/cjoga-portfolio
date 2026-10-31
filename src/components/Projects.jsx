import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { FaAws, FaVuejs, FaServer } from "react-icons/fa";
import { VscAzure, VscAzureDevops } from "react-icons/vsc";
import {
  SiGitlab,
  SiKubernetes,
  SiTerraform,
  SiGrafana,
  SiPrometheus,
  SiOpentelemetry,
  SiArgo,
  SiDotnet,
  SiCloudflare,
  SiGo,
  SiReact,
} from "react-icons/si";
import {
  sectionVariants,
  cardVariants,
  viewportConfig,
} from "../hooks/useMotion";
import { FiArrowUpRight } from "react-icons/fi";
import SectionHeading from "./SectionHeading";
import ClusterMap from "./uishots/ClusterMap";
import SimWorkspace from "./uishots/SimWorkspace";

const HANDBOOK_URL = "https://blog.cjoga.cloud";

// Each project gets a themed visual identity: a primary color, a gradient
// background for the preview area, and a stack of tech icons rendered large.
// No fake screenshots — what you see is the stack the project actually runs on.
// Every card links to the handbook write-up that tells the full story,
// and names that destination. Spans tile the hairline grid with no
// orphan cell: 2+6 on two columns, 2+1/3/1+2 on three.
const projects = [
  {
    key: "kubestronautSim",
    link: "sim",
    shot: "sim",
    span: "md:col-span-2",
    color: "#326ce5",
    accent: "#7ea6f0",
    icons: [SiKubernetes, SiGo, SiReact],
    caseStudy: `${HANDBOOK_URL}/learn/kubestronaut-sim`,
  },
  {
    key: "cicd",
    link: "arctiq",
    span: "",
    color: "#ff9900",
    accent: "#ffc266",
    icons: [FaAws, SiGitlab, SiKubernetes],
    caseStudy: `${HANDBOOK_URL}/engineering/work/arctiq`,
  },
  {
    key: "iac",
    link: "flBetances",
    span: "",
    color: "#7b42bc",
    accent: "#b08aff",
    icons: [SiTerraform, VscAzure, VscAzureDevops],
    caseStudy: `${HANDBOOK_URL}/engineering/work/fl-betances`,
  },
  {
    key: "monitoring",
    link: "arctiq",
    span: "",
    color: "#f46800",
    accent: "#f99d5c",
    icons: [SiGrafana, SiOpentelemetry, SiPrometheus],
    caseStudy: `${HANDBOOK_URL}/engineering/work/arctiq`,
  },
  {
    key: "infrastructure",
    link: "globant",
    span: "",
    color: "#0078d4",
    accent: "#5fb0ec",
    icons: [VscAzure, SiGrafana, SiArgo],
    caseStudy: `${HANDBOOK_URL}/engineering/work/globant`,
  },
  {
    key: "portal",
    link: "flBetances",
    span: "",
    color: "#41b883",
    accent: "#7ed4a6",
    icons: [FaVuejs, SiDotnet, SiArgo],
    caseStudy: `${HANDBOOK_URL}/engineering/work/fl-betances`,
  },
  {
    key: "containerization",
    link: "lab",
    shot: "lab",
    span: "lg:col-span-2",
    color: "#ffc61c",
    accent: "#ffdd73",
    icons: [SiKubernetes, SiCloudflare, FaServer],
    caseStudy: `${HANDBOOK_URL}/engineering/lab/overview`,
  },
];

function ProjectPreview({ project }) {
  const [IconA, IconB, IconC] = project.icons;
  return (
    <div
      // A dark "screen" in both themes, like the cert tiles: the brand glow
      // reads as light on dark, and as a faint smudge on a pale card.
      className="project-preview chapter-dark relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        background: `linear-gradient(135deg, ${project.color}2e 0%, ${project.color}0d 60%, transparent 100%), var(--bg-void)`,
        borderBottom: "1px solid var(--border-subtle)",
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, ${project.color}26 0%, transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <div className="project-icons absolute inset-0 flex items-center justify-center gap-5 sm:gap-7 transition-transform duration-700 ease-out group-hover:scale-105">
        <IconC
          className="project-icon-side"
          style={{
            fontSize: "2rem",
            color: project.accent,
            opacity: 0.55,
            filter: `drop-shadow(0 4px 12px ${project.color}40)`,
          }}
        />
        <IconA
          className="project-icon-main"
          style={{
            fontSize: "3.2rem",
            color: project.color,
            filter: `drop-shadow(0 6px 18px ${project.color}55)`,
          }}
        />
        <IconB
          className="project-icon-side"
          style={{
            fontSize: "2rem",
            color: project.accent,
            opacity: 0.55,
            filter: `drop-shadow(0 4px 12px ${project.color}40)`,
          }}
        />
      </div>
    </div>
  );
}

function Projects() {
  const { t } = useTranslation();

  return (
    <section id="projects">
      <div className="section-inner">
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <SectionHeading title={t("projects.heading")} muted={t("projects.headingMuted")} />
        </m.div>

        <m.div
          className="hairline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          {projects.map((project, index) => (
            <m.a
              key={project.key}
              href={project.caseStudy}
              target="_blank"
              rel="noopener noreferrer"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              aria-label={`${t(`projects.${project.key}.title`)}: ${t(`projects.links.${project.link}`)} ${t("certifications.opensInNewTab")}`}
              className={`project-card group relative flex flex-col overflow-hidden no-underline ${project.span}`}
              style={{ "--project-color": project.color }}
            >
              {project.shot ? (
                <div className="uishot-card">
                  {project.shot === "sim" ? (
                    <SimWorkspace label={t("projects.shots.sim")} />
                  ) : (
                    <ClusterMap label={t("projects.shots.lab")} />
                  )}
                </div>
              ) : (
                <ProjectPreview project={project} />
              )}

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h3
                  className="project-title-text mb-2 transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textWrap: "balance",
                  }}
                >
                  {t(`projects.${project.key}.title`)}
                </h3>

                <p
                  className="mb-4 flex-grow"
                  style={{
                    fontSize: "0.86rem",
                    lineHeight: 1.65,
                    color: "var(--text-secondary)",
                    textWrap: "pretty",
                  }}
                >
                  {t(`projects.${project.key}.description`)}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {t(`projects.${project.key}.tech`, {
                    returnObjects: true,
                  }).map((tech, i) => (
                    <span
                      key={i}
                      className="tech-tag py-[3px] px-2 rounded-md transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.75rem",
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div
                  className="mt-4 flex items-center gap-1.5 transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span className="group-hover:underline underline-offset-4">
                    {t(`projects.links.${project.link}`)}
                  </span>
                  <FiArrowUpRight
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: project.color }}
                  />
                </div>
              </div>
            </m.a>
          ))}
        </m.div>
      </div>
    </section>
  );
}

export default Projects;
