import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaSearch, FaArrowLeft } from "react-icons/fa";
import blogApi from "../../services/blogApi";

export default function BlogSearchResults() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search for blog posts
  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const searchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogApi.searchPosts(query);
        setResults(data.results);
      } catch (err) {
        console.error("Error searching posts:", err);
        setError(t("blog.error.search"));
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [query, t]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <section id="blog-search" className="py-20">
      <div className="section-inner">
        {/* Back button */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm"
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
            <FaArrowLeft className="mr-2" />
            {t("blog.backToBlog")}
          </Link>
        </div>

        {/* Search heading */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            {t("blog.searchResults")}
          </h1>
          <div
            className="flex items-center"
            style={{ color: "var(--text-secondary)" }}
          >
            <FaSearch className="mr-2" />
            <span>
              {t("blog.searchingFor")}:{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--accent)" }}
              >
                "{query}"
              </span>
            </span>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div
              className="animate-spin rounded-full h-12 w-12"
              style={{
                borderTop: "2px solid var(--accent)",
                borderBottom: "2px solid var(--accent)",
                borderLeft: "2px solid transparent",
                borderRight: "2px solid transparent",
              }}
            />
          </div>
        ) : error ? (
          <div
            className="p-4 rounded-lg"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        ) : results.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-xl font-semibold mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {t("blog.noSearchResults")}
            </h3>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              {t("blog.tryDifferentSearch")}
            </p>
            <Link to="/blog" className="btn btn-outline">
              {t("blog.viewAllPosts")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <p
              className="mb-4"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            >
              {t("blog.foundResults", { count: results.length })}
            </p>

            {results.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-xl"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  transition:
                    "border-color 0.3s, box-shadow 0.3s, transform 0.3s var(--ease-out-expo)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-medium)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    style={{
                      color: "var(--text-primary)",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    {post.title}
                  </Link>
                </h2>

                <div
                  className="flex items-center mb-3 text-sm"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                  }}
                >
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(post.published_at)}
                </div>

                <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                  {post.excerpt}
                </p>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-block text-sm"
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
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
