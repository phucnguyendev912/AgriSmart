# 7. Bản đồ dịch bệnh

## 1. Luồng chạy tổng quan

1. Frontend [DiseaseMapPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx) gọi `GET /api/map/markers?days=&diseaseId=`.
2. Request vào [DiseaseMapController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiseaseMapController.java).
3. Controller gọi [DiseaseMapService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapService.java).
4. Service tính mốc thời gian `since = now - days`.
5. Service gọi [DiseaseMapRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseMapRepository.java).
6. Repository join `DiagnoseHistory`, `DiagnoseHistoryDetail`, `Disease`, `AreaInfor`.
7. Query trả projection `MapMarkerResponse`.
8. Frontend render marker lên Leaflet map.

## 2. Vai trò từng file

- [DiseaseMapController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiseaseMapController.java)
- [DiseaseMapService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapService.java)
- [DiseaseMapRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseMapRepository.java)
- [MapMarkerResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/MapMarkerResponse.java)
- [DiseaseMapPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx)
- Entity dùng gián tiếp:
  - `DiagnoseHistory`
  - `DiagnoseHistoryDetail`
  - `Disease`
  - `AreaInfor`

## 3. Phân tích từng hàm

### `DiseaseMapController.getMarkers()`

- Nhận filter `days`, `diseaseId` và trả danh sách marker.
- Gọi đến: `diseaseMapService.getMarkers(days, diseaseId)`.

### `DiseaseMapService.getMarkers()`

- Tính `since` rồi đẩy filter xuống repository.

### `DiseaseMapRepository.findMarkers()`

- Query marker cho bản đồ.
- Logic:
  1. select trực tiếp `new MapMarkerResponse(...)`
  2. join `DiagnoseHistory h`
  3. join `DiagnoseHistoryDetail det`
  4. join `det.disease d`
  5. left join `h.areaInfor ai`
  6. lọc lat/lon khác null
  7. lọc theo thời gian và diseaseId
  8. sort `createdAt desc`

## 4. API endpoint

- `GET /api/map/markers`
  - Query params:
    - `days: int` mặc định `30`
    - `diseaseId: Integer` optional
  - Middleware/guard: permitAll
  - Hàm xử lý: `DiseaseMapController.getMarkers()`
  - Vì sao dùng GET: đọc dữ liệu map với filter.

## 5. DTO / Request / Response

### `MapMarkerResponse`

- File: [MapMarkerResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/MapMarkerResponse.java)
- Fields:
  - `detailId: Integer`
  - `historyId: Integer`
  - `latitude: Double`
  - `longitude: Double`
  - `diseaseId: Integer`
  - `diseaseName: String`
  - `diagnosedAt: LocalDateTime`
  - `province: String`

## 6. Tương tác với Database

Query chính:

- Từ `DiagnoseHistory`
- Join `DiagnoseHistoryDetail`
- Join `Disease`
- Left join `AreaInfor`

Filter:

- `h.latitude IS NOT NULL`
- `h.longitude IS NOT NULL`
- `h.createdAt >= :since`
- `(:diseaseId IS NULL OR d.id = :diseaseId)`
- `h.isDelete = false` hoặc null

Sort:

- `ORDER BY h.createdAt DESC`

Lưu ý:

- `DiagnoseHistory.areaInfor` hiện chưa được gán đầy đủ ở flow chẩn đoán, nên `province` có thể thường là `null`.
