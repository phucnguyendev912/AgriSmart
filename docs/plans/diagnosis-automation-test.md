# Diagnosis Automation Test Plan

## Request

Viết automation test cho chức năng chẩn đoán bệnh, bao gồm:

- Frontend UI flow trên trang `/diagnosis`.
- API test cho endpoint `POST /api/diagnosis`.
- Backend test với external services được mock để không phụ thuộc Cloudinary, Vision AI, Weather API thật.

## Scope

### Frontend Playwright UI tests

File dự kiến tạo:

- `agriai_frontend/tests/diagnosis-ui.spec.js`

Case dự kiến:

1. Trang chẩn đoán hiển thị form upload, chọn cây trồng, nút chẩn đoán.
2. Không chọn ảnh thì hiển thị lỗi validation phía FE.
3. Không chọn loại cây thì hiển thị lỗi validation phía FE.
4. Chọn ảnh hợp lệ thì hiển thị preview/tên file.
5. Submit thành công với API được mock thì hiển thị kết quả chẩn đoán.
6. API trả lỗi 500 thì UI hiển thị thông báo lỗi phù hợp.

### API automation tests

File dự kiến tạo:

- `agriai_frontend/tests/diagnosis-api.spec.js`

Case dự kiến:

1. `POST /api/diagnosis` không có `image` trả lỗi validation.
2. `POST /api/diagnosis` không có `cropTypeId` trả lỗi validation.
3. `POST /api/diagnosis` với `cropTypeId` không tồn tại trả lỗi business/validation.
4. `POST /api/diagnosis` multipart hợp lệ trả response có các field chính khi backend test/mock profile sẵn sàng.

### Backend tests

File dự kiến tạo:

- `agriai_backend/agriai/src/test/java/com/phucnguyen/agriai/controller/DiagnoseControllerTest.java`
- Có thể thêm helper/test fixture nếu cần.

Case dự kiến:

1. Controller nhận multipart request hợp lệ và trả `200`.
2. Missing `image` trả `400`.
3. Missing `cropTypeId` trả `400`.
4. Service path thành công với mocked `ImageStoragePort`, `VisionDetectionPort`, `WeatherPort`, `GuidancePort`.
5. External service lỗi được map thành lỗi hệ thống, không leak stack trace.

## Mock Strategy

- FE UI test mock `/api/crop-types` và `/api/diagnosis` bằng Playwright route để ổn định.
- API test gọi backend thật ở `E2E_API_URL` mặc định `http://localhost:8080`.
- Backend test dùng mock bean cho các port external:
  - `ImageStoragePort`
  - `VisionDetectionPort`
  - `WeatherPort`
  - `GuidancePort`

## Execution Order

1. Đọc thêm selector trong component upload/result để viết locator ổn định.
2. Tạo fixture ảnh test nhỏ trong thư mục test nếu chưa có.
3. Viết FE UI Playwright test.
4. Viết API Playwright test.
5. Viết backend test với mocked external services.
6. Chạy `npx playwright test` cho các test mới.
7. Chạy Maven test liên quan đến diagnosis.

## Notes

- Không hardcode secret hoặc credential.
- Không gọi Cloudinary/Vision AI thật trong automation chính.
- Test thành công API thật chỉ chạy khi backend/mock profile hỗ trợ đủ external mock.
