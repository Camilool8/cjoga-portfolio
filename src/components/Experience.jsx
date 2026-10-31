import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { m, AnimatePresence, useScroll, useTransform } from "framer-motion";
import SectionHeading from "./SectionHeading";
import {
  sectionVariants,
  itemVariants,
  cardVariants,
  SPRING_CONFIG,
  viewportConfig,
} from "../hooks/useMotion";

// Each employer's square mark, as on LinkedIn; the colour tints the
// pulse ring on current roles.
const COMPANY_META = {
  globant: { logo: "/images/logos/globant.svg", color: "#8dc63f" },
  kodepull: { logo: "/images/logos/kodepull.svg", color: "#fe5502" },
  flBetances: { logo: "/images/logos/fl-betances.png", color: "#1a2a9c" },
  arctiq: { logo: "/images/logos/arctiq.svg", color: "#10b981" },
};

// Each role leads with its three strongest lines; the rest open on
// demand so the section reads in a minute and still holds the record.
const LEAD_LINES = 3;

function Experience() {
  const { t } = useTranslation();
  const timelineRef = useRef(null);
  const [expanded, setExpanded] = useState({});

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.3"],
  });
  // Raw transform — no spring. Spring kept interpolating after scroll stopped,
  // wasting frames on what is ultimately just a thin vertical line.
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const companyKeys = ["globant", "kodepull", "flBetances", "arctiq"];
  const isActive = (key) => {
    const period = t(`experience.${key}.period`);
    return /present|presente/i.test(period);
  };

  return (
    <section id="experience">
      <div className="section-inner">
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <SectionHeading title={t("experience.heading")} muted={t("experience.headingMuted")} />
          <m.p variants={itemVariants} className="section-lede">
            {t("experience.lede")}
          </m.p>
        </m.div>

        <div
          ref={timelineRef}
          className="relative mt-12"
          role="list"
          aria-label={t("experience.title", "Experience")}
        >
          <m.div
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
          <m.div
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
            const meta = COMPANY_META[key] || { logo: null, color: "var(--accent)" };
            const lines = t(`experience.${key}.responsibilities`, { returnObjects: true });
            const list = Array.isArray(lines) ? lines : [];
            const isOpen = Boolean(expanded[key]);
            const extra = list.length - LEAD_LINES;
            const renderLine = (item) => (
              <li
                key={item}
                className="relative pl-5 mb-2.5"
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  maxWidth: "72ch",
                }}
              >
                <span
                  className="absolute left-0"
                  style={{
                    color: "var(--text-tertiary)",
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
            );
            return (
              <m.div
                key={key}
                id={`exp-${key}`}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative mb-10 pl-12 md:pl-[72px]"
                role="listitem"
              >
                <m.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    ...SPRING_CONFIG,
                    delay: index * 0.15,
                  }}
                  className="absolute top-6 left-0 md:left-[16px] w-8 h-8 rounded-lg overflow-hidden z-[2]"
                  style={{
                    background: "var(--bg-surface)",
                    // The void ring cuts the timeline line around the mark;
                    // the hairline keeps a white mark's edge on a light page.
                    boxShadow: `0 0 0 4px var(--bg-void), 0 0 0 5px var(--border-subtle), 0 4px 14px ${meta.color}40`,
                  }}
                  aria-hidden="true"
                >
                  {meta.logo && (
                    <img
                      src={meta.logo}
                      alt=""
                      width="32"
                      height="32"
                      loading="lazy"
                      decoding="async"
                      className="block w-full h-full"
                    />
                  )}
                </m.div>

                {active && (
                  <div
                    className="absolute top-[20px] left-[-4px] md:left-[12px] w-10 h-10 rounded-xl z-[1]"
                    style={{
                      border: `1px solid ${meta.color}`,
                      animation: "ring-pulse 2.4s ease-out infinite",
                    }}
                    aria-hidden="true"
                  />
                )}

                <div
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
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        color: "var(--accent-ink)",
                        background: "var(--accent-dim)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {t(`experience.${key}.period`)}
                    </span>
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
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    {t(`experience.${key}.company`)}
                  </p>

                  <ul className="list-none p-0 m-0">{list.slice(0, LEAD_LINES).map(renderLine)}</ul>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.ul
                        id={`exp-${key}-more`}
                        className="list-none p-0 m-0 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {list.slice(LEAD_LINES).map(renderLine)}
                      </m.ul>
                    )}
                  </AnimatePresence>
                  {extra > 0 && (
                    <button
                      type="button"
                      className="exp-toggle"
                      aria-expanded={isOpen}
                      aria-controls={`exp-${key}-more`}
                      onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                    >
                      {isOpen
                        ? t("experience.showLess")
                        : t("experience.showMore", { count: extra })}
                    </button>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Experience;
