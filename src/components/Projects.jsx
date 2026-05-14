import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaAws, FaMicrosoft, FaDocker, FaVuejs, FaNodeJs, FaLinux } from "react-icons/fa";
import {
  SiGitlab,
  SiKubernetes,
  SiTerraform,
  SiDynatrace,
  SiGrafana,
  SiPrometheus,
  SiAnsible,
  SiHelm,
  SiPostgresql,
  SiJenkins,
} from "react-icons/si";
import {
  sectionVariants,
  itemVariants,
  cardVariants,
  viewportConfig,
} from "../hooks/useMotion";

// Each project gets a themed visual identity: a primary color, a gradient
// background for the preview area, and a stack of tech icons rendered large.
// No fake screenshots — what you see is the stack the project actually runs on.
const projects = [
  {
    key: "cicd",
    color: "#fc6d26",
    accent: "#ffb088",
    icons: [SiGitlab, SiKubernetes, SiHelm],
  },
  {
    key: "iac",
    color: "#7f4dff",
    accent: "#b08aff",
    icons: [SiTerraform, FaAws, FaMicrosoft],
  },
  {
    key: "monitoring",
    color: "#73be28",
    accent: "#a8e068",
    icons: [SiDynatrace, SiGrafana, SiPrometheus],
  },
  {
    key: "infrastructure",
    color: "#ee0000",
    accent: "#ff6666",
    icons: [SiAnsible, FaAws, FaLinux],
  },
  {
    key: "portal",
    color: "#41b883",
    accent: "#7ed4a6",
    icons: [FaVuejs, FaNodeJs, FaDocker],
  },
  {
    key: "containerization",
    color: "#2496ed",
    accent: "#7cc0ff",
    icons: [FaDocker, SiKubernetes, SiJenkins],
  },
];

function ProjectPreview({ project }) {
  const [IconA, IconB, IconC] = project.icons;
  return (
    <div
      className="project-preview relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        background: `linear-gradient(135deg, ${project.color}22 0%, ${project.color}08 60%, transparent 100%)`,
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
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">
              {t("projects.title", "Projects")}
            </span>
            <h2 className="section-heading">
              {t("projects.heading", "Things I've built.")}
            </h2>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.key}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ type: "tween", duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="project-card group flex flex-col rounded-2xl overflow-hidden cursor-default"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                "--project-color": project.color,
              }}
            >
              <ProjectPreview project={project} />

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
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
