import { axiosClient } from './axiosClient.js';

export const aiCoachApi = {
  getInsights() {
    return axiosClient.get('/ai-coach/insights');
  },
};
