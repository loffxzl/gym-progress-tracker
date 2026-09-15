import { axiosClient } from "./axiosClient.js";

export const bodyWeightApi = {
  getWeightData: async (params = {}) => {
    return await axiosClient.get("/body-weight", { params });
  },
  addWeightLog: async (data) => {
    return await axiosClient.post("/body-weight", data);
  },
  setGoalWeight: async (goalWeight) => {
    return await axiosClient.put("/body-weight/goal", { goalWeight: Number(goalWeight) });
  },
  deleteWeightLog: async (id) => {
    return await axiosClient.delete(`/body-weight/${id}`);
  },
};
