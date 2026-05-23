import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Common Axios instance for all internal API calls
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Refreshes the authentication token using raw Axios to avoid circular dependency.
 * This is exported so authService can re-export if needed.
 */
export const refreshToken = async () => {
  const response = await axios.post(
    `${API_URL}/api/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

// Response interceptor: automatically refreshes token on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry only once, do not retry the refresh token request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        await refreshToken();
        // New HTTP-only cookie has been automatically set by the backend
        return api(originalRequest);
      } catch (refreshError) {
        // Token is fully expired: clean up and redirect to home page
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
