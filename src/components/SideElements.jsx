import { useTranslation } from "react-i18next";
import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

function SideElements() {
  const { t } = useTranslation();
  const newTab = t("certifications.opensInNewTab");
  const sideStyle = {
    position: "fixed",
    bottom: 0,
    gap: "20px",
    zIndex: 100,
    animation: "hReveal 0.6s calc(1s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
    opacity: 0,
  };

  const linkStyle = {
    color: "var(--text-tertiary)",
    transition: "all 0.25s",
    textDecoration: "none",
    fontSize: "1.1rem",
  };

  const lineStyle = {
    width: "1px",
    height: "80px",
    background: "var(--text-tertiary)",
  };

  return (
    // One landmark for both rails, so their links are not stray content
    // outside the page structure. Fixed children keep their positions.
    <aside aria-label={t("nav.elsewhere")}>
      <div
        className="hidden xl:flex flex-col items-center"
        style={{ ...sideStyle, left: "28px" }}
      >
        <a
          href="https://github.com/Camilool8"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub ${newTab}`}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/cjoga"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn ${newTab}`}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaLinkedinIn />
        </a>
        <a
          href="mailto:josejoga.opx@gmail.com"
          aria-label={t("nav.email")}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaEnvelope />
        </a>
        <div style={lineStyle} />
      </div>

      <div
        className="hidden xl:flex flex-col items-center"
        style={{ ...sideStyle, right: "28px" }}
      >
        <a
          href="mailto:josejoga.opx@gmail.com"
          style={{
            ...linkStyle,
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            writingMode: "vertical-rl",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          josejoga.opx@gmail.com
        </a>
        <div style={lineStyle} />
      </div>
    </aside>
  );
}

export default SideElements;
