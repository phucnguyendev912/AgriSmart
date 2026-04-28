# 6. Đánh giá kết quả chẩn đoán

## 1. Luồng chạy tổng quan

1. Frontend [DiagnosisRatingModal.jsx](/D:/AgriAI/agriai_frontend/src/components/DiagnosisRatingModal.jsx) gửi `POST /api/reviews`.
2. Request vào [DiagnoseReviewController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseReviewController.java).
3. Controller lấy email từ `Principal`.
4. Gọi [DiagnoseReviewService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java).
5. Service check login, ownership, check đã review chưa, rồi lưu `DiagnoseReview`.
6. Trả `DiagnoseReviewResponse`.

Luồng đọc review:

1. Frontend có thể gọi `GET /api/reviews/{historyId}`.
2. Controller gọi `getByHistoryId`.
3. Repository `findByHistoryId`.
4. Trả `DiagnoseReviewResponse` hoặc 404.

## 2. Vai trò từng file

- [DiagnoseReviewController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseReviewController.java)
- [DiagnoseReviewService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java)
- [DiagnoseReviewRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseReviewRequest.java)
- [DiagnoseReviewResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseReviewResponse.java)
- [DiagnoseReview.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseReview.java)
- [DiagnoseReviewRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseReviewRepository.java)
- [DiagnosisRatingModal.jsx](/D:/AgriAI/agriai_frontend/src/components/DiagnosisRatingModal.jsx)
- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx)

## 3. Phân tích từng hàm

### `DiagnoseReviewController.submitReview()`

- Nhận review mới.
- Gọi đến: `reviewService.submitReview(email, request)`.

### `DiagnoseReviewController.getReview()`

- Lấy review theo historyId.
- Gọi đến: `reviewService.getByHistoryId(historyId)`.

### `DiagnoseReviewService.submitReview()`

- Lưu đánh giá.
- Logic:
  1. check login
  2. load history
  3. check ownership
  4. check `existsByHistoryId`
  5. load user
  6. save review
  7. map response

### `DiagnoseReviewService.getByHistoryId()`

- Query review của một lần chẩn đoán.

### `DiagnoseReviewService.toResponse()`

- Map entity sang DTO.

## 4. API endpoint

- `POST /api/reviews`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseReviewController.submitReview()`
  - Vì sao dùng POST: tạo review mới.

- `GET /api/reviews/{historyId}`
  - Middleware/guard: nằm sau security
  - Hàm xử lý: `DiagnoseReviewController.getReview()`
  - Vì sao dùng GET: truy vấn trạng thái review.

## 5. DTO / Request / Response

### `DiagnoseReviewRequest`

- File: [DiagnoseReviewRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseReviewRequest.java)
- Fields:
  - `historyId: Integer`
  - `isAccurate: Boolean`
  - `rating: Integer`
  - `feedback: String`

### `DiagnoseReviewResponse`

- File: [DiagnoseReviewResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseReviewResponse.java)
- Fields:
  - `id: Integer`
  - `historyId: Integer`
  - `isAccurate: Boolean`
  - `rating: Integer`
  - `feedback: String`
  - `createdAt: LocalDateTime`

## 6. Tương tác với Database

Khi lưu:

- Bảng: `DiagnoseReview`
- Field:
  - `historyId`
  - `userId`
  - `isAccurate`
  - `rating`
  - `feedback`

Khi lấy ra:

- `historyRepository.findById(historyId)`
- `reviewRepository.existsByHistoryId(historyId)`
- `reviewRepository.findByHistoryId(historyId)`
- `userRepository.findByEmail(email)`

Ràng buộc:

- `historyId` là `unique=true`, mỗi history tối đa 1 review.

## 5. Hướng dẫn chỉnh sửa (Modification Guide)

**Khi cần thay đổi tính năng, bạn cần mở các file sau:**

1. **Cho phép Upload Ảnh đính kèm khi review (Minh chứng do chẩn đoán sai):**
   - **Entity:** Thêm `imageUrl` vào `DiagnoseReview.java`.
   - **Service:** Inject `CloudinaryService` vào `DiagnoseReviewService.java`.
   - **Controller:** Đổi `@RequestBody` sang xử lý Multipart file ở `DiagnoseReviewController.java`.
   - **Frontend:** Thêm ô upload ảnh ở modal `DiagnosisRatingModal`.
