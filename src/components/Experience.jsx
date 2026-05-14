import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  sectionVariants,
  itemVariants,
  cardVariants,
  SPRING_CONFIG,
  viewportConfig,
} from "../hooks/useMotion";

const COMPANY_META = {
  inspyr: { initial: "I", color: "#2563eb" },
  flBetances: { initial: "F", color: "#d97706" },
  arctiq: { initial: "A", color: "#10b981" },
};

function Experience() {
  const { t } = useTranslation();
  const timelineRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.3"],
  });
  const lineScale = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 40,
    damping: 25,
    mass: 1,
  });

  const companyKeys = ["inspyr", "flBetances", "arctiq"];
  const isActive = (key) => {
    const period = t(`experience.${key}.period`);
    return /present|presente/i.test(period);
  };

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
            <span className="section-label">
              {t("experience.title", "Experience")}
            </span>
            <h2 className="section-heading">
              {t("experience.heading", "Where I've worked.")}
            </h2>
          </motion.div>
        </motion.div>

        <div
          ref={timelineRef}
          className="relative mt-12"
          role="list"
          aria-label={t("experience.title", "Experience")}
        >
          <motion.div
            className="absolute top-0 bottom-0 hidden md:block"
            style={{
              left: "32px",
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, var(--border-medium) 10%, var(--border-medium) 90%, transparent)",
              scaleY: lineScale,
              transformOrigin: "top",
            }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute top-0 bottom-0 md:hidden"
            style={{
              left: "16px",
              width: "1px",
              background:
                "linear-gradient(to bottom, transparent, var(--border-medium) 10%, var(--border-medium) 90%, transparent)",
              scaleY: lineScale,
              transformOrigin: "top",
            }}
            aria-hidden="true"
          />

          {companyKeys.map((key, index) => {
            const active = isActive(key);
            const meta = COMPANY_META[key] || { initial: "•", color: "var(--accent)" };
            return (
              <motion.div
                key={key}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative mb-10 pl-12 md:pl-[72px]"
                role="listitem"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    ...SPRING_CONFIG,
                    delay: index * 0.15,
                  }}
                  className="absolute top-6 left-0 md:left-[16px] w-8 h-8 rounded-full flex items-center justify-center z-[2]"
                  style={{
                    background: "var(--bg-surface)",
                    border: `2px solid ${meta.color}`,
                    boxShadow: `0 0 0 4px var(--bg-void), 0 4px 14px ${meta.color}40`,
                    color: meta.color,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                  aria-hidden="true"
                >
                  {meta.initial}
                </motion.div>

                {active && (
                  <div
                    className="absolute top-[20px] left-[-4px] md:left-[12px] w-10 h-10 rounded-full z-[1]"
                    style={{
                      border: `1px solid ${meta.color}`,
                      animation: "ring-pulse 2.4s ease-out infinite",
                    }}
                    aria-hidden="true"
                  />
                )}

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "tween", duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="timeline-card rounded-2xl p-6 md:p-7 transition-colors duration-300"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <span
                      className="py-1 px-2.5 rounded-md"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "var(--accent)",
                        background: "var(--accent-dim)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {t(`experience.${key}.period`)}
                    </span>
                    {active ? (
                      <span
                        className="flex items-center gap-1.5"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "#22c55e",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          className="w-[5px] h-[5px] rounded-full"
                          style={{
                            background: "#22c55e",
                            boxShadow: "0 0 6px #22c55e",
                          }}
                          aria-hidden="true"
                        />
                        {t("experience.active", "Active")}
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1.5"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--text-tertiary)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          className="w-[5px] h-[5px] rounded-full"
                          style={{ background: "var(--text-tertiary)" }}
                          aria-hidden="true"
                        />
                        {t("experience.past", "Past")}
                      </span>
                    )}
                  </div>

                  <h3
                    className="mb-0.5"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      textWrap: "balance",
                    }}
                  >
                    {t(`experience.${key}.title`)}
                  </h3>
                  <p
                    className="mb-4"
                    style={{
                      fontSize: "1rem",
                      color: meta.color,
                      fontWeight: 500,
                    }}
                  >
                    {t(`experience.${key}.company`)}
                  </p>

                  <ul className="list-none p-0">
                    {t(`experience.${key}.responsibilities`, {
                      returnObjects: true,
                    }).map((item, i) => (
                      <li
                        key={i}
                        className="relative pl-5 mb-2.5"
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          className="absolute left-0"
                          style={{
                            color: meta.color,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            lineHeight: 1.5,
                          }}
                          aria-hidden="true"
                        >
                          ›
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Experience;
