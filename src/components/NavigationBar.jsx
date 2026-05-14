import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { FiSun, FiMoon, FiExternalLink } from "react-icons/fi";
import { socialLinks } from "../data";

function NavigationBar({ theme, setTheme, language, setLanguage }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const langRef = useRef(null);

  const isHomePage = location.pathname === "/";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setMenuOpen(false);
    setLanguageMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [languageMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLanguageChange = (lang, e) => {
    e.stopPropagation();
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  const navItems = [
    { section: "about", label: t("header.about") },
    { section: "experience", label: t("header.experience") },
    { section: "projects", label: t("header.projects") },
    { section: "certifications", label: t("header.certifications") },
    { section: "contact", label: t("header.contact") },
  ];

  const NavLink = ({ section, label, onClick, className = "", style, children }) => {
    const content = children || label;
    if (isHomePage) {
      return (
        <a href={`#${section}`} onClick={onClick} className={className || "nav-pill-link"} style={style}>
          {content}
        </a>
      );
    }
    return (
      <Link to={`/#${section}`} onClick={onClick} className={className || "nav-pill-link"} style={style}>
        {content}
      </Link>
    );
  };

  const isTerminalActive = location.pathname.startsWith("/terminal");

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-0.5 py-1.5 px-2 glass rounded-2xl transition-all duration-500 max-w-[calc(100vw-32px)] ${
          isScrolled ? "shadow-lg" : ""
        }`}
        style={{
          borderColor: isScrolled ? "var(--border-medium)" : "var(--border-subtle)",
        }}
      >
        <Link
          to="/"
          className="font-mono font-bold text-sm px-3 py-2 no-underline"
          style={{ color: "var(--accent)" }}
        >
          CJ
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map(({ section, label }) => (
            <NavLink key={section} section={section} label={label} />
          ))}
          <a
            href="https://blog.cjoga.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-pill-link nav-pill-external"
          >
            <span>{t("header.handbook")}</span>
            <FiExternalLink size={11} aria-hidden="true" />
          </a>
          <Link
            to="/terminal"
            className={`nav-pill-link ${isTerminalActive ? "nav-pill-active" : ""}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t("header.terminal")}
          </Link>
        </div>

        <div className="flex items-center gap-1 ml-1 pl-2" style={{ borderLeft: "1px solid var(--border-subtle)" }}>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
            className="nav-control-btn"
          >
            {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <div className="relative" ref={langRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLanguageMenuOpen(!languageMenuOpen);
              }}
              aria-label="Language selector"
              className="nav-control-btn"
            >
              <span className="font-mono text-xs font-medium uppercase">{language}</span>
            </button>

            {languageMenuOpen && (
              <div
                className="absolute right-0 mt-2 glass rounded-xl overflow-hidden shadow-lg"
                style={{ minWidth: "120px" }}
              >
                {["en", "es"].map((lang) => (
                  <button
                    key={lang}
                    onClick={(e) => handleLanguageChange(lang, e)}
                    className="lang-option"
                    style={{
                      color: language === lang ? "var(--accent)" : "var(--text-primary)",
                    }}
                  >
                    {t(`language.${lang}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`lg:hidden nav-control-btn mobile-hamburger ${menuOpen ? "is-active" : ""}`}
          >
            <span className="hamburger-box">
              <span className="hamburger-line hamburger-line--top" />
              <span className="hamburger-line hamburger-line--mid" />
              <span className="hamburger-line hamburger-line--bot" />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`mobile-nav-backdrop ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <aside
        className={`mobile-nav-panel ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-header">
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--text-tertiary)" }}>
            {t("header.navigation", "Navigation")}
          </span>
          <div className="mobile-nav-header-line" />
        </div>

        <nav className="mobile-nav-links">
          {navItems.map(({ section, label }, i) => (
            <NavLink
              key={section}
              section={section}
              label={label}
              className="mobile-nav-item"
              style={{ "--i": i }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-nav-num">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span className="mobile-nav-label">{label}</span>
            </NavLink>
          ))}
          <a
            href="https://blog.cjoga.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-item"
            onClick={() => setMenuOpen(false)}
            style={{ "--i": navItems.length }}
          >
            <span className="mobile-nav-num">
              {String(navItems.length + 1).padStart(2, "0")}.
            </span>
            <span className="mobile-nav-label" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {t("header.handbook")}
              <FiExternalLink size={12} aria-hidden="true" />
            </span>
          </a>
          <Link
            to="/terminal"
            className={`mobile-nav-item ${isTerminalActive ? "is-active" : ""}`}
            onClick={() => {
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{ "--i": navItems.length + 1 }}
          >
            <span className="mobile-nav-num">
              {String(navItems.length + 2).padStart(2, "0")}.
            </span>
            <span className="mobile-nav-label">{t("header.terminal")}</span>
          </Link>
        </nav>

        <div className="mobile-nav-divider" />

        <div className="mobile-nav-controls">
          <button onClick={toggleTheme} className="mobile-nav-control-btn">
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
            <span>{theme === "dark" ? t("theme.light", "Light") : t("theme.dark", "Dark")}</span>
          </button>
          <button
            onClick={(e) => handleLanguageChange(language === "en" ? "es" : "en", e)}
            className="mobile-nav-control-btn"
          >
            <span className="font-mono text-sm font-semibold uppercase">{language === "en" ? "ES" : "EN"}</span>
            <span>{language === "en" ? "Espa\u00f1ol" : "English"}</span>
          </button>
        </div>

        <div className="mobile-nav-footer">
          <a
            href={`mailto:${socialLinks.email}`}
            className="font-mono text-[0.65rem] tracking-wider no-underline"
            style={{ color: "var(--text-tertiary)", transition: "color 0.25s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            {socialLinks.email}
          </a>
        </div>
      </aside>

      <style>{`
        .nav-pill-link {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.25s var(--ease-out-expo);
          white-space: nowrap;
        }
        .nav-pill-link:hover,
        .nav-pill-link.nav-pill-active {
          color: var(--accent);
          background: var(--accent-dim);
        }

        .nav-control-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s var(--ease-out-expo);
          background: transparent;
          color: var(--text-secondary);
        }
        .nav-control-btn:hover {
          color: var(--accent);
          background: var(--accent-dim);
        }

        @media (min-width: 1024px) {
          .mobile-hamburger {
            display: none !important;
          }
        }
        .mobile-hamburger {
          position: relative;
        }
        .hamburger-box {
          width: 18px;
          height: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .hamburger-line {
          display: block;
          width: 100%;
          height: 1.5px;
          background: currentColor;
          border-radius: 2px;
          transition: all 0.35s var(--ease-out-expo);
          transform-origin: center;
        }
        .mobile-hamburger.is-active .hamburger-line--top {
          transform: translateY(6.25px) rotate(45deg);
        }
        .mobile-hamburger.is-active .hamburger-line--mid {
          opacity: 0;
          transform: scaleX(0);
        }
        .mobile-hamburger.is-active .hamburger-line--bot {
          transform: translateY(-6.25px) rotate(-45deg);
        }

        .mobile-nav-backdrop {
          position: fixed;
          inset: 0;
          z-index: 998;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s var(--ease-out-expo);
        }
        .mobile-nav-backdrop.is-open {
          opacity: 1;
          pointer-events: auto;
        }
        @media (min-width: 1024px) {
          .mobile-nav-backdrop,
          .mobile-nav-panel {
            display: none !important;
          }
        }

        .mobile-nav-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          width: min(320px, 85vw);
          background: var(--bg-primary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 80px 28px 28px;
          transform: translateX(100%);
          transition: transform 0.45s var(--ease-out-expo);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .mobile-nav-panel.is-open {
          transform: translateX(0);
        }
        .mobile-nav-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(
            180deg,
            var(--accent-glow) 0%,
            transparent 100%
          );
          pointer-events: none;
        }

        .mobile-nav-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          position: relative;
        }
        .mobile-nav-header-line {
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s var(--ease-out-expo);
          color: var(--text-secondary);
          opacity: 0;
          transform: translateX(20px);
        }
        .mobile-nav-panel.is-open .mobile-nav-item {
          opacity: 1;
          transform: translateX(0);
          transition-delay: calc(var(--i, 0) * 0.05s + 0.15s);
        }
        .mobile-nav-item:hover,
        .mobile-nav-item:active,
        .mobile-nav-item.is-active {
          background: var(--accent-dim);
          color: var(--accent);
        }
        .mobile-nav-num {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--accent);
          min-width: 24px;
          opacity: 0.6;
        }
        .mobile-nav-item:hover .mobile-nav-num,
        .mobile-nav-item.is-active .mobile-nav-num {
          opacity: 1;
        }
        .mobile-nav-label {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .mobile-nav-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 20px 0;
        }

        .mobile-nav-controls {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-nav-control-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s var(--ease-out-expo);
          width: 100%;
          text-align: left;
        }
        .mobile-nav-control-btn:hover,
        .mobile-nav-control-btn:active {
          background: var(--accent-dim);
          color: var(--accent);
        }

        .mobile-nav-footer {
          margin-top: auto;
          padding-top: 20px;
        }

        .lang-option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 16px;
          font-size: 0.875rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .lang-option:hover {
          background: var(--accent-dim);
        }
      `}</style>
    </>
  );
}

export default NavigationBar;
