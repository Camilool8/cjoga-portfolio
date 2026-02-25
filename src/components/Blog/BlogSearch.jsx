import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";

export default function BlogSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(() => {
    // Get initial query from URL if on search page
    if (location.pathname === "/blog/search") {
      const urlParams = new URLSearchParams(location.search);
      return urlParams.get("q") || "";
    }
    return "";
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/blog/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("blog.searchBlogPlaceholder")}
        className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none"
        style={{
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-body)",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px var(--accent-dim), 0 0 20px var(--accent-glow)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{
          color: "var(--text-tertiary)",
          transition: "color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-tertiary)";
        }}
        aria-label={t("blog.search")}
      >
        <FaSearch />
      </button>
    </form>
  );
}
