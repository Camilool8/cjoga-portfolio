import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaEnvelope, FaLinkedinIn, FaGithub } from "react-icons/fa";
import {
  sectionVariants, itemVariants, cardVariants, viewportConfig,
} from "../hooks/useMotion";

function Contact() {
  const { t } = useTranslation();

  const contactLinks = [
    {
      href: "mailto:josejoga.opx@gmail.com",
      icon: <FaEnvelope />,
      label: "josejoga.opx@gmail.com",
    },
    {
      href: "https://www.linkedin.com/in/cjoga",
      icon: <FaLinkedinIn />,
      label: "linkedin.com/in/cjoga",
      external: true,
    },
    {
      href: "https://github.com/Camilool8",
      icon: <FaGithub />,
      label: "github.com/Camilool8",
      external: true,
    },
  ];

  return (
    <section id="contact" style={{ textAlign: "center" }}>
      <div className="section-inner max-w-3xl mx-auto">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">{t("contact.subtitle", "Contact")}</span>
            <h2
              className="section-heading"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
            >
              {t("contact.title")}
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="max-w-[500px] mx-auto mb-10"
            style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.7 }}
          >
            {t("contact.text")}
          </motion.p>
        </motion.div>

        <p className="print-only mb-4">{t("print.phone")}</p>

        <div className="flex justify-center gap-3 flex-wrap">
          {contactLinks.map((link, i) => (
            <motion.a
              key={link.href}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              href={link.href}
              aria-label={link.label}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="contact-link inline-flex items-center gap-2 py-3 px-6 rounded-xl transition-all duration-300 no-underline"
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                color: "var(--text-secondary)", border: "1px solid var(--border-subtle)",
              }}
            >
              <span aria-hidden="true">{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Contact;
