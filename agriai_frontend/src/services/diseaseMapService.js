import api from './api';

export const getMarkers = async (params) => {
  const response = await api.get('/api/map/markers', { params });
  return response;
};

export const getDiseases = async () => {
  const response = await api.get('/api/map/diseases');
  return response;
};
