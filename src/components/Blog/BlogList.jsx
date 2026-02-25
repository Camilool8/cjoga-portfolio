import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";

function BlogList({ posts }) {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleTagClick = (tag, event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("tag", tag);
    params.set("page", "1");
    window.location.href = `/blog?${params.toString()}`;
  };

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="blog-card rounded-xl overflow-hidden flex flex-col h-full group"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            transition:
              "transform 0.4s var(--ease-out-expo), border-color 0.4s, box-shadow 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.borderColor = "var(--border-medium)";
            e.currentTarget.style.boxShadow =
              "0 12px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            className="h-[2px] w-full opacity-0 group-hover:opacity-100"
            style={{
              background: "var(--gradient-accent)",
              transition: "opacity 0.4s var(--ease-out-expo)",
            }}
          />

          <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
            <img
              src={post.cover_image || "/images/blog-placeholder.jpg"}
              alt={post.title}
              className="w-full h-48 object-cover"
              style={{
                transition: "transform 0.5s var(--ease-out-expo)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </Link>

          <div className="p-6 flex flex-col flex-grow">
            <h3
              className="text-xl font-semibold mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="hover:opacity-80"
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
            </h3>

            <div
              className="flex flex-wrap items-center mb-3 text-sm"
              style={{
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
              }}
            >
              <span className="flex items-center mr-4 mb-1">
                <FaCalendarAlt className="mr-1" />
                {formatDate(post.published_at)}
              </span>

              <span className="flex items-center mb-1">
                <FaClock className="mr-1" />
                {t("blog.readingTime", { minutes: post.reading_time })}
              </span>
            </div>

            <p
              className="mb-4 flex-grow text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {post.excerpt}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap mt-2 gap-2">
                {post.tags.map((tag, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={(e) => handleTagClick(tag, e)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      border: "1px solid var(--border-subtle)",
                      fontFamily: "var(--font-mono)",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-active)";
                      e.currentTarget.style.background = "var(--accent-glow)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-subtle)";
                      e.currentTarget.style.background = "var(--accent-dim)";
                    }}
                  >
                    <FaTag className="mr-1 text-xs" />
                    {tag}
                  </a>
                ))}
              </div>
            )}

            <Link
              to={`/blog/${post.slug}`}
              className="inline-block mt-4 text-sm"
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
        </motion.article>
      ))}
    </motion.div>
  );
}

export default BlogList;
