import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import BlogList from "./BlogList";
import BlogSidebar from "./BlogSidebar";
import BlogSearch from "./BlogSearch";
import Pagination from "./Pagination";
import blogApi from "../../services/blogApi";

function BlogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  });

  // Get query params
  const page = parseInt(searchParams.get("page") || "1");
  const tag = searchParams.get("tag");

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getPosts(page, 6, tag);
        setPosts(data.posts);
        setPagination({
          currentPage: parseInt(data.currentPage),
          totalPages: data.totalPages,
          totalPosts: data.totalPosts,
        });
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(t("blog.error.posts"));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, tag, t]);

  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <section id="blog" className="py-20">
      <div className="section-inner">
        <h2 className="section-title">
          <span className="number">06.</span> {t("blog.title")}
        </h2>

        {/* Search bar */}
        <div className="mb-8">
          <BlogSearch />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md">
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">
                  {tag ? t("blog.noPostsWithTag", { tag }) : t("blog.noPosts")}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  {t("blog.tryDifferentSearch")}
                </p>
              </div>
            ) : (
              <>
                {/* Tag filter indicator */}
                {tag && (
                  <div className="mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-light-secondary dark:bg-dark-secondary text-sm">
                      <span className="mr-2">
                        {t("blog.filterByTag")}:{" "}
                        <span className="font-semibold">{tag}</span>
                      </span>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.delete("tag");
                          params.set("page", "1");
                          setSearchParams(params);
                        }}
                        className="text-light-accent dark:text-dark-accent hover:opacity-80"
                        aria-label={t("blog.clearFilter")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Blog posts grid */}
                <BlogList posts={posts} />

                {/* Pagination */}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
