import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { FaEnvelope, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { socialLinks } from "../data";
import useCvDownload from "../hooks/useCvDownload";
import SectionHeading from "./SectionHeading";
import { sectionVariants, itemVariants, viewportConfig } from "../hooks/useMotion";

// The close of the page: who this is for, the terms, and the two
// actions a hiring manager takes — the CV and an email.
function Contact() {
  const { t } = useTranslation();
  const { download, isGenerating, hasError } = useCvDownload();

  const profiles = [
    { href: socialLinks.linkedin, Icon: FaLinkedinIn, label: "LinkedIn · in/cjoga" },
    { href: "https://github.com/Camilool8", Icon: FaGithub, label: "GitHub · Camilool8" },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="section-inner contact-grid">
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <SectionHeading id="contact-title" title={t("contact.title")} />
          <m.p variants={itemVariants} className="section-lede">
            {t("contact.text")}
          </m.p>
          <m.dl variants={itemVariants} className="contact-terms">
            <div>
              <dt className="fig-caption">{t("contact.terms.workLabel")}</dt>
              <dd>{t("contact.terms.work")}</dd>
            </div>
          </m.dl>
        </m.div>

        <m.div
          className="contact-actions"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
        >
          <button
            type="button"
            className="btn btn-primary contact-btn"
            onClick={download}
            disabled={isGenerating}
          >
            <MdFileDownload aria-hidden="true" />
            {isGenerating ? t("print.generating") : t("print.button")}
          </button>
          <a href={`mailto:${socialLinks.email}`} className="btn btn-outline contact-btn">
            <FaEnvelope aria-hidden="true" />
            <span className="contact-mail">{socialLinks.email}</span>
          </a>
          {hasError && (
            <p role="alert" className="contact-error">
              {t("print.error")}
            </p>
          )}
          <p className="print-only">{t("print.phone")}</p>
          <ul className="contact-profiles">
            {profiles.map(({ href, Icon, label }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Icon aria-hidden="true" />
                  {label}
                  <span className="sr-only">{t("certifications.opensInNewTab")}</span>
                </a>
              </li>
            ))}
          </ul>
        </m.div>
      </div>
    </section>
  );
}

export default Contact;
