# Kế Hoạch Final: Batch Gemini Recommend Phác Đồ

## 1. Tóm Tắt (Summary)
- **Mục tiêu:** Tối ưu hóa hiệu năng chẩn đoán, giảm latency bằng cách gộp (batch) recommend nhiều bệnh vào tối đa 1 Gemini call/request.
- **Tiêu chí:** Không dùng context caching, memory cache, local ranking thủ công, hoặc fallback gắn tag khuyến nghị giả.
- **Hành vi Fallback:** Nếu Gemini lỗi, timeout, hoặc một bệnh nằm ngoài Top N / bị trả sai `planId` -> Bệnh đó sẽ **không có phác đồ nào được khuyên dùng** (`recommended = false` cho tất cả phác đồ ứng viên của bệnh đó).

## 2. Chi Tiết Triển Khai (Key Changes)

### 2.1. Cấu hình mới (Properties)
```properties
gemini.recommend.batch.enabled=true
gemini.recommend.max-diseases=5
gemini.recommend.temperature=0.1
gemini.recommend.timeout-seconds=20
gemini.recommend.max-output-tokens=2048
gemini.recommend.cooldown-seconds=30
```

### 2.2. Lớp `AIService.java`
- Khởi tạo riêng `recommendModel` (temperature=0.1, maxOutputTokens=2048, timeout=20s, JSON format).
- **Trỏ cả hai hàm recommend về `recommendModel`:** Cả hàm legacy `recommendTreatment(...)` và hàm mới `recommendTreatmentsBatch(...)` đều sử dụng `recommendModel` để tận dụng cấu hình tối ưu. Cựu model `chatModel` chỉ dùng riêng cho `generateGuidance(...)`.
- Triển khai **Lightweight Circuit Breaker** bằng `AtomicLong recommendUnavailableUntil`:
  - Mỗi khi thực hiện call: kiểm tra nếu `System.currentTimeMillis() < recommendUnavailableUntil.get()` -> Bỏ qua Gemini và trả về `null` ngay lập tức.
  - Lỗi Timeout (SocketTimeoutException/TimeoutException), hoặc lỗi 429/5xx từ Google API -> Kích hoạt cooldown: `recommendUnavailableUntil.set(System.currentTimeMillis() + cooldownSeconds * 1000)`.
  - Nếu Gemini call thành công -> Reset cooldown: `recommendUnavailableUntil.set(0)`.
  - Parse lỗi JSON hoặc sai `planId` **không** kích hoạt cooldown.
- Parse JSON 2 lớp:
  - Records: `BatchRecommendResponse` và `BatchRecommendItem`.
  - Parse wrapper `{"items": [...]}` trước, parse raw array `[...]` sau. Cả hai fail -> ném Exception để kích hoạt Total Fallback.

### 2.3. Lớp `TreatmentRankingService.java`
- **Xác định Top N Priority (Max 5 diseases):**
  - Sắp xếp danh sách `diseases` theo mức ưu tiên:
    1. `confidence` DESC (null-safe, `null` xếp cuối).
    2. `diseaseId` ASC để ổn định thứ tự.
  - Lọc ra tối đa Top 5 để đưa vào batch. Các bệnh từ thứ 6 trở đi không đưa vào Gemini batch và không có phác đồ khuyên dùng (`recommended = false`).
- **Luồng xử lý Batch:**
  - Nếu `gemini.recommend.batch.enabled = false` -> Chạy Legacy Sequential loop như hiện tại (nhưng trỏ về `recommendModel` của `AIService`).
  - Nếu bật Batch -> Gọi `aiService.recommendTreatmentsBatch` đúng 1 lần cho Top 5.
  - Validate: `recommendedPlanId` phải thuộc `plansByDisease` snapshot của bệnh đó.
  - Thêm comment: `// plansByDisease is the request-scoped snapshot; validate against it to avoid N+1 reloads.`
  - Cấu trúc lại kết quả đầu ra:
    - Nếu có phác đồ được chọn hợp lệ -> Đưa phác đồ đó lên đầu tiên (index 0), gán `recommended = true` và `recommendationReason` (mặc định `"Phác đồ phù hợp nhất"` nếu reasoning trống). Các phác đồ còn lại gán `recommended = false` và xếp sau.
    - Nếu không có phác đồ nào được chọn (bệnh ngoài Top N, hoặc bị lỗi/thiếu/sai) -> Tất cả phác đồ của bệnh đó giữ nguyên thứ tự ban đầu và đều gán `recommended = false`, `recommendationReason = null`.
- **Tương tác thuốc (`DrugInteractionChecker`):**
  - Không đổi logic. Chỉ kiểm tra các `TreatmentDTO` có `recommended = true`.
  - Nếu số lượng recommended plans `< 2`, bỏ qua kiểm tra candidate-level interaction.

### 2.4. Cập nhật Bộ Test `TreatmentRankingServiceTest.java`
- Sửa lại các test case cũ: Khi AI bị mock trả về `null`, kiểm chứng rằng **không có phác đồ nào được gán recommended** (`assertTrue` đổi thành `assertFalse(result.get(0).getRecommended())`).
- Đổi tên các test case cho phù hợp với hành vi nghiệp vụ mới.

### 2.5. Logging chuẩn bằng Slf4j
Sử dụng các prefix chuẩn:
- `[AI_RECOMMEND_BATCH]`
- `[AI_RECOMMEND_TOTAL_FALLBACK]` (reason = "TIMEOUT", "COOLDOWN_ACTIVE", "PARSE_FAIL", v.v.)
- `[AI_RECOMMEND_PARTIAL_FALLBACK]` (ghi rõ danh sách diseaseIds bị fallback)
- `[AI_RECOMMEND_LEGACY]`

Log fields:
`diseaseCount, batchedDiseaseCount, localFallbackDiseaseCount, partialFallbackCount, totalFallback (boolean), reason, latencyMs, promptBytes, responseBytes`.

## 3. Kế Hoạch Kiểm Thử (Test Plan)
- Chạy unit tests `TreatmentRankingServiceTest` -> Đảm bảo pass toàn bộ sau khi đã cập nhật lại assertion.
- Test 1 ảnh có 1 bệnh -> batch 1.
- Test ảnh > 5 bệnh -> Top 5 batch, phần còn lại không recommended.
- Giả lập Timeout / Gemini API Error -> Total Fallback + kích hoạt Cooldown.
- Chạy backend tests `mvnw test`.
