import { useTranslation } from "react-i18next";
import { FaLinkedinIn, FaGithub, FaEnvelope } from "react-icons/fa";

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-10 text-center print:hidden">
      <div className="section-inner">
        {/* Social links */}
        <div className="flex justify-center space-x-8 mb-6">
          <a
            href="https://www.linkedin.com/in/cjoga"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transform hover:-translate-y-1 transition-all duration-300"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn className="text-2xl" />
          </a>
          <a
            href="https://github.com/Camilool8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transform hover:-translate-y-1 transition-all duration-300"
            aria-label="GitHub"
          >
            <FaGithub className="text-2xl" />
          </a>
          <a
            href="mailto:josejoga.opx@gmail.com"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transform hover:-translate-y-1 transition-all duration-300"
            aria-label="Email"
          >
            <FaEnvelope className="text-2xl" />
          </a>
        </div>

        {/* Credit text */}
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-1">
          {t("footer.text1")}
        </p>
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
          {t("footer.text2")}
        </p>

        {/* Copyright */}
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-xs">
          {t("footer.copyright").replace("2025", currentYear)}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
