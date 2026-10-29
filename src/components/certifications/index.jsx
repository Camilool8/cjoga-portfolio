import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  m,
  useMotionValue,
  useTransform,
  animate as animateValue,
  useReducedMotion,
} from "framer-motion";
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  sectionVariants,
  itemVariants,
  cardVariants,
  viewportConfig,
} from "../../hooks/useMotion";
import { CERT_GROUPS, CERT_COUNT } from "./certData";
import LiveTileFrame from "./liveTiles/LiveTileFrame";
import SectionHeading from "../SectionHeading";

// English fallbacks for the per-group taglines — the real strings live in
// the locale files under `certifications.groups.<groupId>.tagline`.
const TAGLINE_DEFAULTS = {
  kubestronaut: "On the road to Kubestronaut",
  aws: "Cloud architecture & operations",
  terraform: "Infrastructure as Code",
  dynatrace: "Application observability",
  partner: "Accredited engineer",
  redhat: "Linux & system administration",
  gitlab: "DevSecOps & CI/CD",
};

function CountUp({ value, duration = 1.1 }) {
  const reduced = useReducedMotion();
  const motionVal = useMotionValue(reduced ? value : 0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const controls = animateValue(motionVal, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [motionVal, rounded, value, duration, reduced]);

  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        display: "inline-block",
      }}
      aria-label={String(value)}
    >
      {display}
    </span>
  );
}

function CertRow({ cert, t, featured, divider, inProgress }) {
  // The icon rides on the last word, so a wrapped name never leaves it
  // stranded at the end of the first line.
  const name = t(`certifications.${cert.key}.name`);
  const cut = name.lastIndexOf(" ") + 1;
  return (
    <div
      className="cert-row flex items-center justify-between gap-3 py-2"
      style={{
        borderTop: divider ? "1px solid var(--border-subtle)" : "none",
      }}
    >
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontSize: featured ? "0.9rem" : "0.85rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.35,
          }}
        >
          {cert.link ? (
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="cert-link transition-opacity hover:opacity-70"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {name.slice(0, cut)}
              <span style={{ whiteSpace: "nowrap" }}>
                {name.slice(cut)}
                <FaExternalLinkAlt
                  aria-hidden="true"
                  style={{
                    display: "inline",
                    fontSize: "0.55rem",
                    opacity: 0.5,
                    marginLeft: "0.45em",
                    verticalAlign: "0.1em",
                  }}
                />
              </span>
              <span className="sr-only">
                {t("certifications.opensInNewTab", "(opens in new tab)")}
              </span>
            </a>
          ) : (
            name
          )}
        </div>
      </div>
      {inProgress ? (
        <div
          className="flex-shrink-0 inline-flex items-center gap-1.5"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent-ink)",
            background: "var(--accent-dim)",
            padding: "3px 10px",
            borderRadius: "6px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
            aria-hidden="true"
          />
          {t("certifications.inProgress", "In progress")}
        </div>
      ) : (
        <div
          className="flex-shrink-0"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            background: "var(--bg-elevated)",
            padding: "3px 10px",
            borderRadius: "6px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {t(`certifications.${cert.key}.date`)}
        </div>
      )}
    </div>
  );
}

function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications">
      <div className="section-inner">
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <SectionHeading
            title={t("certifications.heading")}
            muted={t("certifications.headingMuted")}
          />

          <m.div variants={itemVariants} className="mb-10">
            <span
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--accent-ink)",
                background: "var(--accent-dim)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              <CountUp value={CERT_COUNT} />
              <span>
                {" "}
                {t("certifications.chipLabel", "certifications earned")}
              </span>
            </span>
          </m.div>
        </m.div>

        <m.div
          className="hairline-grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          style={{
            gridAutoFlow: "dense",
            gridAutoRows: "minmax(150px, auto)",
          }}
        >
          {CERT_GROUPS.map((group, groupIndex) => {
            const brandColor = group.color || "var(--accent)";
            const isFeatured = group.size === "featured";
            const isWide = group.size === "wide";
            const tagline = t(
              `certifications.groups.${group.groupId}.tagline`,
              TAGLINE_DEFAULTS[group.groupId]
            );

            return (
              <m.div
                key={group.vendorShort}
                custom={groupIndex}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`cert-group-card relative p-5 md:p-6 cursor-default flex flex-col ${group.spanClasses}`}
                style={{ "--brand-color": brandColor }}
              >
                {group.liveTile && (
                  <LiveTileFrame
                    brandColor={brandColor}
                    liveTile={group.liveTile}
                    progress={group.progress}
                    rawColor={group.color}
                  />
                )}

                <h3
                  className="flex items-center gap-2.5 mt-0 mb-1.5"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: isFeatured ? "1.05rem" : "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  <span
                    className="w-2 h-2 flex-shrink-0"
                    style={{ background: brandColor, borderRadius: "2px" }}
                    aria-hidden="true"
                  />
                  {group.vendor}
                </h3>

                <div
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {tagline}
                </div>

                <div
                  className={
                    isWide
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 flex-1"
                      : "flex flex-col flex-1"
                  }
                >
                  {group.certs.map((cert, certIndex) => {
                    const divider = isWide
                      ? certIndex >= 2
                      : certIndex > 0;
                    return (
                      <CertRow
                        key={cert.key}
                        cert={cert}
                        t={t}
                        featured={isFeatured}
                        divider={divider}
                      />
                    );
                  })}
                  {group.inProgressCerts?.map((cert) => (
                    <CertRow
                      key={cert.key}
                      cert={cert}
                      t={t}
                      featured={isFeatured}
                      divider
                      inProgress
                    />
                  ))}
                </div>

                {isFeatured && group.progress && (
                  <div
                    className="mt-auto pt-4"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <div
                      className="flex items-center justify-between"
                      role="progressbar"
                      aria-valuenow={group.progress.current}
                      aria-valuemin={0}
                      aria-valuemax={group.progress.total}
                      aria-label={t(
                        `certifications.groups.${group.groupId}.progressLabel`,
                        "Kubestronaut path"
                      )}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8125rem",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {t(
                          `certifications.groups.${group.groupId}.progressLabel`,
                          "Kubestronaut path"
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {group.progress.current} / {group.progress.total}
                        {group.progress.inProgress
                          ? ` · ${t("certifications.countInProgress", {
                              count: group.progress.inProgress,
                              defaultValue: "{{count}} in progress",
                            })}`
                          : ""}
                      </span>
                    </div>
                  </div>
                )}
              </m.div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}

export default Certifications;
