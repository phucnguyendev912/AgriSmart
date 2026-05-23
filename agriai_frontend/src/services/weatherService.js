import api from './api';

/**
 * Fetches disease risks by weather from the internal backend.
 * Uses the common Axios instance (api.js).
 */
export const fetchWeatherDiseaseRisks = async (lat, lon) => {
  const response = await api.get('/api/weather/disease-risks', {
    params: { latitude: lat, longitude: lon },
  });
  return response.data;
};

/**
 * Reverse geocodes coordinates (lat, lon) to a region name using Nominatim OpenStreetMap API.
 * Uses a separate fetch request to prevent sending internal cookies to a third-party service.
 */
export const reverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'vi' } }
  );
  if (!res.ok) throw new Error('Nominatim error');
  const data = await res.json();
  return (
    data.address?.state ||
    data.address?.city ||
    data.address?.county ||
    ''
  );
};
