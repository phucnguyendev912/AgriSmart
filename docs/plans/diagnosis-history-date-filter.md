# Diagnosis History Date Filter

## Summary

Kích hoạt bộ lọc ngày trên trang lịch sử chẩn đoán để lọc đúng trên toàn bộ dữ liệu lịch sử của user, không chỉ lọc các dòng đang hiển thị ở frontend.

## Files

- Sửa `agriai_frontend/src/pages/DiagnosisHistoryPage.jsx`
- Sửa `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java`
- Sửa `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java`
- Sửa `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java`

## Steps

1. Backend nhận query param `fromDate` và `toDate` dạng `yyyy-MM-dd`.
2. Service convert ngày sang khoảng `createdAt` inclusive start và exclusive end.
3. Repository lọc theo `userId`, `isDelete=false`, `createdAt`.
4. Frontend thêm state cho preset: hôm nay, 7 ngày qua, 30 ngày qua, tùy chỉnh.
5. Khi đổi filter thì reset về page 0 và gọi lại API.

## Acceptance Criteria

- Nút Hôm nay, 7 ngày qua, 30 ngày qua lọc được dữ liệu.
- Tùy chỉnh cho phép chọn ngày bắt đầu và ngày kết thúc.
- Pagination phản ánh đúng tổng bản ghi sau khi lọc.
- Không ảnh hưởng xem chi tiết lịch sử.
