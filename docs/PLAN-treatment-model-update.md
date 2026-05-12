# PLAN-treatment-model-update (Phase 8)

## Mục tiêu (Goal)
Tái cấu trúc model `TreatmentPlan` bằng cách xóa các trường UI dư thừa (`display_dosage`, `display_water_volume`), xóa trường dữ liệu trùng lặp (`frequency`), chuyển `dosageType` sang dạng Enum. Đồng thời, chuyển logic hiển thị UI sang cho DTO và Service xử lý tự động để Frontend không bị gián đoạn và vá lỗi backward compatibility cho Lịch sử chẩn đoán.

## Luồng hoạt động (Execution Flow)
1. **Dữ liệu thô (Tại DB & Entity):** Chỉ lưu dữ liệu chuẩn hóa (`dosageValueMin`, `sprayTimes`, v.v.).
2. **Trạm chuyển đổi (Tại DTO):** `TreatmentDTO` sẽ tự động nối chuỗi tạo ra `displayDosage` (vd: "25 - 30 ml/bình"). Nó cũng hứng dữ liệu JSON cũ của Lịch sử (bằng cách dùng các property `@Deprecated` và `@JsonIgnoreProperties`) để không làm sập chức năng Lịch sử.
3. **Tiêu thụ dữ liệu:** Lịch sử, AI, và Frontend tự động nhận chuỗi đẹp mắt từ DTO mà không cần sửa code.

## Các Task
- [x] Task 1: Tạo `DosageType` Enum (`PER_HA`, `PER_TANK`, `PER_AREA`) trong package `com.phucnguyen.agriai.entity.enums`.
- [x] Task 2: Cập nhật entity `TreatmentPlan`. Xóa `@Column` của `display_dosage`, `display_water_volume`, `frequency`. Đổi kiểu của `dosageType` sang `@Enumerated(EnumType.STRING) DosageType`.
- [x] Task 3: Cập nhật `TreatmentDTO.java`:
  - Thêm `@JsonIgnoreProperties(ignoreUnknown = true)`.
  - Khôi phục `treatmentName`, `dosage`, `frequency`, `ingredientName` để làm thùng rác hứng JSON cũ (Fix bug lịch sử).
  - Giữ nguyên các property hiển thị trong DTO để response ra frontend.
  - Cập nhật hàm `fromEntity` để tự động tính toán và nối chuỗi cho `displayDosage` và `displayWaterVolume` từ các dữ liệu thô.
  - Xóa mapping trường `frequency`, chuyển sang map bằng `sprayTimes` / `sprayInterval`.
- [x] Task 4: Sửa `ScoringCriteria.java` do file này đang gọi `plan.getDisplayDosage()`. Chuyển sang check `plan.getDosageValueMin() != null`.
- [x] Task 5: Cập nhật `AIService.java` (nếu cần thiết) để đảm bảo Prompt cho LLM sử dụng đúng các chuỗi hiển thị đã được DTO tự động generate.
- [x] Task 6: Cập nhật các mock tests (`TreatmentRankingServiceTest`, `LLMServiceTest`, `DrugInteractionCheckerTest`) để fix mọi lỗi compiler do xóa trường.
- [x] Task 7: Tạo file SQL `docker/seed/phase8_cleanup.sql` để chạy lệnh `ALTER TABLE treatment_plan DROP COLUMN display_dosage, display_water_volume, frequency`.
- [x] Task 8: Chạy lệnh `mvn clean test` để kiểm thử toàn bộ. → Verify: Build thành công.

## Tiêu chí hoàn thành (Done When)
- [x] Không lỗi compile.
- [x] `TreatmentPlan` entity đã dọn dẹp xong.
- [x] `DosageType` sử dụng Java Enum.
- [x] Logic nối chuỗi hoạt động đúng đắn ở `TreatmentDTO`.
- [x] `ScoringCriteria.java` chạy tốt.
- [x] Có sẵn file SQL `phase8_cleanup.sql` để deploy.
