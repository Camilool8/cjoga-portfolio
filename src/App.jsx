import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PrintButton from "./components/PrintButton";
import BackgroundAnimation from "./components/BackgroundAnimation";
import useSystemTheme from "./hooks/useSystemTheme";
import "./styles/global.css";

function App() {
  const { i18n } = useTranslation();
  const systemTheme = useSystemTheme();
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or use system preference
    return localStorage.getItem("theme") || systemTheme;
  });
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or use browser preference
    return (
      localStorage.getItem("language") ||
      navigator.language.split("-")[0] ||
      "en"
    );
  });
  const contentRef = useRef(null);

  // Handle theme changes and save to localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Handle language changes and save to localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-dark-primary text-dark-text-primary"
          : "bg-light-primary text-light-text-primary"
      }`}
    >
      <BackgroundAnimation theme={theme} />

      <Header
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
      />

      <div ref={contentRef}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Certifications />
        <Contact />
        <Footer />
      </div>

      <PrintButton />
    </div>
  );
}

export default App;
