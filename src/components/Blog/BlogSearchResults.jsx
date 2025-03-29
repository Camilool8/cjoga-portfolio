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
            className="inline-flex items-center font-mono text-sm text-light-accent dark:text-dark-accent hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            {t("blog.backToBlog")}
          </Link>
        </div>

        {/* Search heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">
            {t("blog.searchResults")}
          </h1>
          <div className="text-light-text-secondary dark:text-dark-text-secondary flex items-center">
            <FaSearch className="mr-2" />
            <span>
              {t("blog.searchingFor")}:{" "}
              <span className="font-semibold">"{query}"</span>
            </span>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-light-secondary dark:bg-dark-secondary rounded-md">
            <h3 className="text-xl font-semibold mb-2">
              {t("blog.noSearchResults")}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {t("blog.tryDifferentSearch")}
            </p>
            <Link to="/blog" className="cta-button">
              {t("blog.viewAllPosts")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              {t("blog.foundResults", { count: results.length })}
            </p>

            {results.map((post) => (
              <article
                key={post.id}
                className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-md hover:shadow-custom-light dark:hover:shadow-custom-dark transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-light-accent dark:hover:text-dark-accent"
                  >
                    {post.title}
                  </Link>
                </h2>

                <div className="flex items-center mb-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(post.published_at)}
                </div>

                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  {post.excerpt}
                </p>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-block font-mono text-sm text-light-accent dark:text-dark-accent hover:underline"
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
