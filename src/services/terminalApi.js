import axios from "axios";

const API_URL = "/api";
const REQUEST_TIMEOUT_MS = 10000;

const terminalApi = {
  execute: async (command) => {
    try {
      const response = await axios.post(
        `${API_URL}/terminal/execute`,
        { command },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      return response.data;
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return {
          output: null,
          type: "error",
          errorKey: "timeout",
        };
      }
      if (error.response?.status === 429) {
        return {
          output: null,
          type: "error",
          errorKey: "rateLimited",
        };
      }
      return {
        output: null,
        type: "error",
        errorKey: "connectionError",
      };
    }
  },
};

export default terminalApi;
