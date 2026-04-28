# 4. Chẩn đoán AI bệnh cây

## 1. Luồng chạy tổng quan

1. Frontend [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx) gửi `POST /api/diagnosis` với `multipart/form-data`.
2. Request vào [DiagnoseController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java).
3. Controller lấy `Principal` nếu có rồi gọi [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java).
4. `DiagnoseService` gọi [DiagnosisValidationService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java).
5. Tạo `DiagnoseHistory` trạng thái `PENDING`.
6. Upload ảnh qua [DiagnosisAttachmentService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAttachmentService.java) -> [CloudinaryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CloudinaryService.java).
7. Chạy song song:
   - [VisionAIService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java)
   - [WeatherApiService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherApiService.java)
8. Phân tích vision result trong `analyzeVisionResults()`.
9. Nếu có bệnh thì chạy [RuleEngineService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java).
10. [DiagnoseResponseBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java) dựng `DiagnoseResponse`.
11. [LLMService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/LLMService.java) sinh `userGuidance`.
12. [DiagnoseHistoryPersistenceService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java) lưu snapshot vào DB.
13. Nếu có GPS thì chạy nền [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java).
14. Trả `DiagnoseResponse` về frontend.

Lý do thiết kế:

- Chẩn đoán là luồng nhiều bước, nên tách thành các service nhỏ.
- Tích hợp ngoài được đi qua `Port` để dễ thay thế.
- Snapshot kết quả được lưu riêng để xem lại lịch sử chính xác.

## 2. Vai trò từng file

### Controller / DTO chính

- [DiagnoseController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java)
- [DiagnoseRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseRequest.java)
- [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java)

### Điều phối / validate / response build

- [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java)
- [DiagnosisValidationService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java)
- [DiagnoseResponseBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java)
- [DiagnosisAnalysis.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAnalysis.java)
- [DetectedDiseaseMatch.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DetectedDiseaseMatch.java)

### Upload ảnh

- [DiagnosisAttachmentService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAttachmentService.java)
- [CloudinaryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CloudinaryService.java)
- [CloudinaryConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/config/CloudinaryConfig.java)
- [ImageStoragePort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/ImageStoragePort.java)

### Vision AI / Weather / Guidance

- [VisionAIService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java)
- [VisionDetectionPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/VisionDetectionPort.java)
- [WeatherApiService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherApiService.java)
- [WeatherPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/WeatherPort.java)
- [LLMService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/LLMService.java)
- [GuidancePort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/GuidancePort.java)

### Map bệnh / rule engine

- [DiseaseMapper.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapper.java)
- [RuleEngineService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java)
- [TreatmentSelector.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentSelector.java)
- [DrugInteractionChecker.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DrugInteractionChecker.java)
- [WeatherAlertEvaluator.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherAlertEvaluator.java)
- [SprayProgramBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/SprayProgramBuilder.java)

### Persistence lịch sử

- [DiagnoseHistoryPersistenceService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java)
- [DiagnosisDetailSnapshotDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiagnosisDetailSnapshotDTO.java)

### DTO con

- [VisionResultDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/VisionResultDTO.java)
- [DiseaseResultDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiseaseResultDTO.java)
- [TreatmentDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentDTO.java)
- [TreatmentProgramDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentProgramDTO.java)
- [InteractionWarningDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/InteractionWarningDTO.java)
- [WeatherDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherDTO.java)
- [WeatherAlertDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherAlertDTO.java)

### Entity / Repository liên quan

- [DiagnoseHistory.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistory.java)
- [DiagnoseHistoryDetail.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistoryDetail.java)
- [Disease.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Disease.java)
- [TreatmentPlan.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentPlan.java)
- [TreatmentWeatherCondition.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentWeatherCondition.java)
- [DrugInteraction.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DrugInteraction.java)
- [Ingredient.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Ingredient.java)
- [AIModel.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AIModel.java)
- [Attachment.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Attachment.java)
- [DiagnoseHistoryRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java)
- [DiagnoseHistoryDetailRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryDetailRepository.java)
- [DiseaseRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseRepository.java)
- [TreatmentPlanRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentPlanRepository.java)
- [TreatmentWeatherConditionRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentWeatherConditionRepository.java)
- [DrugInteractionRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DrugInteractionRepository.java)
- [AIModelRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AIModelRepository.java)
- [AttachmentRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AttachmentRepository.java)

### Frontend hiển thị

- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- [DiagnoseUploadPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseUploadPanel.jsx)
- [DiagnoseWeatherCards.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseWeatherCards.jsx)
- [DiagnoseResultPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseResultPanel.jsx)
- [DiagnoseSprayProgramsPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseSprayProgramsPanel.jsx)
- [DiagnoseInteractionWarnings.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseInteractionWarnings.jsx)
- [DiagnoseWeatherAlertsPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseWeatherAlertsPanel.jsx)
- [DiagnoseCultivationMeasures.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseCultivationMeasures.jsx)
- [DiagnoseAIGuidance.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseAIGuidance.jsx)

## 3. Phân tích từng hàm

### `DiagnoseController.diagnose()`

- Nhận multipart request chẩn đoán.
- Gọi đến: `diagnoseService.diagnose(email, request)`.
- Dùng `@ModelAttribute` vì request là `multipart/form-data`.

### `DiagnoseService.diagnose()`

- Điều phối toàn bộ luồng chẩn đoán.
- Gọi đến validation, upload ảnh, vision AI, weather API, rule engine, response builder, LLM, persistence, geocoding nền.

### `DiagnoseService.analyzeVisionResults()`

- Chuẩn hóa detection thành `DiagnosisAnalysis`.
- Lọc healthy label, confidence thấp, group nhãn trùng và map sang disease DB.

### `DiagnoseService.toDetectedDiseaseMatch()`

- Map 1 `VisionResultDTO` sang `Disease`.

### `DiagnosisValidationService.validate()`

- Validate ảnh, crop type, AI model, user.
- Trả `DiagnosisContext`.

### `DiagnosisValidationService.validateImage()`

- Check file upload có tồn tại và đúng kiểu ảnh.

### `DiagnosisAttachmentService.uploadAndSave()`

- Upload file lên cloud rồi lưu metadata attachment.

### `CloudinaryService.upload()`

- Upload bytes ảnh lên Cloudinary và trả URL.

### `VisionAIService.detect()`

- Tải ảnh từ Cloudinary URL, gửi sang YOLO FastAPI, parse danh sách detection.

### `WeatherApiService.getCurrentWeather()`

- Gọi OpenWeatherMap bằng lat/lon.

### `DiseaseMapper.findDisease()`

- Map label AI sang disease DB bằng 3 mức fallback:
  - `diseaseCode`
  - `diseaseNameEn`
  - `diseaseName`

### `DiseaseMapper.groupByMaxConfidence()`

- Nếu nhiều detection cùng label thì giữ detection confidence cao nhất.

### `RuleEngineService.process()`

- Điều phối rule engine:
  1. load treatment plan
  2. chọn plan chính
  3. build interaction warning
  4. build weather alert
  5. build spray program
  6. derive strategy

### `TreatmentSelector.selectPrimaryPlan()`

- Chọn plan tốt nhất theo ưu tiên:
  1. `isRequired=true`
  2. có ingredient
  3. `id` nhỏ hơn

### `DrugInteractionChecker.buildInteractionWarnings()`

- Tìm xung đột hoạt chất giữa các plan đã chọn.

### `DrugInteractionChecker.canBeGrouped()`

- Kiểm tra plan ứng viên có thể ở cùng group phun với group hiện tại không.

### `WeatherAlertEvaluator.buildWeatherAlerts()`

- So thời tiết thực tế với điều kiện phun của từng treatment plan.

### `SprayProgramBuilder.buildPrograms()`

- Nhóm plan thành các đợt phun và build `TreatmentProgramDTO`.

### `SprayProgramBuilder.deriveStrategy()`

- Chốt strategy tổng thể.

### `DiagnoseResponseBuilder.buildResponse()`

- Dựng `DiagnoseResponse` cuối cùng.

### `DiagnoseResponseBuilder.toDiseaseResult()`

- Map `DetectedDiseaseMatch` sang `DiseaseResultDTO`.

### `LLMService.generateGuidance()`

- Tạo hướng dẫn canh tác bằng Gemini hoặc fallback.

### `LLMService.buildPrompt()`

- Ghép prompt từ diseases, treatments, interaction, weather.

### `DiagnoseHistoryPersistenceService.updateHistory()`

- Cập nhật `DiagnoseHistory` sau khi chẩn đoán xong.

### `DiagnoseHistoryPersistenceService.saveDetails()`

- Lưu snapshot chi tiết kết quả vào `DiagnoseHistoryDetail`.

## 4. API endpoint

- `POST /api/diagnosis`
  - Method: POST
  - Content-Type: `multipart/form-data`
  - Middleware/guard:
    - CORS
    - `JwtAuthenticationFilter`
    - endpoint này `permitAll`
  - Hàm xử lý: `DiagnoseController.diagnose()`
  - Vì sao dùng POST:
    - có upload file
    - có side effect lưu lịch sử, attachment
    - gọi AI và dịch vụ ngoài

## 5. DTO / Request / Response

### `DiagnoseRequest`

- File: [DiagnoseRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseRequest.java)
- Fields:
  - `image: MultipartFile`
  - `cropTypeId: Integer`
  - `latitude: Double`
  - `longitude: Double`

### `DiagnoseResponse`

- File: [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java)
- Fields:
  - `id: Integer`
  - `originalImageUrl: String`
  - `annotatedImageUrl: String`
  - `weather: WeatherDTO`
  - `diseases: List<DiseaseResultDTO>`
  - `warnings: List<String>`
  - `treatments: List<TreatmentDTO>`
  - `sprayPrograms: List<TreatmentProgramDTO>`
  - `interactionWarnings: List<InteractionWarningDTO>`
  - `weatherAlerts: List<WeatherAlertDTO>`
  - `userGuidance: String`
  - `isHealthy: Boolean`
  - `gpsUsed: Boolean`
  - `diagnosisType: String`

### DTO con

- `VisionResultDTO(label, confidence, severity)`
- `DiseaseResultDTO(...)`
- `TreatmentDTO(...)`
- `TreatmentProgramDTO(...)`
- `InteractionWarningDTO(...)`
- `WeatherDTO(temperature, humidity, rainfall)`
- `WeatherAlertDTO(...)`
- `DiagnosisDetailSnapshotDTO(...)`

## 6. Tương tác với Database

Khi lưu:

1. `DiagnoseHistory`
2. `Attachment`
3. `DiagnoseHistoryDetail`
4. Có thể phát sinh `AreaInfor` từ geocoding nền

Khi lấy dữ liệu để chẩn đoán:
- `CropTypeRepository.findById`
- `AIModelRepository.findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse`
- fallback `AIModelRepository.findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc`
- `DiseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse`
- `DiseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse`
- `DiseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse`
- `TreatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse`
- `TreatmentWeatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse`
- `DrugInteractionRepository.findInteractionsBetweenIngredients`

Lưu ý:

- `annotatedImageUrl` có trong DTO nhưng hiện chưa được set.

## 7. Hướng dẫn chỉnh sửa (Modification Guide)

**Khi cần thay đổi tính năng, bạn cần mở các file sau:**

1. **AI không nhận diện được bệnh mới / Cần đổi model YOLO mới:**
   - **DB:** Cập nhật DB bảng `AIModel` hoặc `Disease`.
   - **Backend:** Sửa `DiseaseMapper.java` để map kết quả AI với DB. Sửa `VisionAIService.java` nếu đổi API.

2. **Thay đổi/Bổ sung Luật chẩn đoán (vd: Hạn chế thuốc khi trời mưa):**
   - **Rule Engine:** `WeatherAlertEvaluator.java`, `TreatmentSelector.java`, `RuleEngineService.java`.
   - **DB:** Cấu hình chuẩn trong bảng `TreatmentWeatherCondition`.

3. **Thay đổi câu trả lời của Trợ lý AI (Guidance):**
   - **Prompt:** `LLMService.java` (Sửa hàm `buildPrompt()`).
   
4. **Hiển thị thêm thông số thời tiết:**
   - **Backend:** `WeatherApiService.java` (Đọc thêm data), `WeatherDTO.java`.
   - **Frontend:** Thêm vào Card ở `DiagnoseWeatherCards.jsx`.
