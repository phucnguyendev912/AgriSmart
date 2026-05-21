# Add Third-party Service Lane To Diagnosis Sequence

## Phân loại
- Loại yêu cầu: THIẾT KẾ / UI tài liệu luồng
- Lý do: chỉnh sequence diagram dựa trên ảnh, cần rà codebase và cập nhật tài liệu nhiều thành phần.

## Mục tiêu
- Thêm một cột/lane `Third-party service` vào sơ đồ chẩn đoán bệnh.
- Làm rõ `DiagnosisPage` là React view, không phải backend controller.
- Đối chiếu luồng với codebase hiện tại trước khi sửa.

## File sẽ sửa
- `docs/AgriAI-sequence-diagrams.drawio`
- `docs/PLAN-sequence-diagrams.md`

## Thứ tự thực hiện
1. Rà `DiagnosisPage.jsx`, `DiagnoseController`, `DiagnoseService`, các service/port bên thứ ba.
2. Cập nhật diagram chẩn đoán bệnh với lane mới.
3. Cập nhật Mermaid/documentation để mô tả đúng lifeline.
4. Kiểm tra lại diff và nội dung sau khi sửa.

## Ghi chú xác minh từ codebase
- View: `agriai_frontend/src/pages/DiagnosisPage.jsx`.
- Controller: `DiagnoseController` nhận `POST /api/diagnosis`.
- Service chính: `DiagnoseService`.
- Third-party services: Cloudinary, Vision AI, OpenWeatherMap, Gemini, Nominatim.
