import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaFolder } from "react-icons/fa";
import {
  sectionVariants, itemVariants, cardVariants, viewportConfig,
} from "../hooks/useMotion";

function Projects() {
  const { t } = useTranslation();

  const projects = [
    "cicd", "iac", "monitoring", "infrastructure", "portal", "containerization",
  ];

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
            <span className="section-label">{t("projects.title", "Projects")}</span>
            <h2 className="section-heading">
              {t("projects.heading", "Things I've built.")}
            </h2>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-12">
          {projects.map((projectKey, index) => (
            <motion.div
              key={projectKey}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="project-card flex flex-col rounded-2xl p-6 relative overflow-hidden cursor-default"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="project-gradient absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-400"
                style={{ background: "var(--gradient-accent)", opacity: 0 }}
              />

              <div
                className="project-icon-wrap w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-[18px] transition-all duration-300"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                <FaFolder />
              </div>

              <h3
                className="project-title-text mb-2.5 transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-display)", fontSize: "1.05rem",
                  fontWeight: 700, color: "var(--text-primary)",
                }}
              >
                {t(`projects.${projectKey}.title`)}
              </h3>

              <p
                className="mb-[18px] flex-grow"
                style={{ fontSize: "0.86rem", lineHeight: 1.65, color: "var(--text-secondary)" }}
              >
                {t(`projects.${projectKey}.description`)}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {t(`projects.${projectKey}.tech`, { returnObjects: true }).map((tech, i) => (
                  <span
                    key={i}
                    className="tech-tag py-[3px] px-2 rounded-md transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                      background: "var(--bg-elevated)", color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
