import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock, FaTag, FaArrowRight } from "react-icons/fa";
import blogApi from "../../services/blogApi";
import {
  sectionVariants, itemVariants, cardVariants, viewportConfig,
} from "../../hooks/useMotion";

export default function BlogPreview() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getPosts(1, 3);
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error fetching latest posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (!loading && posts.length === 0) return null;

  return (
    <section id="blog-preview" className="py-16 md:py-24 relative z-10">
      <div className="section-inner">
        {/* Section label + heading */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-10"
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">
              {t("blog.previewTitle", "Blog")}
            </span>
            <h2 className="section-heading">
              {t("blog.previewHeading", "Latest from the blog.")}
            </h2>
          </motion.div>
        </motion.div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div
              className="animate-spin rounded-full h-10 w-10"
              style={{
                borderTop: "2px solid var(--accent)",
                borderBottom: "2px solid var(--accent)",
                borderLeft: "2px solid transparent",
                borderRight: "2px solid transparent",
              }}
            />
          </div>
        ) : (
          <>
            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="blog-card rounded-xl overflow-hidden flex flex-col group"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Accent gradient top line */}
                  <div
                    className="blog-gradient h-[2px] w-full opacity-0 group-hover:opacity-100"
                    style={{
                      background: "var(--gradient-accent)",
                      transition: "opacity 0.4s var(--ease-out-expo)",
                    }}
                  />

                  {/* Cover Image */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block overflow-hidden"
                  >
                    <img
                      src={post.cover_image || "/images/blog-placeholder.jpg"}
                      alt={post.title}
                      className="blog-cover-img w-full h-44 object-cover transition-transform duration-500"
                      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Title */}
                    <h3
                      className="text-lg font-semibold mb-2 line-clamp-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="blog-title-link transition-colors duration-300"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Meta */}
                    <div
                      className="flex flex-wrap items-center mb-3"
                      style={{
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span className="flex items-center mr-3">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(post.published_at)}
                      </span>
                      {post.reading_time && (
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {t("blog.readingTime", {
                            minutes: post.reading_time,
                          })}
                        </span>
                      )}
                    </div>

                    {/* Excerpt */}
                    <p
                      className="text-sm leading-relaxed flex-grow line-clamp-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap mt-3 gap-1.5">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded-full"
                            style={{
                              fontSize: "0.65rem",
                              fontFamily: "var(--font-mono)",
                              background: "var(--accent-dim)",
                              color: "var(--accent)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            <FaTag
                              className="mr-1"
                              style={{ fontSize: "0.55rem" }}
                            />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-block mt-4 text-sm transition-opacity duration-300 hover:opacity-80"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--accent)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("blog.readMore", "Read More")} →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* View All Posts link */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link
                to="/blog"
                className="btn btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {t("blog.viewAllPosts", "View All Posts")}
                <FaArrowRight size={12} />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
