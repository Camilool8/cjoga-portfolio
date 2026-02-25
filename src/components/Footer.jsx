import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-10 text-center print:hidden relative z-10"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="section-inner">
        <p
          className="text-xs leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
        >
          {t("footer.text1")}
          <br />
          {t("footer.text2")}
        </p>
        <p
          className="text-xs mt-2"
          style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}
        >
          {t("footer.copyright").replace("2025", currentYear)}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
