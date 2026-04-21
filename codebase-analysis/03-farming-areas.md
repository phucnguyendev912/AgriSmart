# 3. Quản lý khu vực canh tác + gợi ý xác nhận GPS

## 1. Luồng chạy tổng quan

### Luồng tạo thủ công

1. Frontend [AddFarmingAreaModal.jsx](/D:/AgriAI/agriai_frontend/src/components/AddFarmingAreaModal.jsx) gửi `POST /api/areas`.
2. Request đi qua security, phải có JWT hợp lệ.
3. [AreaInforController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AreaInforController.java) lấy `Principal`.
4. Controller gọi [AreaInforService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AreaInforService.java).
5. Service tìm user theo email.
6. Service tạo `AreaInfor` và lưu qua `AreaInforRepository`.
7. Response trả về `AreaInforResponse`.

### Luồng lấy danh sách

1. Frontend [FarmingAreaPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx) gọi `GET /api/areas`.
2. Controller lấy email từ `Principal`.
3. Service tìm user, rồi query `AreaInforRepository.findByUserIdAndIsDeleteFalse`.
4. Map sang list `AreaInforResponse`.

### Luồng confirm gợi ý GPS

1. Sau một lần chẩn đoán có GPS, [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java) chạy nền `GeocodingService.processGeocoding(...)`.
2. [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java) gọi `NominatimPort`.
3. [NominatimAdapter.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java) gọi API Nominatim reverse geocode.
4. Nếu địa chỉ chưa tồn tại thì lưu `AreaInfor` mới với `confirmed=false`.
5. Service đẩy WebSocket message về user qua `/user/queue/location-confirm`.
6. Frontend [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx) nhận message và hiện toast.
7. User vào trang khu vực canh tác để confirm qua `PUT /api/areas/{id}/confirm`.

## 2. Vai trò từng file

- [AreaInforController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AreaInforController.java)
- [AreaInforService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AreaInforService.java)
- [AreaInforRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AreaInforRepository.java)
- [AreaInfor.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AreaInfor.java)
- [AreaInforRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforRequest.java)
- [AreaInforConfirmRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforConfirmRequest.java)
- [AreaInforResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/AreaInforResponse.java)
- [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java)
- [NominatimAdapter.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java)
- [NominatimPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/NominatimPort.java)
- [NominatimResult.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/NominatimResult.java)
- [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- [FarmingAreaPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx)
- [AddFarmingAreaModal.jsx](/D:/AgriAI/agriai_frontend/src/components/AddFarmingAreaModal.jsx)
- [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx)

## 3. Phân tích từng hàm

### `AreaInforController.create()`

- Tạo khu vực canh tác thủ công.
- Gọi đến: `areaInforService.create(principal.getName(), request)`.

### `AreaInforController.getByUser()`

- Lấy danh sách khu vực của user hiện tại.
- Gọi đến: `areaInforService.getByUser(principal.getName())`.

### `AreaInforController.confirm()`

- Xác nhận khu vực được hệ thống gợi ý.
- Gọi đến: `areaInforService.confirm(...)`.

### `AreaInforService.create()`

- Tìm user, tạo entity `AreaInfor`, lưu DB.
- Gọi đến: `userRepository.findByEmail`, `areaInforRepository.save`.

### `AreaInforService.getByUser()`

- Lấy list khu vực theo user.
- Gọi đến: `findByUserIdAndIsDeleteFalse`.

### `AreaInforService.confirm()`

- Confirm khu vực gợi ý.
- Logic:
  1. tìm `AreaInfor` theo id
  2. kiểm tra chủ sở hữu
  3. set `confirmed=true`
  4. có thể update address
  5. save lại

### `GeocodingService.processGeocoding()`

- Reverse geocode từ lat/lon sau chẩn đoán.
- Gọi đến: `nominatimPort.reverseGeocode`, `areaInforRepository.existsByUserIdAndAddress`, `areaInforRepository.save`, `simpMessagingTemplate.convertAndSendToUser`.

### `NominatimAdapter.reverseGeocode()`

- Gọi API OpenStreetMap Nominatim và parse `NominatimResult`.

## 4. API endpoint

- `POST /api/areas`
  - Middleware/guard: authenticated
  - Hàm xử lý: `AreaInforController.create()`
  - Vì sao dùng POST: tạo mới dữ liệu.

- `GET /api/areas`
  - Middleware/guard: authenticated
  - Hàm xử lý: `AreaInforController.getByUser()`
  - Vì sao dùng GET: chỉ đọc dữ liệu.

- `PUT /api/areas/{id}/confirm`
  - Middleware/guard: authenticated
  - Hàm xử lý: `AreaInforController.confirm()`
  - Vì sao dùng PUT: update trạng thái xác nhận.

- WebSocket `/ws`
  - Dùng cho STOMP/SockJS realtime notification

## 5. DTO / Request / Response

### `AreaInforRequest`

- File: [AreaInforRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforRequest.java)
- Fields:
  - `areaName: String`
  - `province: String`
  - `address: String`
  - `area: Double`
  - `description: String`

### `AreaInforConfirmRequest`

- File: [AreaInforConfirmRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforConfirmRequest.java)
- Fields:
  - `address: String`

### `AreaInforResponse`

- File: [AreaInforResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/AreaInforResponse.java)
- Fields:
  - `id: Integer`
  - `areaName: String`
  - `province: String`
  - `address: String`
  - `area: Double`
  - `description: String`

### `LocationConfirmPayload`

- File: [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- Fields:
  - `areaId: Integer`
  - `displayName: String`
  - `message: String`
  - `redirectPath: String`

## 6. Tương tác với Database

Khi lưu thủ công:

- Bảng: `AreaInfor`
- Field:
  - `userId`
  - `areaName`
  - `province`
  - `address`
  - `area`
  - `description`

Khi lưu tự động qua geocoding:

- Bảng: `AreaInfor`
- Field:
  - `userId`
  - `areaName = "Khu vực canh tác mới"`
  - `latitude`, `longitude`
  - `address`
  - `province`
  - `confirmed = false`

Khi lấy ra:

- Query: `findByUserIdAndIsDeleteFalse(userId)`

Chống trùng:

- `existsByUserIdAndAddress(userId, address)`

Lưu ý:

- Frontend hiện gửi `areaSize`, nhưng backend DTO đang nhận `area`.
- UI hiển thị `areaCode` nhưng response backend không trả field này.
