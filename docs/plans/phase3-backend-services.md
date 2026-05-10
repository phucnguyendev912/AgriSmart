# Phase 3: Backend Service Contracts — Task File

## Mục tiêu
Thay thế luồng cũ (`TreatmentSelector` → `WeatherAlertEvaluator` → `SprayProgramBuilder`)
bằng 4 service mới hoạt động độc lập, dễ test, dễ bảo trì.

## Luồng cũ (đang chạy)
```
RuleEngineService.process()
  │
  ├── TreatmentLookupService.findByDiseaseId(1 id) → lặp từng disease
  ├── TreatmentSelector.selectPrimaryPlan() → chọn 1 plan duy nhất/bệnh
  ├── DrugInteractionChecker.buildInteractionWarnings() → dùng plan.ingredient (cũ)
  ├── WeatherAlertEvaluator.buildWeatherAlerts() → dùng treatment_weather_condition (cũ)
  └── SprayProgramBuilder.buildPrograms() → gom spray programs + treatments
```

## Luồng mới (sẽ triển khai)
```
RuleEngineService.process()
  │
  ├── [Bước 1 - Tuần tự] TreatmentLookupService.findByDiseaseIds() → lấy tất cả plans 1 lần
  ├── [Bước 2 - Tuần tự] TreatmentRankingService.rankPlans() → rank + recommend top plan mỗi bệnh
  │                        ↓ (trả TẤT CẢ plans về, plan top có recommended=true)
  │
  ├── [Bước 3 - SONG SONG] ┬── DrugInteractionChecker.checkRecommendedPlans()
  │                         └── DiseaseWeatherRiskEvaluator.evaluate()
  │
  └── [Bước 4] Gom kết quả → RuleEngineResult
```

### Yêu cầu tối ưu UX (QUAN TRỌNG)

**1. Progressive Display (Hiển thị ngay khi xong):**
- Bước 1+2 (Lookup + Ranking) xong → Frontend hiển thị ngay danh sách phác đồ (treatments).
- Bước 3 (Interaction + WeatherRisk) xong sau → Frontend bổ sung thêm cảnh báo lên giao diện.
- **Cách triển khai:** Backend trả kết quả đầy đủ 1 lần (không cần SSE).
  Bước 3 chạy **CompletableFuture song song** để giảm thời gian chờ tổng thể.
  Frontend chỉ cần render từng phần khi data có (treatments render trước,
  interaction/weather risk render khi có giá trị non-null).

**2. Block Upload khi đang chẩn đoán (Frontend):**
- Khi user nhấn "Chẩn đoán" → disable nút upload ảnh và nút chẩn đoán.
- Hiển thị loading overlay trên ảnh đã chọn.
- Chỉ enable lại khi API trả về kết quả hoặc lỗi.
- **Ghi chú:** Phần này thuộc Frontend (Phase 5), ghi nhận ở đây để không quên.

---

## Thứ tự triển khai (Feature-by-Feature)

### Feature 1: TreatmentPlanRepository + TreatmentLookupService
**File cần sửa:** `TreatmentPlanRepository.java`, `TreatmentLookupService.java`

#### TreatmentPlanRepository.java — Tại sao cần sửa?
- **Hiện tại:** Chỉ có `findByDiseaseIdAndIsDeleteFalse(Integer)` — query từng disease ID một, gây N+1.
- **Cần thêm:** Method nhận `List<Integer> diseaseIds` và dùng `@EntityGraph` eager-fetch `disease`, `drug`, `drug.ingredients`, `drug.ingredients.ingredient` trong 1 query duy nhất.
- **Tại sao dùng @EntityGraph?** Vì Hibernate sẽ tự build LEFT JOIN tối ưu, code gọn hơn `@Query FETCH JOIN` khi cần fetch nhiều tầng nested.

#### TreatmentLookupService.java — Tại sao cần sửa?
- **Hiện tại:** Hàm `findByDiseaseId(Integer)` → gọi repo từng cái, sort theo `isRequired`.
- **Cần thêm:** Hàm `findByDiseaseIds(List<Integer>)` → gọi repo 1 lần, trả về `Map<Integer, List<TreatmentPlan>>` group theo disease ID.
- **Tại sao trả Map?** Vì TreatmentRankingService cần xử lý rank **theo từng bệnh** riêng biệt (mỗi bệnh chọn 1 recommended).

---

### Feature 2: TreatmentRankingService (TẠO MỚI)
**File tạo mới:** `TreatmentRankingService.java`

#### Chức năng
Nhận danh sách plans theo bệnh, chấm điểm và xếp hạng. Mỗi bệnh sẽ có **đúng 1 plan** được đánh `recommended=true`.

#### Hàm chính: `List<TreatmentDTO> rankPlans(Map<Integer, List<TreatmentPlan>> plansByDisease)`
- **Input:** Map `{diseaseId -> List<TreatmentPlan>}` từ TreatmentLookupService.
- **Output:** Flat list `TreatmentDTO` với `rank`, `recommended`, `recommendationReason` đã được fill.
- **Tại sao thiết kế hàm nhận Map?** Vì mỗi bệnh rank độc lập, plan bệnh A không ảnh hưởng rank bệnh B.

#### Logic chấm điểm (private `calculateScore(TreatmentPlan)`)
- Có `drug_id` && drug active → +4 điểm
- Có ít nhất 1 `drug_ingredient` → +3 điểm
- Có `display_dosage` → +2 điểm
- Có `applicationTime` hoặc `sprayInterval` → +1 điểm
- `isRequired=true` → +1 điểm
- Tie-breaker: ID nhỏ hơn thắng.
- **Tại sao chấm điểm dạng cộng?** Đơn giản, dễ debug, dễ mở rộng (thêm tiêu chí chỉ cần thêm 1 dòng).

#### Dùng gì?
- `TreatmentDTO.fromEntity(plan)` (đã tạo ở Phase 4) để map entity sang DTO.
- Không inject bất kỳ repository nào — chỉ xử lý data thuần.

---

### Feature 3: DiseaseWeatherConditionRepository + DiseaseWeatherRiskEvaluator (TẠO MỚI)
**File tạo mới:** `DiseaseWeatherConditionRepository.java`, `DiseaseWeatherRiskEvaluator.java`

#### DiseaseWeatherConditionRepository.java
- **Chức năng:** Lấy ngưỡng thời tiết theo list disease IDs.
- **Method:** `findByDiseaseIdInAndIsActiveTrueAndIsDeleteFalse(List<Integer>)`
- **Tại sao dùng derived query?** Vì logic đơn giản (lọc active + not deleted), Spring Data tự sinh SQL.

#### DiseaseWeatherRiskEvaluator.java
- **Chức năng:** So sánh thời tiết thực tế với ngưỡng, trả về cảnh báo rủi ro bệnh.
- **KHÁC với WeatherAlertEvaluator cũ:**
  - Cũ: dựa vào `treatment_weather_condition` (gắn với plan → kiểm tra có nên phun không).
  - Mới: dựa vào `disease_weather_condition` (gắn với bệnh → kiểm tra bệnh có thuận lợi phát triển không).

#### Hàm chính: `List<DiseaseWeatherRiskDTO> evaluate(List<Integer> diseaseIds, WeatherDTO weather)`
- **Input:** danh sách disease IDs + thời tiết thực tế.
- **Output:** list DTO cảnh báo cho mỗi bệnh có điều kiện thời tiết match.
- **Tại sao trả List DTO thay vì Map?** Vì output này sẽ được set thẳng vào `DiagnoseResponse.diseaseWeatherRisks`, frontend chỉ cần iterate list.

#### Logic AND trong group (private `evaluateGroup(...)`)
- Load tất cả `DiseaseWeatherCondition` theo `diseaseIds`.
- Group theo `diseaseId + conditionGroup`.
- Trong 1 group: tất cả condition phải match → group mới match.
- 1 condition match khi: giá trị thực tế thoả operator (`BETWEEN`, `GREATER_THAN`, `LESS_THAN`, `EQUALS`).
- Missing weather factor (VD: wind_speed không có trong WeatherDTO) → group KHÔNG match.
- **Tại sao logic AND?** Vì bệnh đạo ôn cần ĐỒNG THỜI nhiệt độ 20-28°C VÀ độ ẩm >85% mới thuận lợi.

#### Dùng gì?
- `DiseaseWeatherConditionRepository` → lấy data.
- `WeatherDTO` → lấy giá trị thực tế.
- Enum `Operator`, `WeatherFactor` đã có sẵn.

---

### Feature 4: DrugInteractionChecker (CẬP NHẬT)
**File cần sửa:** `DrugInteractionChecker.java`

#### Tại sao cần sửa?
- **Hiện tại:** Lấy hoạt chất từ `plan.getIngredient()` (legacy — mỗi plan chỉ có 1 ingredient).
- **Cần thêm:** Lấy hoạt chất từ `plan.getDrug().getIngredients()` (mới — 1 drug có nhiều ingredient).
- Giữ fallback cũ khi plan chưa có `drug_id`.

#### Hàm mới: `InteractionResult checkRecommendedPlans(List<TreatmentDTO> treatments, List<TreatmentPlan> plans)`
- **Input:** treatments đã ranked (chỉ check recommended) + plans gốc (để lấy ingredient).
- **Output:** Record chứa `interactionWarnings`, `hasInteractionWarning`, `interactionSummary`.
- **Tại sao tách record riêng?** Để RuleEngineService gán thẳng vào result mà không cần xử lý thêm.

#### Logic lấy ingredient IDs mới (private `extractIngredientIds(TreatmentPlan)`)
- Nếu plan có `drug` && drug có `ingredients`: lấy tất cả `ingredient.id` từ `drug.ingredients`.
- Nếu không: fallback lấy `plan.ingredient.id` (legacy).
- **Tại sao fallback?** Vì đang giai đoạn migration, không phải plan nào cũng đã có `drug_id`.

#### Dùng gì?
- `DrugInteractionRepository` (đã có) → query interaction giữa ingredient pairs.
- Giữ lại logic `BLOCKING_ACTION_RULE_KEYWORDS` hiện tại.

---

### Feature 5: RuleEngineService (CẬP NHẬT)
**File cần sửa:** `RuleEngineService.java`

#### Tại sao cần sửa?
- **Hiện tại:** Gọi `TreatmentSelector`, `WeatherAlertEvaluator`, `SprayProgramBuilder`.
- **Mới:** Gọi `TreatmentRankingService`, `DiseaseWeatherRiskEvaluator`, `DrugInteractionChecker` mới.

#### Hàm `process()` mới
```
1. lookupService.findByDiseaseIds(diseaseIds) → Map
2. rankingService.rankPlans(plansByDisease) → List<TreatmentDTO>
3. interactionChecker.checkRecommendedPlans(rankedTreatments, allPlans)
4. weatherRiskEvaluator.evaluate(diseaseIds, weather)
5. Build RuleEngineResult mới
```

#### RuleEngineResult mới (record update)
- Thêm: `diseaseWeatherRisks`, `hasInteractionWarning`, `interactionSummary`.
- `sprayPrograms` → luôn là `List.of()`.
- `weatherAlerts` → luôn là `List.of()`.

#### Dùng gì?
- Bỏ dependency: `TreatmentSelector`, `WeatherAlertEvaluator`, `SprayProgramBuilder`.
- Thêm dependency: `TreatmentRankingService`, `DiseaseWeatherRiskEvaluator`.
- Giữ: `TreatmentLookupService`, `DrugInteractionChecker`.

---

## Ghi chú
- Triển khai theo đúng thứ tự Feature 1 → 2 → 3 → 4 → 5.
- Sau mỗi Feature, user sẽ review code trước khi qua Feature tiếp theo.
- Các file legacy (`TreatmentSelector`, `WeatherAlertEvaluator`, `SprayProgramBuilder`) sẽ được xoá sau khi Feature 5 hoàn tất và test OK.
