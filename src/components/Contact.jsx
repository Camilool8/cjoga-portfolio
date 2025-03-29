import { useTranslation } from "react-i18next";

function Contact() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-20">
      <div className="section-inner max-w-3xl mx-auto text-center">
        <p className="font-mono text-light-accent dark:text-dark-accent text-base mb-4">
          {t("contact.subtitle")}
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">
          {t("contact.title")}
        </h2>

        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-12 max-w-xl mx-auto">
          {t("contact.text")}
        </p>

        {/* Phone number that only appears in print version */}
        <p className="print-only mb-4">{t("print.phone")}</p>

        <a
          href="mailto:josejoga.opx@gmail.com"
          className="cta-button inline-block"
        >
          {t("contact.cta")}
        </a>
      </div>
    </section>
  );
}

export default Contact;
