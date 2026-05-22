import api, { refreshToken } from './api';

export { refreshToken };

/**
 * Logs in a user using email and password.
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response;
};

/**
 * Registers a new user with user registration data.
 */
export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response;
};

/**
 * Logs out the current user and clears session context.
 */
export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response;
};
