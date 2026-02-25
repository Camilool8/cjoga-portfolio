import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import blogApi from "../services/blogApi";

const useBlogPosts = (page = 1, limit = 6, tag = null) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await blogApi.getPosts(page, limit, tag);
        
        if (isMounted) {
          setPosts(data.posts || []);
          setPagination({
            currentPage: parseInt(data.currentPage),
            totalPages: data.totalPages,
            totalPosts: data.totalPosts,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching posts:", err);
          setError(t("blog.error.posts"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [page, limit, tag, t]);

  return { posts, loading, error, pagination };
};

export default useBlogPosts;

