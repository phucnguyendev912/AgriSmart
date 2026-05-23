/**
 * Rule-based disease risk engine.
 * Maps weather conditions to potential crop disease risks.
 */

const RULES = [
  {
    id: 'dao-on',
    name: 'Đạo ôn',
    nameEn: 'Rice Blast',
    icon: 'bug_report',
    highCondition: (t, h) => t >= 20 && t <= 28 && h > 80,
    medCondition:  (t, h) => t >= 20 && t <= 30 && h >= 70 && h <= 80,
    highDesc: 'Nhiệt độ 20–28°C kết hợp độ ẩm cao tạo điều kiện lý tưởng cho bào tử phát tán.',
    medDesc:  'Điều kiện có thể thuận lợi cho bệnh, cần theo dõi ruộng thường xuyên.',
  },
  {
    id: 'kho-van',
    name: 'Khô vằn',
    nameEn: 'Sheath Blight',
    icon: 'grass',
    highCondition: (t, h) => t > 28 && h > 80,
    medCondition:  (t, h) => t > 25 && h > 75,
    highDesc: 'Nhiệt độ và độ ẩm cao tạo môi trường thuận lợi cho nấm Rhizoctonia solani.',
    medDesc:  'Theo dõi các vết bệnh ở bẹ lá, đặc biệt giai đoạn đẻ nhánh.',
  },
  {
    id: 'bac-la',
    name: 'Bạc lá',
    nameEn: 'Bacterial Blight',
    icon: 'water_drop',
    highCondition: (t, h, r) => r > 5 && h > 85,
    medCondition:  (t, h, r) => r > 2 && h > 80,
    highDesc: 'Mưa lớn kết hợp độ ẩm rất cao — vi khuẩn Xanthomonas dễ lây lan qua nước.',
    medDesc:  'Điều kiện ẩm ướt có nguy cơ bệnh vào giai đoạn trổ bông.',
  },
  {
    id: 'ray-nau',
    name: 'Rầy nâu',
    nameEn: 'Brown Planthopper',
    icon: 'pest_control',
    highCondition: (t, h) => t > 28 && h >= 70 && h <= 80,
    medCondition:  (t, h) => t > 25 && h > 65,
    highDesc: 'Nhiệt độ cao và độ ẩm vừa phải tăng tốc độ sinh sản của rầy.',
    medDesc:  'Kiểm tra mật độ rầy cám và rầy trưởng thành tại gốc lúa.',
  },
  {
    id: 'sau-cuon-la',
    name: 'Sâu cuốn lá',
    nameEn: 'Leaf Folder',
    icon: 'eco',
    highCondition: (t, h) => t > 25 && h > 75,
    medCondition:  (t, h) => t > 22 && h > 70,
    highDesc: 'Điều kiện ấm ẩm thúc đẩy vòng đời sâu non, gia tăng gây hại.',
    medDesc:  'Theo dõi lá cuốn hình ống, đặc biệt giai đoạn đẻ nhánh rộ.',
  },
  {
    id: 'lem-lep-hat',
    name: 'Lem lép hạt',
    nameEn: 'Grain Discoloration',
    icon: 'grain',
    highCondition: (t, h, r) => t > 25 && r > 3,
    medCondition:  (t, h, r) => t > 22 && r > 1,
    highDesc: 'Mưa trong giai đoạn trổ bông - chín sữa dễ gây nấm làm hạt đen, lép.',
    medDesc:  'Chú ý phun phòng nấm khi lúa bắt đầu trổ bông.',
  },
];

/**
 * @param {{ temperature: number, humidity: number, precipitation: number }} weather
 * @returns {Array<{ id, name, nameEn, icon, risk: 'HIGH'|'MEDIUM', description }>}
 */
export function evaluateDiseaseRisks({ temperature: t, humidity: h, precipitation: r }) {
  const results = [];

  for (const rule of RULES) {
    if (rule.highCondition(t, h, r)) {
      results.push({ id: rule.id, name: rule.name, nameEn: rule.nameEn, icon: rule.icon, risk: 'HIGH', description: rule.highDesc });
    } else if (rule.medCondition(t, h, r)) {
      results.push({ id: rule.id, name: rule.name, nameEn: rule.nameEn, icon: rule.icon, risk: 'MEDIUM', description: rule.medDesc });
    }
  }

  // Sort results: HIGH risk first, then MEDIUM risk
  return results.sort((a, b) => (a.risk === 'HIGH' ? -1 : 1));
}
