# Kế hoạch kiểm tra lịch sử chẩn đoán

## 1. Kết quả kiểm tra Database

Quá trình kiểm tra trực tiếp vào Database PostgreSQL (`AgriAI_db`) cho thấy:

- **Bảng `diagnose_history`**: Đã lưu trữ thành công các phiên chẩn đoán mới nhất (trạng thái `COMPLETED`).
- **Bảng `diagnose_history_detail`**: Đã lưu trữ thành công thông tin chi tiết từng bệnh, bao gồm độ nghiêm trọng (`severity_level`) và đặc biệt là cột `treatment_data` (chứa toàn bộ JSON snapshot của phác đồ, thời tiết, tương tác thuốc).
- **Bảng `diagnose_treatment_recommendation`**: Đã lưu mapping giữa chi tiết chẩn đoán và phác đồ điều trị (`treatment_plan_id`).

## 2. Kết quả kiểm tra API (Truy xuất)

Việc lấy dữ liệu lên **đang hoạt động bình thường** thông qua `DiagnoseHistoryController` (`GET /api/diagnosis/history` và `GET /api/diagnosis/{id}`). 

Lý do: 
- `DiagnoseHistoryService` ưu tiên đọc dữ liệu từ chuỗi JSON trong cột `treatment_data`. 
- Trong chuỗi JSON này (`DiagnosisDetailSnapshotDTO`), các phác đồ (`TreatmentDTO`) vẫn giữ nguyên các cờ `recommended = true` và `recommendationReason` từ AI. Do đó, Frontend hoàn toàn nhận được thông tin phác đồ nào được AI khuyên dùng.

## 3. Phát hiện lỗi tiềm ẩn (Cần xử lý)

Mặc dù API đang trả về đúng nhờ đọc từ JSON snapshot, nhưng dữ liệu lưu trong bảng quan hệ `diagnose_treatment_recommendation` đang bị sai.

- **Vấn đề:** Cột `rank_score` trong bảng này đang lưu toàn bộ giá trị là `0`.
- **Nguyên nhân:** Trước đây hệ thống dùng thuật toán chấm điểm và lưu điểm số vào `treatment.getRank()`. Sau khi chuyển sang AI, AI không tính điểm nữa mà chỉ set cờ `treatment.setRecommended(true)`. Nhưng hàm lưu dữ liệu `saveTreatmentRecommendations` (trong `DiagnoseHistoryPersistenceService`) vẫn đang lấy `.rankScore(treatment.getRank() != null ? treatment.getRank() : 0)`. Do `rank` bằng null, nó lưu thành 0.
- **Hệ quả:** Nếu sau này cột `treatment_data` bị xóa (vì đang đánh dấu `@Deprecated`), hệ thống sẽ gọi hàm fallback `loadTreatmentsFromRecommendations()`. Hàm này dựa vào điều kiện `rankScore == 1` để bật cờ `recommended = true`. Do tất cả đang lưu là 0, khi đó UI sẽ không còn hiển thị badge "Khuyến nghị" nữa.

## 4. Phương án khắc phục

Cần sửa logic mapping điểm số khi lưu vào bảng `diagnose_treatment_recommendation` và khi đọc từ bảng này lên.

### [MODIFY] `DiagnoseHistoryPersistenceService.java`
- Cập nhật hàm `saveTreatmentRecommendations` để map `recommended = true` thành điểm `1`, ngược lại là `0`.

### [MODIFY] `DiagnoseHistoryService.java`
- Cập nhật hàm `toTreatmentFromRecommendation` để nhận diện `rankScore >= 1` là phác đồ được khuyến nghị.

---

> [!NOTE]
> **Kết luận:** Người dùng vẫn đang xem được lịch sử chẩn đoán bình thường với các phác đồ do AI khuyên dùng. Dữ liệu đã lưu đủ. Chỉ cần fix một lỗi nhỏ để đồng bộ hóa dữ liệu bảng quan hệ cho tương lai.

## User Review Required
Bạn có muốn tôi tiến hành fix lỗi dữ liệu lưu `rank_score` trong bảng `diagnose_treatment_recommendation` luôn không? Dùng lệnh `/create` hoặc phản hồi đồng ý để tôi thực hiện.
