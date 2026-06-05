import api from './api';

export const getReviews = async (params) => {
  const response = await api.get('/api/admin/reviews', { params });
  return response.data;
};
