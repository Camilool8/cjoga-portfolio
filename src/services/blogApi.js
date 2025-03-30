import axios from "axios";
import authService from "./authService";

const API_URL = "/api";

const blogApi = {
  // Get auth header with token
  getAuthHeader: () => {
    return {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    };
  },

  // Get all blog posts with pagination
  getPosts: async (page = 1, limit = 6, tag = null) => {
    try {
      const params = { page, limit };
      if (tag) params.tag = tag;

      // Check if this is an admin request (has auth token)
      const token = authService.getToken();

      if (token) {
        // Admin request - use admin endpoint to get all posts (published and drafts)
        const response = await axios.get(`${API_URL}/blog/admin/posts`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } else {
        // Public request - use public endpoint (published posts only)
        const response = await axios.get(`${API_URL}/blog/posts`, { params });
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }
  },

  // Get a single blog post by slug
  getPost: async (slugOrId) => {
    try {
      // For admin edit mode (UUID), use admin endpoint
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          slugOrId
        )
      ) {
        const response = await axios.get(
          `${API_URL}/blog/admin/posts/${slugOrId}`,
          blogApi.getAuthHeader()
        );

        // Check if response has the expected structure
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
        // Normal public post view
        const response = await axios.get(`${API_URL}/blog/posts/${slugOrId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slugOrId}:`, error);
      throw error;
    }
  },

  // Get all tags
  getTags: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/tags`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      throw error;
    }
  },

  // Search blog posts
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

  // ADMIN METHODS

  // Create a new blog post
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

  // Update an existing blog post
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

  // Delete a blog post
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

  // Update post status (publish/unpublish)
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

  // Upload an image for a blog post
  uploadImage: async (file) => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("image", file);

      // Get auth header
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
        "Detailed upload error in API:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default blogApi;
