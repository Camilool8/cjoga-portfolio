import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch, FaTag } from "react-icons/fa";
import blogApi from "../../services/blogApi";

function BlogSidebar() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get active tag from URL
  const activeTag = searchParams.get("tag");

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const data = await blogApi.getTags();

        // Sort by count (descending)
        const sortedTags = (data?.tags || []).sort((a, b) => b.count - a.count);

        setTags(sortedTags);
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    window.location.href = `/blog/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // Glass widget base styles
  const widgetStyle = {
    background: "var(--bg-glass)",
    backdropFilter: "blur(20px) saturate(1.5)",
    WebkitBackdropFilter: "blur(20px) saturate(1.5)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "16px",
    padding: "1.5rem",
    transition: "border-color 0.4s, box-shadow 0.4s",
  };

  const widgetHeadingStyle = {
    fontFamily: "var(--font-display)",
    color: "var(--text-primary)",
    fontSize: "1.15rem",
    fontWeight: 600,
    marginBottom: "1rem",
  };

  return (
    <aside className="space-y-6">
      {/* Search widget */}
      <div style={widgetStyle} className="sidebar-widget">
        <h3 style={widgetHeadingStyle}>{t("blog.search")}</h3>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("blog.searchPlaceholder")}
            className="w-full px-3 py-2 rounded-l-lg focus:outline-none text-sm"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              borderRight: "none",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-r-lg"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            aria-label={t("blog.search")}
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Tags widget */}
      <div style={widgetStyle} className="sidebar-widget">
        <h3 style={widgetHeadingStyle}>{t("blog.tags")}</h3>

        {tagsLoading ? (
          <div className="flex justify-center py-4">
            <div
              className="animate-spin rounded-full h-6 w-6"
              style={{
                borderTop: "2px solid var(--accent)",
                borderBottom: "2px solid var(--accent)",
                borderLeft: "2px solid transparent",
                borderRight: "2px solid transparent",
              }}
            />
          </div>
        ) : tags.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {t("blog.noTags")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                to={`/blog?tag=${tag.name}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  background:
                    activeTag === tag.name
                      ? "var(--accent-dim)"
                      : "var(--bg-elevated)",
                  color:
                    activeTag === tag.name
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  border: `1px solid ${
                    activeTag === tag.name
                      ? "var(--border-active)"
                      : "var(--border-subtle)"
                  }`,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (activeTag !== tag.name) {
                    e.currentTarget.style.borderColor = "var(--border-medium)";
                    e.currentTarget.style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTag !== tag.name) {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <FaTag className="mr-1 text-xs" />
                {tag.name}
                <span className="ml-1 text-xs" style={{ opacity: 0.7 }}>
                  ({tag.count})
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* About widget */}
      <div style={widgetStyle} className="sidebar-widget">
        <h3 style={widgetHeadingStyle}>{t("blog.about")}</h3>
        <p
          className="mb-4 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("blog.aboutContent")}
        </p>
        <Link
          to="/"
          className="text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--accent)",
            transition: "opacity 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {t("blog.readMore")} →
        </Link>
      </div>
    </aside>
  );
}

export default BlogSidebar;
