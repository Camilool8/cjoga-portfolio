import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import BlogList from "./BlogList";
import BlogSidebar from "./BlogSidebar";
import BlogSearch from "./BlogSearch";
import Pagination from "./Pagination";
import useBlogPosts from "../../hooks/useBlogPosts";

function BlogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const tag = searchParams.get("tag");

  const { posts, loading, error, pagination } = useBlogPosts(page, 6, tag);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <section id="blog" className="py-20">
      <div className="section-inner">
        <div className="mb-10">
          <span className="section-label">{t("blog.title")}</span>
          <h2 className="section-heading">{t("blog.title")}</h2>
        </div>

        <div className="mb-8">
          <BlogSearch />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
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
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--text-primary)",
                  }}
                >
                  {tag ? t("blog.noPostsWithTag", { tag }) : t("blog.noPosts")}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  {t("blog.tryDifferentSearch")}
                </p>
              </div>
            ) : (
              <>
                {tag && (
                  <div className="mb-6">
                    <div
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                      style={{
                        background: "var(--accent-dim)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span className="mr-2">
                        {t("blog.filterByTag")}:{" "}
                        <span
                          className="font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          {tag}
                        </span>
                      </span>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete("tag");
                          params.set("page", "1");
                          setSearchParams(params);
                        }}
                        className="hover:opacity-80"
                        style={{ color: "var(--accent)" }}
                        aria-label={t("blog.clearFilter")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                <BlogList posts={posts} />

                {pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
