import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaAws, FaMicrosoft, FaDocker } from "react-icons/fa";
import {
  SiTerraform, SiAnsible, SiKubernetes, SiGitlab,
  SiJenkins, SiDynatrace, SiPowershell,
} from "react-icons/si";
import {
  sectionVariants, itemVariants, cardVariants,
  useParallax, viewportConfig,
} from "../hooks/useMotion";

function About() {
  const { t } = useTranslation();
  const photoRef = useRef(null);
  const photoY = useParallax(photoRef, 30);

  const skills = [
    { name: "AWS", icon: <FaAws /> },
    { name: "Azure", icon: <FaMicrosoft /> },
    { name: "Terraform", icon: <SiTerraform /> },
    { name: "Ansible", icon: <SiAnsible /> },
    { name: "Kubernetes", icon: <SiKubernetes /> },
    { name: "EKS", icon: <FaAws /> },
    { name: "AKS", icon: <FaMicrosoft /> },
    { name: "Docker", icon: <FaDocker /> },
    { name: "GitLab CI", icon: <SiGitlab /> },
    { name: "Azure DevOps", icon: <FaMicrosoft /> },
    { name: "Jenkins", icon: <SiJenkins /> },
    { name: "ArgoCD", icon: <SiKubernetes /> },
    { name: "Dynatrace", icon: <SiDynatrace /> },
    { name: "PowerShell", icon: <SiPowershell /> },
  ];

  return (
    <section id="about">
      <div className="section-inner">
        <div className="grid grid-cols-1 gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
            <div>
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportConfig}
              >
                <motion.div variants={itemVariants}>
                  <span className="section-label">{t("about.title", "About")}</span>
                  <h2 className="section-heading">
                    {t("about.heading", "Building systems that scale.")}
                  </h2>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "20px" }}>
                    {t("about.paragraph1")}
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "20px" }}>
                    {t("about.paragraph2")}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skills.map((skill, i) => (
                      <motion.div
                        key={skill.name}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="skill-node flex items-center gap-2.5 py-2.5 px-3.5 rounded-[10px] cursor-default transition-all duration-300"
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-subtle)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span className="text-base">{skill.icon}</span>
                        {skill.name}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              ref={photoRef}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              <motion.div
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
                    src="/images/og-image.webp"
                    alt="Jose Camilo Joga Guerrero"
                    className="photo-img w-full h-full object-cover object-top transition-[filter] duration-500"
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
              </motion.div>

              <div className="grid grid-cols-3 gap-2.5 mt-3.5">
                {[
                  { number: "4+", label: t("about.stats.years", "Years Exp") },
                  { number: "10", label: t("about.stats.certs", "Certs") },
                  { number: "2", label: t("about.stats.clouds", "Clouds") },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="stat-card text-center py-3.5 px-2 rounded-xl"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700,
                        color: "var(--accent)", lineHeight: 1,
                      }}
                    >
                      {stat.number}
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                        letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-tertiary)",
                      }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
