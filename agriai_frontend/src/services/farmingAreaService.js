import api from './api';

/**
 * Fetches all farming areas for the current user.
 */
export const getAreas = async () => {
  const response = await api.get('/api/areas');
  return response;
};

/**
 * Creates a new farming area.
 */
export const createArea = async (areaData) => {
  const response = await api.post('/api/areas', areaData);
  return response;
};

/**
 * Updates an existing farming area details.
 */
export const updateArea = async (areaId, areaData) => {
  const response = await api.put(`/api/areas/${areaId}`, areaData);
  return response;
};

/**
 * Deletes a farming area by ID.
 */
export const deleteArea = async (areaId) => {
  const response = await api.delete(`/api/areas/${areaId}`);
  return response;
};
