import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaRedhat, FaAward, FaAws, FaExternalLinkAlt } from "react-icons/fa";
import { SiDynatrace, SiGitlab, SiTerraform } from "react-icons/si";
import {
  sectionVariants, itemVariants, cardVariants, viewportConfig,
} from "../hooks/useMotion";

const certGroups = [
  {
    vendor: "Amazon Web Services",
    vendorShort: "AWS",
    icon: FaAws,
    color: "#ff9900",
    certs: [{ key: "awsSolutionsArchitect", link: "https://www.credly.com/badges/4a977479-db27-4850-8962-d038b062a7d2" }],
  },
  {
    vendor: "HashiCorp",
    vendorShort: "HashiCorp",
    icon: SiTerraform,
    color: "#7f4dff",
    certs: [{ key: "hcta", link: "https://www.credly.com/badges/9f285077-46e9-431d-88f3-e4107546d668" }],
  },
  {
    vendor: "Red Hat",
    vendorShort: "Red Hat",
    icon: FaRedhat,
    color: "#ee0000",
    certs: [
      { key: "rhcsa", link: "https://www.credly.com/badges/3d2d03bb-5108-41da-81ad-6e47c80e3eed" },
      { key: "rhce", link: "https://www.credly.com/badges/2ba3ac77-f45d-4cfa-a286-7d27d379f429" },
    ],
  },
  {
    vendor: "Dynatrace",
    vendorShort: "Dynatrace",
    icon: SiDynatrace,
    color: "#73be28",
    certs: [{ key: "dynatrace", link: "https://www.credly.com/badges/2239d2e7-c0f8-4ee0-8e04-2429d0c774bc" }],
  },
  {
    vendor: "GitLab",
    vendorShort: "GitLab",
    icon: SiGitlab,
    color: "#fc6d26",
    certs: [
      { key: "gitlabMigration", link: "https://www.credly.com/badges/5a3d21a3-c24a-496c-88d4-5eac982c9cd3" },
      { key: "gitlabServices", link: "https://www.credly.com/badges/4a4a52c6-56b1-4518-acef-24f772434e5e" },
      { key: "gitlabCicd", link: "https://www.credly.com/badges/518a6de5-bae5-432f-9d90-0800eba2d4b5" },
      { key: "gitlabImplementation", link: "https://www.credly.com/badges/585b9001-7570-4e30-99d5-5f043534cf2a" },
    ],
  },
  {
    vendor: "Technology Partners",
    vendorShort: "Partner",
    icon: FaAward,
    color: null,
    certs: [{ key: "partner", link: "https://www.credly.com/badges/209bae19-6dbe-4cc2-8350-28cf4102ec46" }],
  },
];

const totalCerts = certGroups.reduce((sum, g) => sum + g.certs.length, 0);

function Certifications() {
  const { t } = useTranslation();

  return (
    <section id="certifications">
      <div className="section-inner">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">{t("certifications.title", "Certifications")}</span>
            <h2 className="section-heading">
              {t("certifications.heading", "Credentials & certs.")}
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
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
                style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
              />
              {totalCerts} Active Certifications
            </span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certGroups.map((group, groupIndex) => {
            const Icon = group.icon;
            const brandColor = group.color || "var(--accent)";
            const isWide = group.certs.length >= 4;

            return (
              <motion.div
                key={group.vendorShort}
                custom={groupIndex}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`cert-group-card rounded-2xl p-5 md:p-6 cursor-default ${isWide ? "sm:col-span-2" : ""}`}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderLeft: `3px solid ${brandColor}`,
                  "--brand-color": brandColor,
                }}
                whileHover={{
                  boxShadow: `0 8px 30px ${group.color ? group.color + "18" : "rgba(100,255,218,0.08)"}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: groupIndex * 0.05 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: group.color
                        ? `${group.color}15`
                        : "var(--accent-dim)",
                      color: brandColor,
                    }}
                  >
                    <Icon />
                  </motion.div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: brandColor,
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
                      }}
                    >
                      {group.certs.length} {group.certs.length === 1 ? "certification" : "certifications"}
                    </div>
                  </div>
                </div>

                <div className={`${isWide ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6" : ""}`}>
                  {group.certs.map((cert, certIndex) => (
                    <div
                      key={cert.key}
                      className="flex items-center justify-between py-2.5"
                      style={{
                        borderTop: certIndex > 0 || isWide ? `1px solid var(--border-subtle)` : "none",
                        ...(isWide && certIndex < 2 ? { borderTop: certIndex === 0 ? "none" : `1px solid var(--border-subtle)` } : {}),
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            lineHeight: 1.4,
                          }}
                        >
                          {cert.link ? (
                            <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 transition-colors hover:opacity-80"
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {t(`certifications.${cert.key}.name`)}
                              <FaExternalLinkAlt style={{ fontSize: "0.55rem", opacity: 0.5, flexShrink: 0 }} />
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
                      <div
                        className="flex-shrink-0 ml-4"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          color: brandColor,
                          background: group.color
                            ? `${group.color}12`
                            : "var(--accent-dim)",
                          padding: "3px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        {t(`certifications.${cert.key}.date`)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Certifications;
