# Plan: Section Thời Tiết & Cảnh Báo Bệnh

> **Branch:** `update/US-1.1`
> **Vị trí:** Giữa *Tính năng nổi bật* và *Đánh giá nhà nông* trên `HomePage.jsx`
> **Backend thay đổi:** ❌ Không cần

---

## Mục tiêu

Thêm một section động hiển thị:
1. **Vị trí hiện tại** — tự phát hiện qua geolocation hoặc chọn từ dropdown 63 tỉnh/thành.
2. **Thời tiết hiện tại** — 3 box: Nhiệt độ / Độ ẩm / Lượng mưa.
3. **Cảnh báo bệnh** — danh sách bệnh nguy cơ cao/trung bình dựa trên điều kiện thời tiết.

---

## Vị trí chèn

```
HomePage.jsx
├── Hero Section
├── Features Bento Grid          ← hiện có (line 44–128)
├── [NEW] WeatherDiseaseSection  ← chèn vào đây (line 129)
├── FarmerStories                ← hiện có (line 130)
└── Final CTA
```

---

## Nguồn dữ liệu

| Nguồn | Cách dùng | API Key |
|---|---|---|
| **Browser Geolocation** | `navigator.geolocation.getCurrentPosition()` | Không cần |
| **Nominatim OSM** | Reverse geocode lat/lon → tên tỉnh | Không cần |
| **Open-Meteo API** | Lấy thời tiết theo lat/lon, free hoàn toàn | Không cần |

**Open-Meteo endpoint:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,relative_humidity_2m,precipitation,weather_code
  &timezone=Asia/Bangkok
```

**Nominatim endpoint:**
```
GET https://nominatim.openstreetmap.org/reverse
  ?lat={lat}&lon={lon}&format=json
```

---

## Data Flow

```
[Browser Geolocation]
        │ lat, lon
        ▼
[Nominatim] reverse geocode
        │ tên tỉnh
        ▼
match trong vietnamProvinces.js
        │ province { name, lat, lon }
        ▼
[Open-Meteo API]
        │ temperature, humidity, precipitation
        ▼
[diseaseRiskRules.js]
        │ diseases [{ name, description, risk }]
        ▼
Render WeatherDiseaseSection
```

---

## Files cần tạo / sửa

### [NEW] `src/services/weatherApi.js`

```js
fetchWeather(lat, lon)
  → { temperature, humidity, precipitation, weatherCode }
```

---

### [NEW] `src/utils/vietnamProvinces.js`

```js
export const VIETNAM_PROVINCES = [
  { id: 1, name: 'An Giang',    lat: 10.5216, lon: 105.1259 },
  { id: 2, name: 'Bà Rịa - Vũng Tàu', lat: 10.5417, lon: 107.2429 },
  // ... 63 tỉnh/thành
]
```

---

### [NEW] `src/utils/diseaseRiskRules.js`

```js
evaluateDiseaseRisks({ temperature, humidity, precipitation })
  → Array<{ name, description, risk: 'HIGH' | 'MEDIUM' }>
```

**Bảng rules:**

| Bệnh | 🔴 Nguy cơ CAO | 🟡 Nguy cơ TRUNG |
|---|---|---|
| Đạo ôn (Rice Blast) | Temp 20–28°C & Humidity > 80% | Temp 20–30°C & Humidity 70–80% |
| Khô vằn (Sheath Blight) | Temp > 28°C & Humidity > 80% | Temp > 25°C & Humidity > 75% |
| Bạc lá (Bacterial Blight) | Rain > 5mm & Humidity > 85% | Rain > 2mm & Humidity > 80% |
| Rầy nâu (Brown Planthopper) | Temp > 28°C & Humidity 70–80% | Temp > 25°C & Humidity > 65% |
| Sâu cuốn lá (Leaf Folder) | Temp > 25°C & Humidity > 75% | Temp > 22°C & Humidity > 70% |
| Lem lép hạt (Grain Discoloration) | Temp > 25°C & Rain > 3mm | Temp > 22°C & Rain > 1mm |

Output luôn sorted: HIGH trước, MEDIUM sau.

---

### [NEW] `src/features/landing/components/WeatherDiseaseSection.jsx`

**State:**

| State | Type | Mô tả |
|---|---|---|
| `selectedProvince` | Object | Tỉnh đang chọn `{ name, lat, lon }` |
| `weather` | Object / null | `{ temperature, humidity, precipitation }` |
| `diseases` | Array | Kết quả từ rule engine |
| `isLocating` | boolean | Đang chạy geolocation |
| `isLoadingWeather` | boolean | Đang fetch Open-Meteo |
| `error` | string / null | Thông báo lỗi |

**UX Flow:**

```
Mount
  └→ load weather cho selectedProvince mặc định (An Giang)

User chọn dropdown
  └→ setSelectedProvince → fetch weather → update diseases

User click "Tự phát hiện"
  └→ navigator.geolocation
       ├─ [OK]  → Nominatim → match tỉnh → fetch weather
       └─ [DENY] → hiện toast lỗi, không crash
```

**Visual layout:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Bạn đang ở khu vực: [An Giang                               [▼]   │
├─────────────────────────────────────────────────────────────────────┤
│  Thời tiết hiện tại                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  🌡 32°C    │  │  💧 85%     │  │  🌧 3.2mm   │              │
│  │  Nhiệt độ   │  │  Độ ẩm      │  │  Lượng mưa  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│  Các bệnh có nguy cơ                                                │
│  ──────────────────────────── Đạo ôn                               │
│  ─────────────────────── Khô vằn                                   │
│  ──────────────────────────────── Rầy nâu                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Ghi chú từ sketch:**
- 1 card duy nhất, viền rõ ràng
- Row 1: label "Bạn đang ở khu vực" + dropdown icon góc phải
- Row 2: label "Thời tiết hiện tại" + 3 box ngang bằng nhau
- Row 3: label "Các bệnh có nguy cơ" + danh sách dạng line items
- Layout phẳng, không phân chia màu sắc phức tạp theo tab/header riêng

---

### [MODIFY] `src/pages/HomePage.jsx`

- Import `WeatherDiseaseSection` từ `../features/landing/components/WeatherDiseaseSection`
- Chèn `<WeatherDiseaseSection />` giữa line 128 và 130

---

## Open Questions

- [ ] **Q1**: Có lưu tỉnh đã chọn vào `localStorage` để nhớ lần sau không?-> có
- [ ] **Q2**: Có cần hiển thị icon trạng thái bầu trời (nắng/mây/mưa) không?-> có

---

## Test Plan

| Scenario | Expected |
|---|---|
| Mở trang lần đầu | Load weather An Giang, hiện danh sách bệnh |
| Đổi dropdown → Cần Thơ | Weather + bệnh cập nhật theo Cần Thơ |
| Click "Tự phát hiện" → cho phép | Detect đúng tỉnh, load weather |
| Click "Tự phát hiện" → từ chối | Toast lỗi rõ ràng, không crash |
| Open-Meteo API lỗi / timeout | Hiện error state, retry button |
| Không có bệnh nguy cơ | Badge xanh "Không có cảnh báo" |
| Mobile responsive | Layout stack vertical, readable |

```bash
# Build verify
docker compose build frontend
```
