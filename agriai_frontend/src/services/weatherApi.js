const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Fetch thời tiết hiện tại từ Open-Meteo (miễn phí, không cần API key)
 * @param {number} lat
 * @param {number} lon
 * @returns {{ temperature: number, humidity: number, precipitation: number, weatherCode: number }}
 */
export async function fetchWeatherDiseaseRisks(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
  });

  const res = await fetch(`${API_URL}/api/weather/disease-risks?${params}`);
  if (!res.ok) throw new Error(`Weather risk API error: ${res.status}`);

  return res.json();
}

/**
 * Reverse geocode lat/lon → tên tỉnh bằng Nominatim OSM
 * @param {number} lat
 * @param {number} lon
 * @returns {string} tên tỉnh/thành
 */
export async function reverseGeocode(lat, lon) {
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
}
