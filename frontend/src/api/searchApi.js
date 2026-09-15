import { axiosClient } from "./axiosClient.js";

export const searchApi = {
  globalSearch: async (query) => {
    return await axiosClient.get("/search", { params: { q: query } });
  },
};
