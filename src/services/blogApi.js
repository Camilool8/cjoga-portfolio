import axios from "axios";
import authService from "./authService";

const API_URL = "/api";

const blogApi = {
  getAuthHeader: () => {
    return {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    };
  },

  getPosts: async (page = 1, limit = 6, tag = null) => {
    try {
      const params = { page, limit };
      if (tag) params.tag = tag;

      const token = authService.getToken();

      if (token) {
        const response = await axios.get(`${API_URL}/blog/admin/posts`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } else {
        const response = await axios.get(`${API_URL}/blog/posts`, { params });
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  getPost: async (slugOrId) => {
    try {
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          slugOrId
        )
      ) {
        const response = await axios.get(
          `${API_URL}/blog/admin/posts/${slugOrId}`,
          blogApi.getAuthHeader()
        );

        if (!response.data || !response.data.post) {
          if (response.data && response.data.id) {
            return { post: response.data };
          } else {
            console.error("Unexpected API response format:", response.data);
            throw new Error("Invalid response format from API");
          }
        }

        return response.data;
      } else {
        const response = await axios.get(`${API_URL}/blog/posts/${slugOrId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slugOrId}:`, error);
      throw error;
    }
  },

  getTags: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/tags`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      throw error;
    }
  },

  searchPosts: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/blog/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching blog posts:", error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axios.post(
        `${API_URL}/blog/admin/posts`,
        postData,
        blogApi.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error("Error creating blog post:", error.response?.data || error);
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await axios.put(
        `${API_URL}/blog/admin/posts/${id}`,
        postData,
        blogApi.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating blog post with ID ${id}:`,
        error.response?.data || error
      );
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/blog/admin/posts/${id}`,
        blogApi.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting blog post with ID ${id}:`, error);
      throw error;
    }
  },

  updatePostStatus: async (id, published) => {
    try {
      const response = await axios.patch(
        `${API_URL}/blog/admin/posts/${id}/status`,
        { published },
        blogApi.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating blog post status with ID ${id}:`, error);
      throw error;
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const headers = {
        ...blogApi.getAuthHeader().headers,
        "Content-Type": "multipart/form-data",
      };

      const response = await axios.post(
        `${API_URL}/blog/admin/upload`,
        formData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Upload error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default blogApi;
