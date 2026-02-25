import axios from "axios";

const API_URL = "/api";

const terminalApi = {
  execute: async (command) => {
    try {
      const response = await axios.post(`${API_URL}/terminal/execute`, {
        command,
      });
      return response.data;
    } catch (error) {
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
