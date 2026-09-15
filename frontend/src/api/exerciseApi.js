import { axiosClient } from './axiosClient.js';

export const exerciseApi = {
  getExercises: async (params = {}) => {
    return await axiosClient.get('/exercises', { params });
  },
  getExerciseById: async (id) => {
    return await axiosClient.get(`/exercises/${id}`);
  },
  createExercise: async (exerciseData) => {
    return await axiosClient.post('/exercises', exerciseData);
  },
  updateExercise: async (id, exerciseData) => {
    return await axiosClient.put(`/exercises/${id}`, exerciseData);
  },
  deleteExercise: async (id) => {
    return await axiosClient.delete(`/exercises/${id}`);
  },
};
