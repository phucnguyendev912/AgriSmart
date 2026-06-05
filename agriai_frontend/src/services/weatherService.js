import api from './api';

export const fetchWeatherDiseaseRisks = async (lat, lon) => {
  const response = await api.get('/api/weather/disease-risks', {
    params: { latitude: lat, longitude: lon },
  });
  return response.data;
};

// Uses fetch instead of api instance to avoid sending internal cookies to third-party
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
