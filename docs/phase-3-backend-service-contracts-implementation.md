# Triển khai Phase 3 Backend Service Contracts

## Mô tả yêu cầu
Đồng bộ backend và frontend cho chức năng chẩn đoán để phác đồ hiển thị đúng sau khi chuyển sang contract Phase 3.

## Phạm vi
- Backend tiếp tục trả `treatments` là danh sách phác đồ đã được xếp hạng.
- Backend giữ `sprayPrograms` và `weatherAlerts` rỗng theo thiết kế Phase 3.
- Frontend hiển thị phác đồ từ `treatments` thay vì chỉ phụ thuộc vào `sprayPrograms`.
- Không xóa các service legacy trong bước này.

## File sẽ sửa
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentPlanRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/enums/ScoringCriteria.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java`
- `agriai_frontend/src/features/diagnosis/components/DiagnoseSprayProgramsPanel.jsx`
- `agriai_frontend/src/features/diagnosis/components/DiagnoseWeatherAlertsPanel.jsx`
- `agriai_frontend/src/features/diagnosis/components/DiagnoseResultPanel.jsx`
- `agriai_frontend/src/features/diagnosis/components/DiagnoseUploadPanel.jsx`
- `agriai_frontend/src/features/diagnosis/utils/diagnosisDisplay.js`
- `agriai_frontend/src/pages/DiagnosisPage.jsx`
- `agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx`

## Thứ tự thực hiện
1. Cập nhật `TreatmentPlanRepository` để eager-fetch `disease`, `drug`, `drug.ingredients`, `drug.ingredients.ingredient`.
2. Thêm tiêu chí scoring: nếu `drug` có ít nhất một `drug_ingredient` hợp lệ thì cộng 3 điểm.
3. Cập nhật `RuleEngineService.process()` để chạy song song `DrugInteractionChecker.checkRecommendedPlans()` và `DiseaseWeatherRiskEvaluator.evaluate()` bằng `CompletableFuture`.
4. Cập nhật frontend để tạo fallback display programs từ `result.treatments` khi `result.sprayPrograms` rỗng.
5. Cập nhật trang lịch sử chi tiết dùng cùng logic fallback.
6. Chạy test/build liên quan nếu môi trường cho phép.

## Điều cần kiểm tra
- API `/api/diagnosis` có `treatments` không rỗng khi phát hiện bệnh có treatment plan.
- Màn hình chẩn đoán hiển thị phác đồ khi `sprayPrograms=[]` nhưng `treatments` có dữ liệu.
- Cảnh báo tương tác và `diseaseWeatherRisks` vẫn được trả về sau khi chạy song song.
