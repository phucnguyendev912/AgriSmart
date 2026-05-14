# Fix Diagnosis History Detail Display

## Summary

Sửa trang `/history/:id` để hiển thị đúng và nhất quán với kết quả vừa chẩn đoán ở `/diagnosis`.
Trọng tâm là `DiagnosisHistoryDetailPage.jsx`, không đổi backend vì API chi tiết đã trả dữ liệu đúng.

## Files

- Sửa `agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx`
- Dùng lại component trong `agriai_frontend/src/features/diagnosis/components/`
- Dùng lại helper trong `agriai_frontend/src/features/diagnosis/utils/diagnosisDisplay.js`

## Steps

1. Tạo task file trước khi sửa code.
2. Refactor trang chi tiết lịch sử để tái sử dụng các panel kết quả chẩn đoán chung.
3. Giữ layout ảnh gốc và nút quay lại lịch sử.
4. Sửa trạng thái auth để không báo sai "không tìm thấy dữ liệu" khi session hết hạn.
5. Chạy test frontend liên quan.

## Acceptance Criteria

- `/history/:id` hiển thị cùng logic với `/diagnosis`.
- Bản ghi có `sprayPrograms` hiển thị phác đồ qua `DiagnoseSprayProgramsPanel`.
- Bản ghi chỉ có `treatments` vẫn có fallback phác đồ.
- Session hết hạn hiển thị thông báo đăng nhập lại.
- Không sửa backend.
