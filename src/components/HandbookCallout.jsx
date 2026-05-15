import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaCircle, FaExternalLinkAlt } from "react-icons/fa";
import {
  sectionVariants,
  itemVariants,
  viewportConfig,
} from "../hooks/useMotion";

// Browser-window framed preview of blog.cjoga.cloud's landing page.
// Inner content mirrors the actual Docusaurus index (hero +
// audience-paths + signoff). Hover applies an accent-border + glow
// highlight — no 3D tilt; the parallax was disorienting for visitors
// who weren't expecting their cursor to move the whole card.

const HANDBOOK_URL = "https://blog.cjoga.cloud";

const PATHS = [
  {
    key: "hiring",
    rows: [
      { path: "/me/who-i-am", labelKey: "whoIAm" },
      { path: "/engineering/work", labelKey: "whatBuilt" },
    ],
  },
  {
    key: "studying",
    hasIntro: true,
    rows: [{ path: "/learn/rhcsa", labelKey: "rhcsa" }],
  },
  {
    key: "lab",
    rows: [{ path: "/engineering/lab/overview", labelKey: "k3s" }],
  },
];

function PathBlock({ pathBlock, t }) {
  const { key, hasIntro, rows } = pathBlock;
  return (
    <div className="handbook-path-block">
      <div className="handbook-eyebrow handbook-eyebrow-sm">
        <span className="handbook-eyebrow-dot" aria-hidden="true" />
        {t(`handbook.paths.${key}.eyebrow`)}
      </div>
      {hasIntro ? (
        <p className="handbook-path-intro">
          {t(`handbook.paths.${key}.intro`)}
        </p>
      ) : null}
      <nav
        className="handbook-rows"
        aria-label={t(`handbook.paths.${key}.eyebrow`)}
      >
        {rows.map((row) => (
          <a
            key={row.path}
            href={`${HANDBOOK_URL}${row.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="handbook-row"
          >
            <div className="handbook-row-label">
              {t(`handbook.paths.${key}.${row.labelKey}`)}
            </div>
            <div className="handbook-row-arrow" aria-hidden="true">
              →
            </div>
          </a>
        ))}
      </nav>
    </div>
  );
}

export default function HandbookCallout() {
  const { t } = useTranslation();

  return (
    <section id="handbook" className="handbook-section">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="handbook-section-inner"
      >
        <motion.div variants={itemVariants} className="handbook-section-header">
          <span className="section-label">{t("handbook.label")}</span>
          <h2 className="section-heading">{t("handbook.heading")}</h2>
          <p className="handbook-section-sub">{t("handbook.subheading")}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="handbook-window">
          {/* Browser chrome */}
          <div className="handbook-chrome">
            <div className="handbook-chrome-dots">
              <span className="handbook-dot" style={{ background: "#ff5f56" }} />
              <span className="handbook-dot" style={{ background: "#ffbd2e" }} />
              <span className="handbook-dot" style={{ background: "#27c93f" }} />
            </div>
            <a
              href={HANDBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="handbook-urlbar"
              aria-label={t("handbook.windowAriaLabel")}
            >
              <FaCircle size={6} style={{ color: "#27c93f", opacity: 0.85 }} />
              <span>blog.cjoga.cloud</span>
            </a>
            <a
              href={HANDBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="handbook-chrome-open"
              aria-label={t("handbook.windowAriaLabel")}
            >
              <FaExternalLinkAlt size={11} />
            </a>
          </div>

          {/* Window content — mirrors the Docusaurus landing */}
          <div className="handbook-content">
            <div className="handbook-hero">
              <div className="handbook-eyebrow">
                <span className="handbook-eyebrow-dot" aria-hidden="true" />
                {t("handbook.eyebrow")}
              </div>
              <h2 className="handbook-title">{t("handbook.title")}</h2>
              <p className="handbook-lede">
                {t("handbook.ledeBefore")}
                <code>{t("handbook.ledeCode")}</code>
                {t("handbook.ledeAfter")}
              </p>
            </div>

            <div className="handbook-paths">
              {PATHS.map((pathBlock) => (
                <PathBlock key={pathBlock.key} pathBlock={pathBlock} t={t} />
              ))}
            </div>

            <div className="handbook-signoff">
              <p>
                {t("handbook.signoff")}{" "}
                <a
                  href={`${HANDBOOK_URL}/me/who-i-am#how-to-reach-me`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="handbook-signoff-link"
                >
                  {t("handbook.signoffLink")}
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
