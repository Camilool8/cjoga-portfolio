import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function RelatedPosts({ posts }) {
  const { i18n } = useTranslation();

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
          className="rounded-xl overflow-hidden group"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            transition:
              "transform 0.4s var(--ease-out-expo), border-color 0.4s, box-shadow 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--border-medium)";
            e.currentTarget.style.boxShadow =
              "0 8px 30px rgba(0, 0, 0, 0.12)";
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
              className="w-full h-32 object-cover"
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

          <div className="p-4">
            <h3
              className="text-base font-semibold mb-1 line-clamp-2"
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
            </h3>

            <div
              className="text-xs"
              style={{
                color: "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatDate(post.published_at)}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
