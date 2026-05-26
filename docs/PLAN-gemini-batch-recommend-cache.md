# Kế Hoạch: Giảm Số Lần Gọi Gemini Bằng Cache + Gộp Recommend (Batch)

## 1. Tóm Tắt (Summary)
- **Vấn đề cốt lõi:** Phương thức `recommendTreatment()` hiện tại đang gọi LLM (Gemini) theo từng bệnh. Nếu cây có 3 bệnh, hệ thống sẽ thực hiện 3 request API độc lập, dẫn đến thời gian chờ tăng gấp ba và lãng phí tài nguyên.
- **Giải pháp đề xuất:** 
  1. **Batching:** Gộp việc gọi recommend cho nhiều bệnh vào một request Gemini duy nhất. 
  2. **Caching:** Cache corpus (dữ liệu phác đồ từ DB) để tối ưu việc gửi ngữ cảnh cho Gemini (có thể dùng Gemini Cached Content hoặc Cache Memory thuần).

## 2. Đánh Giá & Debate (Socratic Gate)

Phân tích plan, tôi có một số điểm cần debate và làm rõ trước khi bắt tay vào code:

### Debate 1: Token Limit của Gemini Cached Content
- **Vấn đề:** Tính năng **Gemini Context Caching** (trên Google AI Studio / Vertex AI) yêu cầu một lượng token tối thiểu để có thể tạo cache (ví dụ: mô hình `gemini-1.5-flash` và `gemini-1.5-pro` yêu cầu **tối thiểu 32,768 tokens** cho input cache). 
- **Câu hỏi:** Database phác đồ điều trị (Treatment Plans) của dự án hiện có đủ lớn để vượt mức 32,768 tokens không? Nếu toàn bộ corpus rất nhỏ (ví dụ chỉ 1000 - 2000 tokens), API của Gemini sẽ từ chối tạo cache.
- **Đề xuất:** Thay vì nạp toàn bộ DB vào Gemini Cached Content, chúng ta có thể chỉ áp dụng **Memory Cache (trong Spring Boot)** để tránh query DB nhiều lần, sau đó **chỉ gửi các phác đồ ứng viên của các bệnh được detect** (batching) trong 1 prompt. Như vậy prompt vẫn rất nhẹ và gọi 1 lần là xong. Bạn nghĩ sao về hướng này?

### Debate 2: Hỗ trợ của Langchain4j
- **Vấn đề:** Hiện tại project đang dùng thư viện `dev.langchain4j.model.googleai.GoogleAiGeminiChatModel`. Phiên bản hiện tại của Langchain4j có thể chưa hỗ trợ API Cached Content của Gemini một cách trực tiếp.
- **Câu hỏi:** Nếu buộc phải dùng Gemini Cached Content, chúng ta có thể sẽ phải tự build HTTP Request (WebClient/RestTemplate) thay vì dùng Langchain4j. Bạn có đồng ý đánh đổi sự phức tạp này không, hay ưu tiên dùng Batching kết hợp Spring Boot Memory Cache (như `@Cacheable`)?

### Debate 3: Xử lý Fallback khi một bệnh bị lỗi trong Batch
- **Vấn đề:** Trong Batch, nếu Gemini trả về JSON đúng format nhưng lại chỉ recommend cho 2/3 bệnh (thiếu 1 bệnh), hoặc chọn sai `planId`.
- **Đề xuất:** Phải có cơ chế parse kết quả từ Map của Gemini: bệnh nào có kết quả hợp lệ thì lấy, bệnh nào thiếu/sai id thì chạy logic fallback hiện tại (lấy plan index 0) cho riêng bệnh đó. Plan của bạn đã cover phần này rất chuẩn.

## 3. Thiết Kế Mới Dự Kiến (Chờ Xác Nhận)

### 3.1 Cấu Hình (Config)
```properties
gemini.recommend.batch.enabled=true
gemini.recommend.cache-db-enabled=true # Bật memory cache cho DB
# Nếu sử dụng Gemini API Cached Content thật:
gemini.cache.enabled=false # Tạm thời disable nếu DB chưa đủ 32k tokens
```

### 3.2 Lớp `TreatmentKnowledgeCacheService`
Sử dụng Spring Cache (`@Cacheable`) hoặc ConcurrentHashMap để cache danh sách các `TreatmentPlan` theo từng `diseaseId`. Tránh query database nhiều lần khi lấy danh sách phác đồ.

### 3.3 Sửa đổi `AIService.java` (Batch Recommend)
Sửa/Thêm hàm:
```java
// Trả về dạng: Map<diseaseId, RecommendResult>
public Map<Integer, RecommendResult> batchRecommendTreatments(List<DiseaseContextDTO> diseases, WeatherDTO weather, Map<Integer, List<TreatmentPlan>> plansByDisease) { ... }
```
- **Prompt:** Liệt kê thông tin của N bệnh, danh sách phác đồ ứng viên của N bệnh.
- **Output Yêu Cầu:** 
  ```json
  [
    { "diseaseId": 1, "recommendedPlanId": 10, "reasoning": "..." },
    { "diseaseId": 2, "recommendedPlanId": 25, "reasoning": "..." }
  ]
  ```

### 3.4 Sửa đổi `TreatmentRankingService.java`
Thay vì gọi stream qua từng bệnh và gọi AI:
1. Tổng hợp `plansByDisease` của tất cả các bệnh phát hiện.
2. Gọi `aiService.batchRecommendTreatments(...)` **đúng 1 lần**.
3. Duyệt lại kết quả và ánh xạ (map) vào từng `TreatmentDTO`, kèm theo logic fallback.

## 4. Kế Hoạch Test (Test Plan)
- Test trường hợp 1 bệnh -> 1 call Gemini.
- Test trường hợp 3 bệnh -> 1 call Gemini.
- Test trường hợp LLM trả về JSON bị hỏng / thiếu bệnh -> fallback thành công.
- Chạy toàn bộ regression test `mvnw.cmd test`.
