import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function RelatedPosts({ posts }) {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-light-secondary dark:bg-dark-secondary rounded-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
        >
          {/* Cover Image */}
          <Link to={`/blog/${post.slug}`} className="block">
            <img
              src={post.cover_image || "/images/blog-placeholder.jpg"}
              alt={post.title}
              className="w-full h-32 object-cover"
            />
          </Link>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-base font-semibold mb-1 line-clamp-2 text-light-text-primary dark:text-dark-text-primary">
              <Link
                to={`/blog/${post.slug}`}
                className="hover:text-light-accent dark:hover:text-dark-accent"
              >
                {post.title}
              </Link>
            </h3>

            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {formatDate(post.published_at)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
