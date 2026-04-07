import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState();
    const { addToast } = useToastStore.getState();
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      logout();
      addToast({
        title: 'Session expired',
        message: 'Please log in again.',
        tone: 'warning',
      });

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (statusCode >= 500) {
      addToast({
        title: 'Server error',
        message: error.response?.data?.message || 'Something went wrong on the server.',
        tone: 'error',
      });
    } else if (!error.response) {
      addToast({
        title: 'Network issue',
        message: 'Unable to reach the server. Check your connection and try again.',
        tone: 'error',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
