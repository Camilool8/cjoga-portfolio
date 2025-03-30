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
        const sortedTags = data.tags.sort((a, b) => b.count - a.count);

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

  return (
    <aside className="space-y-8">
      {/* Search widget */}
      <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
          {t("blog.search")}
        </h3>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("blog.searchPlaceholder")}
            className="w-full px-3 py-2 bg-light-primary dark:bg-dark-primary rounded-l-md focus:outline-none focus:ring-1 focus:ring-light-accent dark:focus:ring-dark-accent text-light-text-primary dark:text-dark-text-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-dark-primary rounded-r-md hover:opacity-90 transition-opacity"
            aria-label={t("blog.search")}
          >
            <FaSearch />
          </button>
        </form>
      </div>

      {/* Tags widget */}
      <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
          {t("blog.tags")}
        </h3>

        {tagsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
          </div>
        ) : tags.length === 0 ? (
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            {t("blog.noTags")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                to={`/blog?tag=${tag.name}`}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  activeTag === tag.name
                    ? "bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent"
                    : "bg-light-primary dark:bg-dark-primary text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10"
                } transition-colors`}
              >
                <FaTag className="mr-1 text-xs" />
                {tag.name}
                <span className="ml-1 text-xs">({tag.count})</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* About widget */}
      <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
          {t("blog.about")}
        </h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
          {t("blog.aboutContent")}
        </p>
        <Link
          to="/"
          className="font-mono text-sm text-light-accent dark:text-dark-accent hover:underline"
        >
          {t("blog.readMore")} →
        </Link>
      </div>
    </aside>
  );
}

export default BlogSidebar;
