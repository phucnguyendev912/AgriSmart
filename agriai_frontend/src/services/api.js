import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_REFRESH_SKIP_PATHS = ['/api/auth/login', '/api/auth/refresh-token'];

const shouldSkipTokenRefresh = (url = '') =>
  TOKEN_REFRESH_SKIP_PATHS.some((path) => url.includes(path));

export const refreshToken = async () => {
  const response = await axios.post(
    `${API_URL}/api/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Retry only once, do not retry the refresh token request itself
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipTokenRefresh(requestUrl)
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
