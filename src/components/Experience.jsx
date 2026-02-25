import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  sectionVariants, itemVariants, cardVariants,
  SPRING_CONFIG, viewportConfig,
} from "../hooks/useMotion";

function Experience() {
  const { t } = useTranslation();
  const timelineRef = useRef(null);

  // Timeline draw: line grows as section scrolls into view
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.3"],
  });
  const lineScale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 40, damping: 25, mass: 1 }
  );

  const companyKeys = ["arroyo", "flBetances", "shadowSoft"];
  const isActive = (index) => index === 0;

  return (
    <section id="experience">
      <div className="section-inner">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">{t("experience.title", "Experience")}</span>
            <h2 className="section-heading">
              {t("experience.heading", "Where I've worked.")}
            </h2>
          </motion.div>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mt-12">
          {/* Timeline line — draws itself via scaleY */}
          <motion.div
            className="absolute top-0 bottom-0 hidden md:block"
            style={{
              left: "32px",
              width: "1px",
              background: "linear-gradient(to bottom, transparent, var(--border-medium) 10%, var(--border-medium) 90%, transparent)",
              scaleY: lineScale,
              transformOrigin: "top",
            }}
          />
          <motion.div
            className="absolute top-0 bottom-0 md:hidden"
            style={{
              left: "16px",
              width: "1px",
              background: "linear-gradient(to bottom, transparent, var(--border-medium) 10%, var(--border-medium) 90%, transparent)",
              scaleY: lineScale,
              transformOrigin: "top",
            }}
          />

          {companyKeys.map((key, index) => (
            <motion.div
              key={key}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative mb-10 pl-11 md:pl-[72px]"
            >
              {/* Timeline dot — scales in */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", ...SPRING_CONFIG, delay: index * 0.15 }}
                className="absolute top-7 left-[11px] md:left-[27px] w-[11px] h-[11px] rounded-full z-[2]"
                style={{
                  background: "var(--bg-primary)",
                  border: "2px solid var(--accent)",
                }}
              />

              {/* Pulse ring for active entry */}
              {isActive(index) && (
                <div
                  className="absolute top-[24px] left-[7px] md:left-[23px] w-[19px] h-[19px] rounded-full z-[1]"
                  style={{
                    border: "1px solid var(--accent)",
                    animation: "ring-pulse 2s ease-out infinite",
                  }}
                />
              )}

              {/* Card */}
              <div
                className="timeline-card rounded-2xl p-6 md:p-7 transition-all duration-400"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {/* Meta row */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <span
                    className="py-1 px-2.5 rounded-md"
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                      color: "var(--accent)", background: "var(--accent-dim)",
                    }}
                  >
                    {t(`experience.${key}.period`)}
                  </span>
                  {isActive(index) && (
                    <span
                      className="flex items-center gap-1.5"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                        color: "#22c55e", letterSpacing: "0.05em", textTransform: "uppercase",
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                      />
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Role & company */}
                <h3
                  className="mb-0.5"
                  style={{
                    fontFamily: "var(--font-display)", fontSize: "1.2rem",
                    fontWeight: 700, color: "var(--text-primary)",
                  }}
                >
                  {t(`experience.${key}.title`)}
                </h3>
                <p
                  className="mb-4"
                  style={{ fontSize: "1rem", color: "var(--accent)", fontWeight: 500 }}
                >
                  {t(`experience.${key}.company`)}
                </p>

                {/* Responsibilities */}
                <ul className="list-none p-0">
                  {t(`experience.${key}.responsibilities`, { returnObjects: true }).map(
                    (item, i) => (
                      <li
                        key={i}
                        className="relative pl-5 mb-2.5"
                        style={{
                          fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6,
                        }}
                      >
                        <span
                          className="absolute left-0"
                          style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.5 }}
                        >
                          ›
                        </span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
