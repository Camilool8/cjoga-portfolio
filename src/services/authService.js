import axios from "axios";

const authService = {
  _token: null,

  // Helper to get auth headers
  getAuthHeader() {
    return this._token ? { Authorization: `Bearer ${this._token}` } : {};
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });

      // Store token
      const session = response.data.session;
      if (session?.access_token) {
        authService._token = session.access_token;
        sessionStorage.setItem("auth_token", session.access_token);
      }

      return response.data;
    } catch (error) {
      console.error(
        "Error signing in:",
        error.response?.data?.error || error.message
      );
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          headers: authService.getAuthHeader(),
        }
      );

      // Clear token
      authService._token = null;
      sessionStorage.removeItem("auth_token");
    } catch (error) {
      console.error(
        "Error signing out:",
        error.response?.data?.error || error.message
      );
      throw error;
    }
  },

  // Get the current user
  getCurrentUser: async () => {
    try {
      // Try to get token from memory or sessionStorage
      if (!authService._token) {
        authService._token = sessionStorage.getItem("auth_token");
        if (!authService._token) return null;
      }

      const response = await axios.get("/api/auth/user", {
        headers: authService.getAuthHeader(),
      });

      return response.data.user;
    } catch (error) {
      console.error(
        "Error getting user:",
        error.response?.data?.error || error.message
      );
      authService._token = null;
      sessionStorage.removeItem("auth_token");
      return null;
    }
  },

  // Check if the user is authenticated and an admin
  isAdmin: async () => {
    try {
      // Try to get token from memory or sessionStorage
      if (!authService._token) {
        authService._token = sessionStorage.getItem("auth_token");
        if (!authService._token) return false;
      }

      const response = await axios.get("/api/auth/admin", {
        headers: authService.getAuthHeader(),
      });

      return response.data.isAdmin;
    } catch (error) {
      console.error(
        "Error checking admin status:",
        error.response?.data?.error || error.message
      );
      return false;
    }
  },

  // Get the current session token
  getToken: () => {
    if (!authService._token) {
      authService._token = sessionStorage.getItem("auth_token");
    }
    return authService._token;
  },

  // Initialize - call this when your app loads
  init: async () => {
    // Try to restore token from sessionStorage
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      authService._token = token;
      // Validate the token
      try {
        await authService.getCurrentUser();
      } catch (error) {
        // Token is invalid, clear it
        authService._token = null;
        sessionStorage.removeItem("auth_token");
      }
    }
  },
};

// Initialize auth service
authService.init();

export default authService;
