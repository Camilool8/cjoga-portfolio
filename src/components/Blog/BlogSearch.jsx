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
        className="w-full px-4 py-3 pr-12 bg-light-secondary dark:bg-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent text-light-text-primary dark:text-dark-text-primary"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2"
        aria-label={t("blog.search")}
      >
        <FaSearch className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors" />
      </button>
    </form>
  );
}
