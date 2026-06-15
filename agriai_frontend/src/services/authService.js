import api, { refreshToken } from './api';

export { refreshToken };

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response;
};

export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response;
};

export const loginWithGoogle = async (idToken) => {
  const response = await api.post('/api/auth/google', { idToken });
  return response;
};

