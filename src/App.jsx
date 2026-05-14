import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import HandbookCallout from "./components/HandbookCallout";
import SectionDivider from "./components/SectionDivider";
import PrintButton from "./components/PrintButton";
import BackgroundAnimation from "./components/BackgroundAnimation";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";
import SideElements from "./components/SideElements";
import TerminalPromo from "./components/Terminal/TerminalPromo";
import useSystemTheme from "./hooks/useSystemTheme";
import useScrollReveal from "./hooks/useScrollReveal";
import "./styles/global.css";

const Terminal = lazy(() => import("./components/Terminal/Terminal"));

function RouteFallback() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      style={{ color: "var(--text-tertiary)" }}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
        loading…
      </div>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();
  const systemTheme = useSystemTheme();
  useScrollReveal();
  // Initial theme: explicit user choice from localStorage, otherwise
  // whatever the OS reports. The bootstrap script in index.html applies
  // the same logic to the <html> element before React mounts, so we
  // never paint the wrong theme on first frame.
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("theme") || systemTheme;
    } catch {
      return systemTheme;
    }
  });
  const [language, setLanguage] = useState(() => {
    return (
      localStorage.getItem("language") ||
      navigator.language.split("-")[0] ||
      "en"
    );
  });
  const contentRef = useRef(null);

  // Apply theme to the DOM whenever it changes.
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme]);

  // Follow the OS preference whenever the user has NOT made an explicit
  // choice. Once they toggle, their choice sticks via localStorage.
  useEffect(() => {
    try {
      if (localStorage.getItem("theme")) return;
    } catch {
      return;
    }
    setThemeState(systemTheme);
  }, [systemTheme]);

  // Wrap setTheme so explicit user toggles persist to localStorage.
  // System-driven theme changes go through setThemeState directly and
  // are NOT persisted, so the user keeps following the OS until they
  // actively choose a theme.
  const setTheme = (next) => {
    setThemeState(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore — private browsing, etc.
    }
  };

  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const MainLayout = ({ children }) => (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}
    >
      <BackgroundAnimation theme={theme} />
      <CursorGlow />
      <ScrollProgress />
      <NavigationBar
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
      />
      <SideElements />
      <div ref={contentRef} className="relative z-[2]">{children}</div>
      <Footer />
      <PrintButton />
    </div>
  );

  const Home = () => (
    <>
      <Hero />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Certifications />
      <SectionDivider />
      <HandbookCallout />
      <SectionDivider />
      <TerminalPromo />
      <SectionDivider />
      <Contact />
    </>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/terminal"
          element={
            <MainLayout>
              <Suspense fallback={<RouteFallback />}>
                <Terminal />
              </Suspense>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
