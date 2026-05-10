# Kế Hoạch Triển Khai: Cải Tổ Luồng Chẩn Đoán (Diagnose Flow Refactoring)

**Mục tiêu:** Chuyển đổi luồng Diagnose từ cơ chế cũ (`ingredient_id`/`drug_name`) sang model mới (`Disease -> TreatmentPlan -> Drug -> DrugIngredient -> Ingredient`). Cụ thể hoá các yêu cầu kỹ thuật thành danh sách các file cần tác động.

---

## Danh Sách File Cần Tác Động

| Tầng (Layer) | File | Hành Động | Nhiệm vụ & Thay Đổi Chính |
| --- | --- | --- | --- |
| **1. Database** | `docker/schema.sql` | Cập nhật | Chuẩn hoá `disease_weather_condition` ngay từ lúc tạo (thêm `recommendation_note`, xoá `risk_level`, `priority`). |
| **1. Database** | `docker/seed/schema_extensions.sql` | Cập nhật | Viết script `ALTER TABLE DROP COLUMN` để migrate an toàn DB cũ (xoá `risk_level`, `priority`). |
| **1. Database** | `docker/seed_final.sql` & `...v8_1_plain_insert.sql` | Cập nhật | Xoá 2 cột `risk_level`, `priority` khỏi toàn bộ block `INSERT`/`UPDATE` của bảng thời tiết. |
| **2. DTO** | `DiseaseWeatherRiskDTO.java` | **Tạo Mới** | Chứa kết quả thời tiết (`diseaseId`, `diseaseCode`, `conditionGroup`, `matchedConditions`, `recommendationNotes`). |
| **2. DTO** | `DiagnoseResponse.java` | Cập nhật | Thêm list `diseaseWeatherRisks`, cờ `hasInteractionWarning`, chuỗi `interactionSummary`. Để `sprayPrograms` rỗng. |
| **2. DTO** | `TreatmentDTO.java` | Cập nhật | Thêm mapping `drugId`, `drugName` (từ `plan.drug`), `displayDosage`, `sprayTimes`,... |
| **3. Repository** | `TreatmentPlanRepository.java` | Cập nhật | Thêm method dùng `FETCH JOIN` để lấy sẵn `disease`, `drug`, `ingredients` theo list `diseaseIds` (tránh N+1). |
| **3. Repository** | `DiseaseWeatherConditionRepository.java` | **Tạo Mới** | Thêm method lấy ngưỡng thời tiết theo list `diseaseIds`. |
| **4. Service** | `TreatmentLookupService.java` | Cập nhật | Sửa hàm lookup nhận `List<Integer>`, trả về toàn bộ active plans thô. |
| **4. Service** | `TreatmentRankingService.java` | **Tạo Mới** | Rank plan theo ưu tiên (`drug_id`, `display_dosage`, `is_required`). Chọn 1 plan `recommended=true` mỗi bệnh. |
| **4. Service** | `DrugInteractionChecker.java` | Cập nhật | Lấy hoạt chất từ `plan.drug.ingredients`. Check chéo giữa các bệnh. Trả về conflict summary. |
| **4. Service** | `DiseaseWeatherRiskEvaluator.java` | **Tạo Mới** | Phân tích `WeatherDTO` thực tế đối chiếu với các nhóm điều kiện thời tiết (AND logic trong 1 group). |
| **4. Service** | `RuleEngineService.java` | Cập nhật | Bỏ `TreatmentSelector`, `WeatherAlertEvaluator`, `SprayProgramBuilder`. Gom 4 services mới thành 1 luồng chuẩn. |
| **4. Service** | `DiagnoseResponseBuilder.java` | Cập nhật | Lắp ráp response với các data mới (weather risks, interaction summary). |
| **5. Test** | `TreatmentRankingServiceTest.java` | **Tạo Mới** | Verify đúng 1 recommended plan/bệnh. Plan đủ thông tin (drug, dosage) ưu tiên cao nhất. |
| **5. Test** | `DrugInteractionCheckerTest.java` | **Tạo Mới** | Verify fallback logic, conflict rules (VD: `SEPARATE` bị block, `MIX` cho qua). |
| **5. Test** | `DiseaseWeatherRiskEvaluatorTest.java` | **Tạo Mới** | Verify logic operator `BETWEEN`, `GREATER_THAN`. Bỏ sót factor thì group tạch. |
| **5. Test** | `RuleEngineServiceTest.java` | Cập nhật | Verify output tổng hợp: `sprayPrograms` và `weatherAlerts` phải trả mảng rỗng. |

---

## Socratic Gate (Xác nhận trước khi code)
Bạn đã đưa ra một hướng dẫn quá sức chi tiết và tuyệt vời. Để đảm bảo 100% trước khi tiến hành code:
1. Bạn có muốn tái sử dụng các file cũ như `WeatherAlertEvaluator` và đổi tên thành `DiseaseWeatherRiskEvaluator` không, hay ta sẽ **xoá hẳn file cũ** và **tạo file mới 100%** cho rành mạch? *(Mặc định tôi khuyên tạo file mới 100% và gỡ dần các file legacy)*.
