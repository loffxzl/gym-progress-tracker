import { axiosClient } from './axiosClient.js';

export const workoutApi = {
  getWorkouts: async (params = {}) => {
    return await axiosClient.get('/workouts', { params });
  },
  getActiveWorkout: async () => {
    return await axiosClient.get('/workouts/active');
  },
  getAnalytics: async () => {
    return await axiosClient.get('/workouts/analytics');
  },
  getChartAnalytics: async () => {
    return await axiosClient.get('/workouts/analytics/charts');
  },
  getWorkoutById: async (id) => {
    return await axiosClient.get(`/workouts/${id}`);
  },
  startWorkout: async (data = {}) => {
    return await axiosClient.post('/workouts/start', data);
  },
  endWorkout: async (id, data) => {
    return await axiosClient.put(`/workouts/${id}/end`, data);
  },
  createWorkout: async (workoutData) => {
    return await axiosClient.post('/workouts', workoutData);
  },
  updateWorkout: async (id, workoutData) => {
    return await axiosClient.put(`/workouts/${id}`, workoutData);
  },
  deleteWorkout: async (id) => {
    return await axiosClient.delete(`/workouts/${id}`);
  },
};
