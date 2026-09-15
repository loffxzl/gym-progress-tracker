import { axiosClient } from './axiosClient.js';

export const authApi = {
  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  },
  login: async (credentials) => {
    return await axiosClient.post('/auth/login', credentials);
  },
  logout: async () => {
    return await axiosClient.post('/auth/logout');
  },
  getMe: async () => {
    return await axiosClient.get('/auth/me');
  },
  updateProfile: async (profileData) => {
    return await axiosClient.put('/auth/profile', profileData);
  },
};
