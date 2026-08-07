import axios from 'axios';

// Base URL points to our Express backend via environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          // Send refresh token to get a new access token
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh });
          
          const newAccessToken = res.data.accessToken;
          
          // Save the new access token
          localStorage.setItem('token', newAccessToken);
          
          // Update the failed request with the new token and retry it!
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If the refresh token is ALSO expired, then we must log the user out
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth:unauthorized'));
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, must log out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
