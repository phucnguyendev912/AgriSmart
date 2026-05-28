import api from './api';

export const getAreas = async () => {
  const response = await api.get('/api/areas');
  return response;
};

export const createArea = async (areaData) => {
  const response = await api.post('/api/areas', areaData);
  return response;
};

export const updateArea = async (areaId, areaData) => {
  const response = await api.put(`/api/areas/${areaId}`, areaData);
  return response;
};

export const deleteArea = async (areaId) => {
  const response = await api.delete(`/api/areas/${areaId}`);
  return response;
};
