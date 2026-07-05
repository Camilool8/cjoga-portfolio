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

function CertRow({ cert, brandColor, accentBg, t, featured, divider, inProgress }) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2"
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
              className="inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <span>{t(`certifications.${cert.key}.name`)}</span>
              <span className="sr-only">
                {t("certifications.opensInNewTab", "(opens in new tab)")}
              </span>
              <FaExternalLinkAlt
                aria-hidden="true"
                style={{
                  fontSize: "0.55rem",
                  opacity: 0.5,
                  flexShrink: 0,
                }}
              />
            </a>
          ) : (
            t(`certifications.${cert.key}.name`)
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-tertiary)",
            marginTop: "2px",
          }}
        >
          {t(`certifications.${cert.key}.issuer`)}
        </div>
      </div>
      {inProgress ? (
        <div
          className="flex-shrink-0 inline-flex items-center gap-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            fontWeight: 500,
            color: brandColor,
            background: accentBg,
            padding: "3px 10px",
            borderRadius: "6px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: brandColor, boxShadow: `0 0 6px ${brandColor}` }}
            aria-hidden="true"
          />
          {t("certifications.inProgress", "In progress")}
        </div>
      ) : (
        <div
          className="flex-shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            fontWeight: 500,
            color: brandColor,
            background: accentBg,
            padding: "3px 10px",
            borderRadius: "6px",
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
          <m.div variants={itemVariants}>
            <h2 className="section-heading">
              {t("certifications.heading", "Credentials & certs.")}
            </h2>
          </m.div>

          <m.div variants={itemVariants} className="mb-10">
            <span
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                }}
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

        <div
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
          style={{
            gridAutoFlow: "dense",
            gridAutoRows: "minmax(150px, auto)",
          }}
        >
          {CERT_GROUPS.map((group, groupIndex) => {
            const brandColor = group.color || "var(--accent)";
            const accentBg = group.color
              ? `${group.color}14`
              : "var(--accent-dim)";
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
                className={`cert-group-card relative rounded-2xl p-5 md:p-6 cursor-default flex flex-col ${group.spanClasses}`}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `3px solid ${brandColor}`,
                  "--brand-color": brandColor,
                }}
                whileHover={{
                  boxShadow: `0 8px 30px ${
                    group.color ? group.color + "1f" : "rgba(100,255,218,0.08)"
                  }`,
                }}
              >
                {isFeatured && (
                  <m.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 0 ${
                        group.color || "rgba(100,255,218,1)"
                      }00`,
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{
                      opacity: [0, 1, 0],
                      boxShadow: [
                        `0 0 0 0 ${brandColor}00`,
                        `0 0 40px 2px ${brandColor}55`,
                        `0 0 0 0 ${brandColor}00`,
                      ],
                    }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 2.2, delay: 0.4 + groupIndex * 0.1, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                )}

                {group.liveTile && (
                  <LiveTileFrame
                    brandColor={brandColor}
                    liveTile={group.liveTile}
                    progress={group.progress}
                    rawColor={group.color}
                  />
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: isFeatured ? "1.05rem" : "0.95rem",
                        fontWeight: 700,
                        color: brandColor,
                        lineHeight: 1.2,
                      }}
                    >
                      {group.vendor}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--text-tertiary)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginTop: "2px",
                      }}
                    >
                      {t("certifications.countLabel", {
                        count: group.certs.length,
                        defaultValue_one: "{{count}} certification",
                        defaultValue_other: "{{count}} certifications",
                      })}
                      {group.inProgressCerts?.length
                        ? ` · ${t("certifications.countInProgress", {
                            count: group.inProgressCerts.length,
                            defaultValue: "{{count}} in progress",
                          })}`
                        : ""}
                    </div>
                  </div>
                </div>

                <div
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
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
                        brandColor={brandColor}
                        accentBg={accentBg}
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
                      brandColor={brandColor}
                      accentBg={accentBg}
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
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          color: "var(--text-tertiary)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {t(
                          `certifications.groups.${group.groupId}.progressLabel`,
                          "Kubestronaut path"
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: brandColor,
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
        </div>
      </div>
    </section>
  );
}

export default Certifications;
