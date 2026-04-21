# 2. Danh mục loại cây trồng

## 1. Luồng chạy tổng quan

1. Frontend [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx) gọi `GET /api/crop-types`.
2. Request vào [CropTypeController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/CropTypeController.java).
3. Controller gọi [CropTypeService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CropTypeService.java).
4. Service gọi `CropTypeRepository`.
5. Repository query bảng `CropType`.
6. Service map entity sang `CropTypeResponse` rồi trả về.

Lý do tách tầng:

- Controller chỉ làm nhiệm vụ nhận/trả HTTP.
- Service chịu trách nhiệm lọc dữ liệu active.
- Repository tập trung phần truy vấn.

## 2. Vai trò từng file

- [CropTypeController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/CropTypeController.java)
- [CropTypeService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CropTypeService.java)
- [CropTypeRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/CropTypeRepository.java)
- [CropType.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/CropType.java)
- [CropTypeResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/CropTypeResponse.java)
- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)

Thứ tự nên làm:

1. `CropType`
2. `CropTypeRepository`
3. `CropTypeResponse`
4. `CropTypeService`
5. `CropTypeController`
6. frontend gọi API

## 3. Phân tích từng hàm

### `CropTypeController.getAvailableCropTypes()`

- Trả danh sách crop type đang hoạt động.
- Gọi đến: `cropTypeService.getAvailableCropTypes()`

### `CropTypeService.getAvailableCropTypes()`

- Lấy cây trồng `isActive=true` và `isDelete=false`.
- Gọi đến: `cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse()`.
- Logic: query -> stream -> `toResponse()`.

### `CropTypeService.toResponse()`

- Map entity sang DTO.

## 4. API endpoint

- `GET /api/crop-types`
  - Middleware/guard: đi qua filter chung nhưng `permitAll`.
  - Hàm xử lý: `CropTypeController.getAvailableCropTypes()`
  - Vì sao dùng GET: chỉ đọc dữ liệu.

## 5. DTO / Request / Response

### `CropTypeResponse`

- File: [CropTypeResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/CropTypeResponse.java)
- Fields:
  - `id: Integer`
  - `cropName: String`
  - `description: String`

## 6. Tương tác với Database

Khi lấy ra:

- Bảng: `CropType`
- Query: `findByIsActiveTrueAndIsDeleteFalse()`
- Filter:
  - `isActive = true`
  - `isDelete = false`

Map:

- `CropType` -> `CropTypeResponse`

JOIN:

- Không có JOIN trong chức năng này.
