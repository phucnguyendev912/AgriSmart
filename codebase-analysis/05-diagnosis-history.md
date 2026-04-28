# 5. Lịch sử chẩn đoán

## 1. Luồng chạy tổng quan

### Luồng list lịch sử

1. Frontend [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx) gọi `GET /api/diagnosis/history?page=&size=`.
2. Request vào [DiagnoseHistoryController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java).
3. Controller lấy email từ `Principal`.
4. Controller gọi [DiagnoseHistoryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java).
5. Service tìm userId theo email.
6. Query `DiagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc`.
7. Với mỗi history, service query `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse`.
8. Service build `DiagnoseHistoryResponse`.

### Luồng xem chi tiết
1. Frontend [DiagnosisHistoryDetailPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx) gọi `GET /api/diagnosis/{id}`.
2. Controller gọi `diagnoseHistoryService.getDetail(email, id)`.
3. Service kiểm tra ownership bằng `findByIdAndUserIdAndIsDeleteFalse`.
4. Service load toàn bộ `DiagnoseHistoryDetail`.
5. Service parse JSON snapshot trong `treatmentData`.
6. Service rebuild lại `DiagnoseResponse`.
7. Trả về frontend.

## 2. Vai trò từng file

- [DiagnoseHistoryController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java)
- [DiagnoseHistoryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java)
- [DiagnoseHistoryRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java)
- [DiagnoseHistoryDetailRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryDetailRepository.java)
- [DiagnoseHistoryResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseHistoryResponse.java)
- [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java)
- [DiagnosisDetailSnapshotDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiagnosisDetailSnapshotDTO.java)
- [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx)
- [DiagnosisHistoryDetailPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx)

## 3. Phân tích từng hàm

### `DiagnoseHistoryController.getHistory()`

- Trả page lịch sử chẩn đoán của user.
- Gọi đến: `diagnoseHistoryService.getHistory(email, pageable)`.

### `DiagnoseHistoryController.getDetail()`

- Trả detail một lần chẩn đoán.
- Gọi đến: `diagnoseHistoryService.getDetail(email, id)`.

### `DiagnoseHistoryService.getHistory()`

- Dựng danh sách summary cho page lịch sử.
- Logic:
  1. tìm `userId`
  2. query page `DiagnoseHistory`
  3. với từng history load detail và parse snapshot
  4. build `DiagnoseHistoryResponse`

### `DiagnoseHistoryService.getDetail()`

- Rebuild full detail response từ dữ liệu lưu DB.
- Logic:
  1. check email
  2. tìm `userId`
  3. query history theo `id + userId`
  4. load all details
  5. parse snapshot JSON
  6. deduplicate warnings/programs/alerts
  7. build `DiagnoseResponse`

### `DiagnoseHistoryService.parseSnapshot()`

- Parse JSON `treatmentData` thành `DiagnosisDetailSnapshotDTO`.

### `DiagnoseHistoryService.parseWeatherJson()`

- Parse `weatherData` JSON thành `WeatherDTO`.

## 4. API endpoint

- `GET /api/diagnosis/history`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseHistoryController.getHistory()`

- `GET /api/diagnosis/{id}`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseHistoryController.getDetail()`

## 5. DTO / Request / Response

### `DiagnoseHistoryResponse`

- File: [DiagnoseHistoryResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseHistoryResponse.java)
- Fields:
  - `id: Integer`
  - `createdAt: LocalDateTime`
  - `originalImageUrl: String`
  - `cropName: String`
  - `diseaseName: String`
  - `confidence: Double`
  - `severity: String`
  - `status: String`
  - `diagnosisType: String`
  - `latitude: Double`
  - `longitude: Double`

### `DiagnoseResponse`

- Reuse DTO của chức năng chẩn đoán cho page detail.

## 6. Tương tác với Database

Khi lấy list:

- `UserRepository.findByEmail(email)`
- `DiagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(userId, pageable)`
- `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse(historyId)`

Khi lấy detail:

- `DiagnoseHistoryRepository.findByIdAndUserIdAndIsDeleteFalse(id, userId)`
- `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse(id)`

Sort:

- `createdAt desc`

Map:

- row history + list detail + snapshot JSON -> DTO summary/detail

## 4. Hướng dẫn chỉnh sửa (Modification Guide)

**Khi cần thay đổi tính năng, bạn cần mở các file sau:**

1. **Bổ sung tính năng Lọc lịch sử (vd: Lọc theo thời gian):**
   - **Backend:** `DiagnoseHistoryRepository.java` (Thêm @Query), `DiagnoseHistoryController.java`, `DiagnoseHistoryService.java`.
   - **Frontend:** Bổ sung thanh Filter ở `DiagnosisHistoryPage.jsx`.
