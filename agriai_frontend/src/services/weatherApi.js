/**
 * Fetch thời tiết hiện tại từ Open-Meteo (miễn phí, không cần API key)
 * @param {number} lat
 * @param {number} lon
 * @returns {{ temperature: number, humidity: number, precipitation: number, weatherCode: number }}
 */
export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
    timezone: 'Asia/Bangkok',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const c = data.current;

  return {
    temperature:   Math.round(c.temperature_2m),
    humidity:      c.relative_humidity_2m,
    precipitation: c.precipitation,
    weatherCode:   c.weather_code,
  };
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
