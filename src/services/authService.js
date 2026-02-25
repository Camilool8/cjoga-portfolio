import axios from "axios";

const authService = {
  _token: null,

  getAuthHeader() {
    return this._token ? { Authorization: `Bearer ${this._token}` } : {};
  },

  signIn: async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });

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

  signOut: async () => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          headers: authService.getAuthHeader(),
        }
      );

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

  getCurrentUser: async () => {
    try {
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

  isAdmin: async () => {
    try {
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

  getToken: () => {
    if (!authService._token) {
      authService._token = sessionStorage.getItem("auth_token");
    }
    return authService._token;
  },

  init: async () => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      authService._token = token;
      try {
        await authService.getCurrentUser();
      } catch (error) {
        authService._token = null;
        sessionStorage.removeItem("auth_token");
      }
    }
  },
};

authService.init();

export default authService;
