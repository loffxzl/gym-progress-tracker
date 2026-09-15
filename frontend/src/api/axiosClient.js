import axios from 'axios';
import { logger } from '../utils/logger.js';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Response Interceptor: Centralized Error Normalization & Redirects
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const errors = error.response?.data?.errors || [];

    logger.error(`API Request Error [${statusCode}] [${error.config?.url}]: ${message}`, error);

    // Handle 401 Unauthorized (Expired / Invalid session token)
    if (statusCode === 401) {
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject({
      statusCode,
      message,
      errors,
      rawError: error,
    });
  }
);
