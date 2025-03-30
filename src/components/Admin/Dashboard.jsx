import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPlus, FaEdit, FaTrash, FaEye, FaSignOutAlt } from "react-icons/fa";
import authService from "../../services/authService";
import blogApi from "../../services/blogApi";

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const data = await blogApi.getPosts(currentPage, 10);

        // This should contain both published and draft posts
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(t("admin.dashboard.errorFetchingPosts"));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, t]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle publish/unpublish
  const handleTogglePublish = async (postId, publishStatus) => {
    try {
      setPublishLoading(postId);

      // Call the API to update post status
      const response = await blogApi.updatePostStatus(postId, publishStatus);

      // Update the post in the local state with all the updated fields from the server
      if (response && response.post) {
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return response.post;
            }
            return post;
          })
        );
      } else {
        // Fallback to simpler update if response format is unexpected
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                published: publishStatus,
                published_at:
                  publishStatus && !post.published_at
                    ? new Date().toISOString()
                    : post.published_at,
              };
            }
            return post;
          })
        );
      }
    } catch (err) {
      console.error("Error updating post status:", err);
      setError(
        t("admin.dashboard.errorUpdatingStatus", "Failed to update post status")
      );
    } finally {
      setPublishLoading(null);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (postId) => {
    if (!postId) return;

    try {
      setDeleteLoading(true);
      await blogApi.deletePost(postId);

      // Refresh posts after delete
      const data = await blogApi.getPosts(currentPage, 10);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);

      // If we deleted the last post on a page, go to previous page
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(t("admin.dashboard.errorDeletingPost"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {t("admin.dashboard.title")}
          </h1>

          <div className="flex items-center space-x-4">
            <Link
              to="/admin/posts/new"
              className="bg-light-accent dark:bg-teal-600 text-white py-2 px-4 rounded-md font-medium flex items-center transition-colors hover:bg-light-accent/90 dark:hover:bg-teal-500"
            >
              <FaPlus className="mr-2" />
              {t("admin.dashboard.newPost")}
            </Link>

            <button
              onClick={handleSignOut}
              className="bg-light-secondary dark:bg-gray-700 text-light-text-primary dark:text-white py-2 px-4 rounded-md font-medium flex items-center transition-colors hover:bg-light-secondary/80 dark:hover:bg-gray-600"
            >
              <FaSignOutAlt className="mr-2" />
              {t("admin.dashboard.signOut")}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
              {t("admin.dashboard.noPosts")}
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              {t("admin.dashboard.getStarted")}
            </p>
            <Link
              to="/admin/posts/new"
              className="bg-light-accent dark:bg-dark-accent text-white py-2 px-4 rounded-md font-medium inline-flex items-center transition-colors hover:opacity-90"
            >
              <FaPlus className="mr-2" />
              {t("admin.dashboard.createFirstPost")}
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-light-primary/40 dark:bg-dark-primary/40">
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-gray-200 uppercase tracking-wider">
                        {t("admin.dashboard.title")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-gray-200 uppercase tracking-wider">
                        {t("admin.dashboard.status")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-gray-200 uppercase tracking-wider">
                        {t("admin.dashboard.date")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-gray-200 uppercase tracking-wider">
                        {t("admin.dashboard.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-secondary/40 dark:divide-dark-secondary/40">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-light-primary/20 dark:hover:bg-dark-primary/20"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-light-text-primary dark:text-white">
                            {post.title}
                          </div>
                          <div className="text-xs text-light-text-secondary dark:text-gray-300 truncate max-w-md">
                            {post.excerpt}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.published
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                            }`}
                          >
                            {post.published
                              ? t("admin.dashboard.published")
                              : t("admin.dashboard.draft")}
                          </span>

                          <button
                            onClick={() =>
                              handleTogglePublish(post.id, !post.published)
                            }
                            disabled={publishLoading === post.id}
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                              publishLoading === post.id
                                ? "opacity-75 cursor-wait"
                                : ""
                            } ${
                              post.published
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            }`}
                          >
                            {publishLoading === post.id ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-current"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                {post.published
                                  ? t(
                                      "admin.dashboard.unpublishing",
                                      "Unpublishing..."
                                    )
                                  : t(
                                      "admin.dashboard.publishing",
                                      "Publishing..."
                                    )}
                              </span>
                            ) : (
                              <>
                                {post.published
                                  ? t("admin.dashboard.unpublish", "Unpublish")
                                  : t("admin.dashboard.publish", "Publish")}
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-gray-300">
                          {/* Show updated_at for drafts, published_at for published posts */}
                          {post.published
                            ? formatDate(post.published_at)
                            : formatDate(post.updated_at) + " (updated)"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex">
                          {post.published && (
                            <Link
                              to={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-light-accent dark:text-dark-accent hover:opacity-80"
                              title={t("admin.dashboard.view")}
                            >
                              <FaEye className="text-lg" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/posts/edit/${post.id}`}
                            className="text-blue-500 dark:text-blue-300 hover:opacity-80"
                            title={t("admin.dashboard.edit")}
                          >
                            <FaEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(post.id)}
                            className="text-red-500 dark:text-red-300 hover:opacity-80"
                            title={t("admin.dashboard.delete")}
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-l-md border border-light-secondary dark:border-dark-secondary ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed bg-light-secondary/50 dark:bg-dark-secondary/50 text-light-text-secondary dark:text-gray-400"
                        : "bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-white hover:bg-light-secondary dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("admin.dashboard.previous")}
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 border-t border-b border-light-secondary dark:border-dark-secondary ${
                        currentPage === index + 1
                          ? "bg-light-accent dark:bg-dark-accent text-white"
                          : "bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-white hover:bg-light-secondary dark:hover:bg-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-r-md border border-light-secondary dark:border-dark-secondary ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed bg-light-secondary/50 dark:bg-dark-secondary/50 text-light-text-secondary dark:text-gray-400"
                        : "bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-white hover:bg-light-secondary dark:hover:bg-gray-700"
                    }`}
                  >
                    {t("admin.dashboard.next")}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-light-primary dark:bg-dark-primary p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-light-text-primary dark:text-white">
              {t("admin.dashboard.confirmDelete")}
            </h3>
            <p className="text-light-text-secondary dark:text-gray-300 mb-6">
              {t("admin.dashboard.confirmDeleteMessage")}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-light-text-primary dark:text-white bg-light-secondary dark:bg-gray-700 rounded-md hover:bg-light-secondary/80 dark:hover:bg-gray-600"
                disabled={deleteLoading}
              >
                {t("admin.dashboard.cancel")}
              </button>
              <button
                onClick={() => handleDeleteConfirm(confirmDelete)}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("admin.dashboard.deleting")}
                  </span>
                ) : (
                  t("admin.dashboard.delete")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
