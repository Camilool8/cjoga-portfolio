// src/App.jsx - Updated with Admin Routes
import { useState, useEffect, useRef } from "react";
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
import BlogPage from "./components/Blog/BlogPage";
import BlogPost from "./components/Blog/BlogPost";
import BlogSearchResults from "./components/Blog/BlogSearchResults";
import LoginPage from "./components/Admin/LoginPage";
import Dashboard from "./components/Admin/Dashboard";
import PostEditor from "./components/Admin/PostEditor";
import ProtectedRoute from "./components/Admin/ProtectedRoute";
import BlogPreview from "./components/Blog/BlogPreview";
import SectionDivider from "./components/SectionDivider";
import PrintButton from "./components/PrintButton";
import BackgroundAnimation from "./components/BackgroundAnimation";
import CursorGlow from "./components/CursorGlow";
import ScrollProgress from "./components/ScrollProgress";
import SideElements from "./components/SideElements";
import useSystemTheme from "./hooks/useSystemTheme";
import useScrollReveal from "./hooks/useScrollReveal";
import "./styles/global.css";

function App() {
  const { i18n } = useTranslation();
  const systemTheme = useSystemTheme();
  useScrollReveal();
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
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme]);

  // Handle language changes and save to localStorage
  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Main Layout Component
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

  // Admin Layout Component (no footer or print button)
  const AdminLayout = ({ children }) => (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-dark-primary text-dark-text-primary"
          : "bg-light-primary text-light-text-primary"
      }`}
    >
      {children}
    </div>
  );

  // Home Component
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
      <BlogPreview />
      <SectionDivider />
      <Contact />
    </>
  );

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/blog"
          element={
            <MainLayout>
              <BlogPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog/search"
          element={
            <MainLayout>
              <BlogSearchResults />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <MainLayout>
              <BlogPost />
            </MainLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <AdminLayout>
              <LoginPage />
            </AdminLayout>
          }
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/posts/new"
            element={
              <AdminLayout>
                <PostEditor />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/posts/edit/:id"
            element={
              <AdminLayout>
                <PostEditor />
              </AdminLayout>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
