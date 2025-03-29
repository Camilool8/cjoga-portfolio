// src/components/Header.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { IoLanguage } from "react-icons/io5";

function Header({ theme, setTheme, language, setLanguage }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Handle scroll event to add shadow to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Set language and close language menu
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  // Create a navigation item - either Link or anchor depending on if it's on home page
  const NavItem = ({ section, number, text }) => {
    if (isHomePage) {
      return (
        <a
          href={`#${section}`}
          className={`relative ${
            theme === "dark"
              ? "text-dark-text-primary hover:text-dark-accent"
              : "text-light-text-primary hover:text-light-accent"
          } transition-colors`}
        >
          <span
            className={`font-mono text-sm ${
              theme === "dark" ? "text-dark-accent" : "text-light-accent"
            }`}
          >
            {number}.{" "}
          </span>
          {text}
        </a>
      );
    } else {
      return (
        <Link
          to={`/#${section}`}
          className={`relative ${
            theme === "dark"
              ? "text-dark-text-primary hover:text-dark-accent"
              : "text-light-text-primary hover:text-light-accent"
          } transition-colors`}
        >
          <span
            className={`font-mono text-sm ${
              theme === "dark" ? "text-dark-accent" : "text-light-accent"
            }`}
          >
            {number}.{" "}
          </span>
          {text}
        </Link>
      );
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? theme === "dark"
            ? "bg-dark-secondary/95 shadow-custom-dark backdrop-blur-md"
            : "bg-light-secondary/95 shadow-custom-light backdrop-blur-md"
          : theme === "dark"
          ? "bg-dark-primary"
          : "bg-light-primary"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-dark-accent" : "text-light-accent"
            }`}
          >
            CJ
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <ul className="flex space-x-8">
              <li>
                <NavItem section="about" number="01" text={t("header.about")} />
              </li>
              <li>
                <NavItem
                  section="experience"
                  number="02"
                  text={t("header.experience")}
                />
              </li>
              <li>
                <NavItem
                  section="projects"
                  number="03"
                  text={t("header.projects")}
                />
              </li>
              <li>
                <NavItem
                  section="certifications"
                  number="04"
                  text={t("header.certifications")}
                />
              </li>
              <li>
                <NavItem
                  section="contact"
                  number="05"
                  text={t("header.contact")}
                />
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className={`relative ${
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-dark-accent"
                      : "text-light-text-primary hover:text-light-accent"
                  } transition-colors`}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    06.{" "}
                  </span>
                  {t("header.blog")}
                </Link>
              </li>
            </ul>

            {/* Theme Toggle and Language Selector */}
            <div className="ml-8 flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? t("theme.light") : t("theme.dark")
                }
                className={`p-2 rounded-full ${
                  theme === "dark"
                    ? "hover:bg-dark-secondary"
                    : "hover:bg-light-secondary"
                } transition-colors`}
              >
                {theme === "dark" ? (
                  <FiSun className="text-dark-accent text-xl" />
                ) : (
                  <FiMoon className="text-light-accent text-xl" />
                )}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className={`p-2 rounded-full ${
                    theme === "dark"
                      ? "hover:bg-dark-secondary"
                      : "hover:bg-light-secondary"
                  } transition-colors flex items-center`}
                  aria-label="Language selector"
                >
                  <IoLanguage
                    className={`text-xl ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  />
                  <span className="ml-1 uppercase text-sm">{language}</span>
                </button>

                {languageMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-36 rounded-md shadow-lg ring-1 ring-opacity-5 ${
                      theme === "dark"
                        ? "bg-dark-secondary ring-dark-accent"
                        : "bg-light-secondary ring-light-accent"
                    } transition-all duration-100 ease-in-out`}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleLanguageChange("en")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          theme === "dark"
                            ? "text-dark-text-primary hover:bg-dark-primary"
                            : "text-light-text-primary hover:bg-light-primary"
                        } ${
                          language === "en"
                            ? theme === "dark"
                              ? "text-dark-accent"
                              : "text-light-accent"
                            : ""
                        }`}
                      >
                        {t("language.en")}
                      </button>
                      <button
                        onClick={() => handleLanguageChange("es")}
                        className={`block px-4 py-2 text-sm w-full text-left ${
                          theme === "dark"
                            ? "text-dark-text-primary hover:bg-dark-primary"
                            : "text-light-text-primary hover:bg-light-primary"
                        } ${
                          language === "es"
                            ? theme === "dark"
                              ? "text-dark-accent"
                              : "text-light-accent"
                            : ""
                        }`}
                      >
                        {t("language.es")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "hover:bg-dark-secondary"
                  : "hover:bg-light-secondary"
              } transition-colors`}
            >
              {theme === "dark" ? (
                <FiSun className="text-dark-accent text-xl" />
              ) : (
                <FiMoon className="text-light-accent text-xl" />
              )}
            </button>

            {/* Language Selector (Mobile) */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`p-2 rounded-full ${
                  theme === "dark"
                    ? "hover:bg-dark-secondary"
                    : "hover:bg-light-secondary"
                } transition-colors flex items-center`}
                aria-label="Language selector"
              >
                <IoLanguage
                  className={`text-xl ${
                    theme === "dark" ? "text-dark-accent" : "text-light-accent"
                  }`}
                />
                <span className="ml-1 uppercase text-sm">{language}</span>
              </button>

              {languageMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-36 rounded-md shadow-lg ring-1 ring-opacity-5 ${
                    theme === "dark"
                      ? "bg-dark-secondary ring-dark-accent"
                      : "bg-light-secondary ring-light-accent"
                  } transition-all duration-100 ease-in-out`}
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        theme === "dark"
                          ? "text-dark-text-primary hover:bg-dark-primary"
                          : "text-light-text-primary hover:bg-light-primary"
                      } ${
                        language === "en"
                          ? theme === "dark"
                            ? "text-dark-accent"
                            : "text-light-accent"
                          : ""
                      }`}
                    >
                      {t("language.en")}
                    </button>
                    <button
                      onClick={() => handleLanguageChange("es")}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        theme === "dark"
                          ? "text-dark-text-primary hover:bg-dark-primary"
                          : "text-light-text-primary hover:bg-light-primary"
                      } ${
                        language === "es"
                          ? theme === "dark"
                            ? "text-dark-accent"
                            : "text-light-accent"
                          : ""
                      }`}
                    >
                      {t("language.es")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-md ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-light-text-primary"
              }`}
              aria-label="Toggle menu"
            >
              <div className="w-6 flex flex-col items-end">
                <span
                  className={`block h-0.5 ${
                    theme === "dark" ? "bg-dark-accent" : "bg-light-accent"
                  } transition-transform duration-300 ${
                    menuOpen ? "w-6 transform rotate-45 translate-y-1.5" : "w-6"
                  }`}
                ></span>
                <span
                  className={`block h-0.5 ${
                    theme === "dark" ? "bg-dark-accent" : "bg-light-accent"
                  } mt-1 transition-opacity duration-300 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  } w-4`}
                ></span>
                <span
                  className={`block h-0.5 ${
                    theme === "dark" ? "bg-dark-accent" : "bg-light-accent"
                  } mt-1 transition-transform duration-300 ${
                    menuOpen
                      ? "w-6 transform -rotate-45 -translate-y-1.5"
                      : "w-6"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 ${
          menuOpen ? "block" : "hidden"
        } md:hidden`}
        style={{ top: "70px" }}
      >
        <div
          className={`h-full w-full flex flex-col ${
            theme === "dark" ? "bg-dark-secondary" : "bg-light-secondary"
          } transition-all duration-300 shadow-lg`}
        >
          <nav className="p-6 flex flex-col space-y-6">
            {isHomePage ? (
              <>
                <a
                  href="#about"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    01.{" "}
                  </span>
                  {t("header.about")}
                </a>
                <a
                  href="#experience"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    02.{" "}
                  </span>
                  {t("header.experience")}
                </a>
                <a
                  href="#projects"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    03.{" "}
                  </span>
                  {t("header.projects")}
                </a>
                <a
                  href="#certifications"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    04.{" "}
                  </span>
                  {t("header.certifications")}
                </a>
                <a
                  href="#contact"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    05.{" "}
                  </span>
                  {t("header.contact")}
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/#about"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    01.{" "}
                  </span>
                  {t("header.about")}
                </Link>
                <Link
                  to="/#experience"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    02.{" "}
                  </span>
                  {t("header.experience")}
                </Link>
                <Link
                  to="/#projects"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    03.{" "}
                  </span>
                  {t("header.projects")}
                </Link>
                <Link
                  to="/#certifications"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    04.{" "}
                  </span>
                  {t("header.certifications")}
                </Link>
                <Link
                  to="/#contact"
                  className={`text-lg ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-light-text-primary"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className={`font-mono text-sm ${
                      theme === "dark"
                        ? "text-dark-accent"
                        : "text-light-accent"
                    }`}
                  >
                    05.{" "}
                  </span>
                  {t("header.contact")}
                </Link>
              </>
            )}
            <Link
              to="/blog"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`relative ${
                theme === "dark"
                  ? "text-dark-text-primary hover:text-dark-accent"
                  : "text-light-text-primary hover:text-light-accent"
              } transition-colors`}
            >
              <span
                className={`font-mono text-sm ${
                  theme === "dark" ? "text-dark-accent" : "text-light-accent"
                }`}
              >
                06.{" "}
              </span>
              {t("header.blog")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
