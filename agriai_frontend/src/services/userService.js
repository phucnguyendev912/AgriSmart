import api from './api';

export const updateProfile = async (profileData) => {
  const response = await api.put('/api/users/profile', profileData);
  return response;
};
