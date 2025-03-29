import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaTag } from "react-icons/fa";

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
          className="bg-light-secondary dark:bg-dark-secondary rounded-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
        >
          {/* Cover Image */}
          <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
            <img
              src={post.cover_image || "/images/blog-placeholder.jpg"}
              alt={post.title}
              className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
            />
          </Link>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow">
            {/* Title */}
            <h3 className="text-xl font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
              <Link
                to={`/blog/${post.slug}`}
                className="hover:text-light-accent dark:hover:text-dark-accent"
              >
                {post.title}
              </Link>
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center mb-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <span className="flex items-center mr-4 mb-1">
                <FaCalendarAlt className="mr-1" />
                {formatDate(post.published_at)}
              </span>

              <span className="flex items-center mb-1">
                <FaClock className="mr-1" />
                {t("blog.readingTime", { minutes: post.reading_time })}
              </span>
            </div>

            {/* Excerpt */}
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 flex-grow">
              {post.excerpt}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap mt-2 gap-2">
                {post.tags.map((tag, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={(e) => handleTagClick(tag, e)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-light-primary dark:bg-dark-primary text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
                  >
                    <FaTag className="mr-1 text-xs" />
                    {tag}
                  </a>
                ))}
              </div>
            )}

            {/* Read More Link */}
            <Link
              to={`/blog/${post.slug}`}
              className="inline-block mt-4 font-mono text-sm text-light-accent dark:text-dark-accent hover:underline"
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
