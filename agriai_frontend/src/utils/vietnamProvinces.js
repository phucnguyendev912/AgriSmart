// 34 representative provinces/cities covering 7 agricultural regions of Vietnam
export const VIETNAM_PROVINCES = [
  // Northern Region (10)
  { id: 1,  name: 'Hà Nội',           lat: 21.0245, lon: 105.8412 },
  { id: 2,  name: 'Hải Phòng',        lat: 20.8449, lon: 106.6881 },
  { id: 3,  name: 'Quảng Ninh',       lat: 21.0064, lon: 107.2925 },
  { id: 4,  name: 'Bắc Giang',        lat: 21.2820, lon: 106.1974 },
  { id: 5,  name: 'Thái Nguyên',      lat: 21.5942, lon: 105.8482 },
  { id: 6,  name: 'Hà Giang',         lat: 22.8026, lon: 104.9784 },
  { id: 7,  name: 'Lào Cai',          lat: 22.4809, lon: 103.9750 },
  { id: 8,  name: 'Điện Biên',        lat: 21.3860, lon: 103.0230 },
  { id: 9,  name: 'Sơn La',           lat: 21.3256, lon: 103.9144 },
  { id: 10, name: 'Thanh Hóa',        lat: 19.8067, lon: 105.7852 },

  // Central Region (11)
  { id: 11, name: 'Nghệ An',          lat: 19.2342, lon: 104.9200 },
  { id: 12, name: 'Hà Tĩnh',          lat: 18.3560, lon: 105.8877 },
  { id: 13, name: 'Quảng Trị',        lat: 17.4689, lon: 106.5998 },
  { id: 14, name: 'Huế',              lat: 16.4674, lon: 107.5905 },
  { id: 15, name: 'Đà Nẵng',          lat: 16.0544, lon: 108.2022 },
  { id: 16, name: 'Quảng Nam',        lat: 15.5394, lon: 108.0191 },
  { id: 17, name: 'Quảng Ngãi',       lat: 15.1214, lon: 108.8046 },
  { id: 18, name: 'Bình Định',        lat: 13.7820, lon: 109.2196 },
  { id: 19, name: 'Khánh Hòa',        lat: 12.2388, lon: 109.1968 },
  { id: 20, name: 'Ninh Thuận',       lat: 11.5638, lon: 108.9880 },
  { id: 21, name: 'Bình Thuận',       lat: 11.0904, lon: 108.0721 },

  // Central Highlands (4)
  { id: 22, name: 'Gia Lai',          lat: 13.9835, lon: 108.0000 },
  { id: 23, name: 'Đắk Lắk',          lat: 12.7100, lon: 108.2378 },
  { id: 24, name: 'Đắk Nông',         lat: 12.0046, lon: 107.6905 },
  { id: 25, name: 'Lâm Đồng',        lat: 11.5753, lon: 108.1429 },

  // Southern Region (9)
  { id: 26, name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { id: 27, name: 'Đồng Nai',         lat: 11.0686, lon: 107.1676 },
  { id: 28, name: 'Bình Dương',       lat: 11.3254, lon: 106.4770 },
  { id: 29, name: 'Tây Ninh',         lat: 11.3351, lon: 106.1099 },
  { id: 30, name: 'Long An',          lat: 10.6956, lon: 106.2431 },
  { id: 31, name: 'Tiền Giang',       lat: 10.4493, lon: 106.3421 },
  { id: 32, name: 'An Giang',         lat: 10.5216, lon: 105.1259 },
  { id: 33, name: 'Cần Thơ',          lat: 10.0452, lon: 105.7469 },
  { id: 34, name: 'Kiên Giang',       lat:  9.8249, lon: 105.1259 },
];

export const DEFAULT_PROVINCE = VIETNAM_PROVINCES.find((p) => p.name === 'An Giang');

/**
 * Finds the nearest province using latitude and longitude coordinates.
 * Used after geolocation or reverse geocoding fails to match exactly.
 * @param {number} lat - Latitude coordinate.
 * @param {number} lon - Longitude coordinate.
 * @returns {Object} Nearest province object from predefined list.
 */
export function findNearestProvince(lat, lon) {
  let nearest = VIETNAM_PROVINCES[0];
  let minDist = Infinity;
  for (const p of VIETNAM_PROVINCES) {
    const d = Math.hypot(p.lat - lat, p.lon - lon);
    if (d < minDist) { minDist = d; nearest = p; }
  }
  return nearest;
}

/**
 * Finds a province in the predefined list matching a name string.
 * Used to parse the output of reverse geocoding.
 * @param {string} name - Name of the province.
 * @returns {Object|null} Matching province object or null.
 */
export function findProvinceByName(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  return VIETNAM_PROVINCES.find((p) =>
    lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower)
  ) || null;
}
