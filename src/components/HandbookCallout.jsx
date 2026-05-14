import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  sectionVariants,
  itemVariants,
  viewportConfig,
} from "../hooks/useMotion";

// Mirrors the Docusaurus landing at blog.cjoga.cloud — same audience-paths
// pattern, same typographic rows, same orb backdrop — so the portfolio
// callout reads as a true preview of the handbook, not a different surface.

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
    <section className="handbook-path-block">
      <div className="handbook-eyebrow">
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
    </section>
  );
}

export default function HandbookCallout() {
  const { t } = useTranslation();

  return (
    <section id="handbook" className="handbook-section">
      <div className="handbook-backdrop" aria-hidden="true">
        <div className="handbook-orb handbook-orb-accent" />
        <div className="handbook-orb handbook-orb-blue" />
      </div>

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="handbook-inner"
      >
        <motion.div variants={itemVariants} className="handbook-hero">
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
        </motion.div>

        <motion.div variants={itemVariants} className="handbook-paths">
          {PATHS.map((pathBlock) => (
            <PathBlock key={pathBlock.key} pathBlock={pathBlock} t={t} />
          ))}
        </motion.div>

        <motion.footer variants={itemVariants} className="handbook-signoff">
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
        </motion.footer>
      </motion.div>
    </section>
  );
}
