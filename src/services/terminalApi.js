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
          output:
            "Rate limit exceeded. Please wait before sending more commands.",
          type: "error",
        };
      }
      return {
        output: "Connection error. Server may be unavailable.",
        type: "error",
      };
    }
  },
};

export default terminalApi;
