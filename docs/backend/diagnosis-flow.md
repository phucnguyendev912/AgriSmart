# Luồng Chức Năng Chẩn Đoán Bệnh (Disease Diagnosis Flow)

> Tài liệu mô tả luồng xử lý đầy đủ của chức năng chẩn đoán bệnh cây trồng trong hệ thống AgriAI.

---

## 1. Tổng Quan

```
Client (multipart/form-data)
  │  image + cropTypeId + latitude? + longitude?
  ▼
DiagnoseController  [POST /api/diagnosis]
  │
  ▼
DiagnoseService
  ├─── DiagnosisValidationService   (validate input)
  ├─── ImageStoragePort             (upload ảnh)
  ├─── VisionDetectionPort          (AI nhận diện bệnh)   ┐ parallel
  ├─── WeatherPort                  (lấy thời tiết GPS)   ┘ CompletableFuture
  ├─── DiseaseMapper                (map label → Disease)
  ├─── RuleEngineService            (xử lý rule + treatment)
  ├─── DiagnoseResponseBuilder
        (build response)
  ├─── GuidancePort                 (AI tạo hướng dẫn)
  ├─── DiagnoseHistoryPersistenceService (lưu DB)
  └─── GeocodingService             (async, lưu location)
  │
  ▼
DiagnoseResponse (trả về client)
```

---

## 2. Luồng Chi Tiết

### Bước 1 — Validate Input (`DiagnosisValidationService`)

**File:** `DiagnosisValidationService.java`

```
Request đến
  │
  ├─ Kiểm tra image: null? empty? không phải image/*? → 400 BAD_REQUEST
  ├─ Kiểm tra cropTypeId: null? → 400 BAD_REQUEST
  ├─ Tìm CropType theo cropTypeId → 404 NOT_FOUND nếu không tồn tại
  ├─ Kiểm tra CropType: isDelete=true hoặc isActive=false → 400 BAD_REQUEST
  └─ Tìm User theo email (optional — guest được phép không có account)
  │
  ▼
DiagnosisContext { user, cropType }
```

---

### Bước 2 — Tạo DiagnoseHistory ban đầu

**Status:** `PENDING`

Lưu bản ghi lịch sử ngay lập tức để có `historyId` cho các bước sau. Nếu xảy ra lỗi ở bất kỳ bước nào, status sẽ được cập nhật thành `FAILED`.

---

### Bước 3 — Upload Ảnh (`ImageStoragePort`)

**Interface:** `ImageStoragePort.upload(MultipartFile)`

Upload ảnh lên cloud storage (Cloudinary hoặc tương đương), trả về `imageUrl` công khai.

---

### Bước 4 — Phân Tích Song Song (Parallel)

Hai tác vụ chạy song song bằng `CompletableFuture`:

```
CompletableFuture<List<VisionResultDTO>>  ←  VisionDetectionPort.detect(imageUrl)
CompletableFuture<WeatherDTO>             ←  WeatherPort.getCurrentWeather(lat, lon)
                                              (chỉ chạy nếu request.hasGps() == true)
```

**`VisionResultDTO`** chứa:
- `label` — tên nhãn bệnh (ví dụ: `blast`, `brown_spot`)
- `confidence` — độ tin cậy (0.0 → 1.0)
- `severity` — mức độ (optional)

---

### Bước 5 — Phân Tích Vision Results (`DiagnoseService.analyzeVisionResults`)

```
List<VisionResultDTO>
  │
  ├─ Kiểm tra nhãn "healthy" (HEALTHY_LABELS: healthy, khoe, cay_khoe, khoe_manh)
  ├─ Lọc bỏ nhãn healthy
  ├─ Lọc bỏ confidence < 0.4 (MIN_CONFIDENCE)
  ├─ Group by max confidence nếu cùng label (DiseaseMapper.groupByMaxConfidence)
  └─ Map label → Disease entity (DiseaseMapper.findDisease)
       └─ Tìm theo: diseaseCode → diseaseNameEn → diseaseName
       └─ Thử với: cleanLabel, underscoreLabel, spaceLabel
  │
  ▼
DiagnosisAnalysis {
  isHealthy:        boolean   — true nếu có nhãn healthy VÀ không phát hiện bệnh
  isUnknown:        boolean   — true nếu detectedDiseases rỗng
  detectedDiseases: List<DetectedDiseaseMatch>
}
```

---

### Bước 6 — Rule Engine (`RuleEngineService`)

> Bỏ qua bước này nếu `detectedDiseases` rỗng.

```
List<diseaseId>  +  WeatherDTO
  │
  ├─ TreatmentLookupService.findByDiseaseId()
  │   └─ Lấy tất cả TreatmentPlan theo diseaseId, sort: isRequired DESC
  │
  ├─ TreatmentSelector.selectPrimaryPlan()
  │   └─ Chọn 1 plan tốt nhất: isRequired → có ingredient → id nhỏ nhất
  │
  ├─ DrugInteractionChecker.buildInteractionWarnings()
  │   └─ Kiểm tra xung đột hoạt chất giữa các plan
  │
  ├─ WeatherAlertEvaluator.buildWeatherAlerts()
  │   └─ Đánh giá điều kiện thời tiết (nhiệt độ, độ ẩm, lượng mưa)
  │   └─ Trả về Map<planId, List<WeatherAlertDTO>>
  │
  └─ SprayProgramBuilder.buildPrograms()
      ├─ Group các plan tương thích vào cùng đợt phun
      ├─ Mỗi group → 1 TreatmentProgramDTO (SPRAY-1, SPRAY-2, ...)
      └─ Strategy: SINGLE_DISEASE_OR_SAFE_MIX | MIX_WITH_WARNING | SEPARATE_SPRAY
  │
  ▼
RuleEngineResult {
  treatments:          List<TreatmentDTO>
  sprayPrograms:       List<TreatmentProgramDTO>
  interactionWarnings: List<InteractionWarningDTO>
  weatherAlerts:       List<WeatherAlertDTO>
  strategy:            String
}
```

---

### Bước 7 — Build Response (`DiagnoseResponseBuilder`)

```
DiagnosisAnalysis + RuleEngineResult
  │
  ├─ diagnosisType: HEALTHY | UNKNOWN | DISEASE_DETECTED
  ├─ Map DetectedDiseaseMatch → DiseaseResultDTO
  │   └─ resolveSeverity: confidence > 0.75 → NANG | > 0.60 → TRUNG_BINH | else → NHE
  └─ Gộp tất cả vào DiagnoseResponse
  │
  ▼
DiagnoseResponse (chưa có userGuidance)
```

---

### Bước 8 — Tạo Hướng Dẫn AI (`GuidancePort`)

```
DiagnoseResponse → GuidancePort.generateGuidance()
  │               (Gemini AI hoặc tương đương)
  ▼
userGuidance: String (gợi ý canh tác, phòng trị bệnh)
```

---

### Bước 9 — Lưu Kết Quả (`DiagnoseHistoryPersistenceService`)

```
updateHistory(history, imageUrl, weather, COMPLETED)
  └─ Cập nhật: originalImageUrl, weatherData (JSON), status

saveDetails(history, response, analysis)
  ├─ Nếu không phát hiện bệnh → 1 DiagnoseHistoryDetail (no disease)
  └─ Nếu có bệnh → N DiagnoseHistoryDetail (1 per disease)
      └─ Mỗi detail: disease, confidenceScore, severity, treatmentData (JSON snapshot), cultivationData
```

---

### Bước 10 — Geocoding (Async, Fire-and-Forget)

```
Nếu request.hasGps() == true:
  CompletableFuture.runAsync(() → GeocodingService.processGeocoding(user, lat, lon))
  └─ Lỗi chỉ log, không ảnh hưởng response
```

---

### Bước 11 — Trả về Client

```
DiagnoseResponse {
  id:                  Integer         — historyId
  originalImageUrl:    String
  weather:             WeatherDTO
  gpsUsed:             boolean
  isHealthy:           boolean
  diagnosisType:       HEALTHY | UNKNOWN | DISEASE_DETECTED
  diseases:            List<DiseaseResultDTO>
  treatments:          List<TreatmentDTO>
  sprayPrograms:       List<TreatmentProgramDTO>
  interactionWarnings: List<InteractionWarningDTO>
  weatherAlerts:       List<WeatherAlertDTO>
  warnings:            List<String>
  userGuidance:        String
}
```

---

## 3. Xử Lý Lỗi

| Điểm xảy ra lỗi | Hành động |
|---|---|
| Validate input | Ném `AppException` (400/404), không lưu history |
| Upload ảnh, Vision, Weather | Bắt `Exception`, set history status = `FAILED`, ném `AppException(500)` |
| Geocoding | Chỉ log lỗi, không ảnh hưởng response |
| `@Transactional(noRollbackFor = AppException.class)` | Đảm bảo history FAILED được commit dù có lỗi |

---

## 4. Sơ Đồ Phụ Thuộc Service

```
DiagnoseController
  └── DiagnoseService
        ├── DiagnosisValidationService
        │     ├── UserRepository
        │     └── CropTypeRepository
        ├── ImageStoragePort  (adapter: CloudinaryAdapter)
        ├── VisionDetectionPort  (adapter: GeminiVisionAdapter)
        ├── WeatherPort  (adapter: OpenWeatherAdapter)
        ├── DiseaseMapper
        │     └── DiseaseRepository
        ├── RuleEngineService
        │     ├── TreatmentLookupService → TreatmentPlanRepository
        │     ├── TreatmentSelector
        │     ├── DrugInteractionChecker
        │     ├── WeatherAlertEvaluator → TreatmentWeatherConditionRepository
        │     └── SprayProgramBuilder
        │           └── DrugInteractionChecker
        ├── DiagnoseResponseBuilder
        ├── GuidancePort  (adapter: GeminiGuidanceAdapter)
        ├── DiagnoseHistoryPersistenceService
        │     ├── DiagnoseHistoryRepository
        │     ├── DiagnoseHistoryDetailRepository
        │     └── DiagnoseResponseBuilder
        └── GeocodingService  (async)
              └── NominatimPort
```

---

## 5. Điều Kiện Đặc Biệt

| Trường hợp | Kết quả |
|---|---|
| Không có GPS | `weather = null`, bỏ qua WeatherAlertEvaluator, `gpsUsed = false` |
| Ảnh cây khỏe | `diagnosisType = HEALTHY`, `isHealthy = true`, không chạy RuleEngine |
| Không nhận diện được bệnh | `diagnosisType = UNKNOWN`, `isUnknown = true`, không chạy RuleEngine |
| User không đăng nhập (guest) | `user = null`, vẫn lưu history (không gắn user) |
| Confidence < 0.4 | Label bị lọc bỏ, không coi là bệnh |
| Nhiều bệnh cùng lúc | Mỗi bệnh có TreatmentPlan riêng, SprayProgramBuilder group tối ưu |
