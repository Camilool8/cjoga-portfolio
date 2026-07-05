import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import NavigationBar from "./components/NavigationBar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Certifications from "./components/certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import HandbookCallout from "./components/HandbookCallout";
import SectionDivider from "./components/SectionDivider";
import PrintButton from "./components/PrintButton";
import ScrollProgress from "./components/ScrollProgress";
import SideElements from "./components/SideElements";
import TerminalPromo from "./components/Terminal/TerminalPromo";
import useSystemTheme from "./hooks/useSystemTheme";
import useScrollReveal from "./hooks/useScrollReveal";
import useHashScroll from "./hooks/useHashScroll";
import { getLangFromPath } from "./utils/i18n";
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

// Keeps i18next and <html lang> in sync with the URL. The path prefix
// (`/es`) is the single source of truth for language — localStorage is
// only written by the nav toggle as a first-visit hint and never
// triggers a redirect, so crawlers see stable, language-addressable
// URLs.
function LanguageSync() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  useEffect(() => {
    if (i18n.resolvedLanguage !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  return null;
}

// Module-scope layout/page components: defining these inside App()
// gave them a new identity on every theme or language change and
// remounted the whole tree (replayed hero intro, wiped terminal
// history). Theme state flows in via props instead.
function MainLayout({ themePreference, cycleThemePreference, children }) {
  const { t } = useTranslation();
  useHashScroll();

  const handleSkip = (e) => {
    e.preventDefault();
    const main = document.getElementById("main");
    if (main) {
      main.focus();
      main.scrollIntoView({ block: "start" });
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}
    >
      <a href="#main" className="skip-link" onClick={handleSkip}>
        {t("nav.skipToContent", "Skip to content")}
      </a>
      <ScrollProgress />
      <NavigationBar
        themePreference={themePreference}
        cycleThemePreference={cycleThemePreference}
      />
      <SideElements />
      <main id="main" tabIndex={-1} className="relative z-[2] outline-none">
        {children}
      </main>
      <Footer />
      <PrintButton />
      <style>{`
        .skip-link {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 2000;
          padding: 10px 16px;
          border-radius: 10px;
          background: var(--bg-elevated, #1a2332);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-decoration: none;
          border: 1px solid var(--border-medium, currentColor);
          transform: translateY(-200%);
        }
        .skip-link:focus-visible,
        .skip-link:focus {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

function Home() {
  return (
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
}

function TerminalPage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Terminal />
    </Suspense>
  );
}

function App() {
  const systemTheme = useSystemTheme();
  useScrollReveal();
  // Three-state preference matching Docusaurus: "system" (default,
  // follows OS dynamically), "light", or "dark". The bootstrap script
  // in index.html applies the resolved theme to <html> before React
  // mounts so there's no flash on first frame.
  const [themePreference, setThemePreference] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
      return "system";
    }
  });

  // The actual theme to render with: explicit choice wins, otherwise
  // mirror the OS.
  const theme = themePreference === "system" ? systemTheme : themePreference;

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

  // Signal the build-time prerenderer that i18n has resolved and the
  // first real frame is painted. App only renders once translations
  // for the URL-derived language are ready (react-i18next suspense),
  // so a double rAF after mount is a safe "settled" marker.
  useEffect(() => {
    let raf2 = null;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        document.documentElement.dataset.prerenderReady = "true";
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, []);

  // Cycle preference (system → light → dark → system), matching
  // Docusaurus's `getNextColorMode` order. "system" clears localStorage
  // so the user re-enters OS-following mode.
  const cycleThemePreference = useCallback(() => {
    setThemePreference((prev) => {
      const next =
        prev === "system" ? "light" : prev === "light" ? "dark" : "system";
      try {
        if (next === "system") {
          localStorage.removeItem("theme");
        } else {
          localStorage.setItem("theme", next);
        }
      } catch {
        // ignore — private browsing, etc.
      }
      return next;
    });
  }, []);

  const layoutProps = { themePreference, cycleThemePreference };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Router>
          <LanguageSync />
          <Routes>
            {["/", "/es"].map((base) => (
              <Route
                key={base}
                path={base}
                element={
                  <MainLayout {...layoutProps}>
                    <Home />
                  </MainLayout>
                }
              />
            ))}
            {["/terminal", "/es/terminal"].map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  <MainLayout {...layoutProps}>
                    <TerminalPage />
                  </MainLayout>
                }
              />
            ))}
          </Routes>
        </Router>
      </MotionConfig>
    </LazyMotion>
  );
}

export default App;
