import api from './api';

/**
 * Fetches disease occurrence markers to display on the map.
 */
export const getMarkers = async (params) => {
  const response = await api.get('/api/map/markers', { params });
  return response;
};

/**
 * Fetches distinct list of diseases found on the map database.
 */
export const getDiseases = async () => {
  const response = await api.get('/api/map/diseases');
  return response;
};
