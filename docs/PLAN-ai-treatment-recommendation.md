# Tích hợp AI vào quá trình Recommendation (AI-Driven Treatment Ranking)

Kế hoạch này phác thảo cách chuyển đổi logic chọn phác đồ "Khuyến nghị" (Rank #1) từ thuật toán tính điểm cứng (`ScoringCriteria.java`) sang việc sử dụng trực tiếp mô hình AI (Gemini qua `AIService.java`).

## User Review Required

> [!IMPORTANT]
> Gọi AI (Gemini) cho mỗi lượt chẩn đoán sẽ làm tăng độ trễ (latency) của API `/diagnose` thêm khoảng 2-4 giây. Bạn có đồng ý với độ trễ này để đổi lấy kết quả thông minh hơn không?
> 
> Ngoài ra, để tiết kiệm Token và tránh AI bị "ảo giác" (hallucination) khi có quá nhiều phác đồ, hệ thống sẽ dùng `ScoringCriteria` hiện tại để **lọc ra Top 3-5 phác đồ tốt nhất trước**, sau đó mới gửi Top 3-5 này cho AI quyết định phác đồ "Hoa hậu" (Rank #1). Bạn có đồng ý với hướng tiếp cận Hybrid (Lai) này không?

## Open Questions

1. **Structured Output:** Để trích xuất ID phác đồ từ câu trả lời của AI một cách chính xác nhất bằng code Java, chúng ta nên ép AI trả về chuẩn JSON (ví dụ: `{"recommended_id": 123, "reason": "..."}`). Khai báo JSON mode cho LangChain4j là cách an toàn nhất.
2. **Đặc tính hoạt chất:** Hiện tại trong database bảng `Ingredient` có cột `description` hoặc `characteristics` không? Nếu chưa có, AI sẽ tự dùng "kiến thức có sẵn" (internal knowledge) của nó về hoạt chất đó để phân tích, kết hợp với các dữ liệu bạn truyền vào.

## Proposed Changes

---

### Backend Components

#### [MODIFY] `AIService.java`
- Thêm phương thức mới: `RecommendResult recommendTreatment(DiseaseContext context, List<TreatmentPlan> candidatePlans)`
- **Prompt Engineering:** Xây dựng một prompt chuyên biệt bao gồm:
  - **Thông tin môi trường:** Thời tiết (Nhiệt độ, lượng mưa, độ ẩm).
  - **Thông tin dịch hại:** Tên bệnh, Mức độ bệnh (Severity).
  - **Danh sách ứng viên (RAG):** Trích xuất ID, Tên thuốc, Hoạt chất, Hướng dẫn sử dụng của các phác đồ `candidatePlans`.
  - **Yêu cầu đầu ra:** Yêu cầu AI trả về chuỗi JSON chứa `recommendedPlanId` và `reasoning` (Giải thích tại sao chọn phác đồ này dựa trên thời tiết/mức độ bệnh).

#### [NEW] `RecommendResult.java` (hoặc Record nội bộ)
- Record dùng để hứng kết quả parse từ JSON của AI: `record RecommendResult(Integer recommendedPlanId, String reasoning) {}`

#### [MODIFY] `TreatmentRankingService.java`
- Cập nhật hàm `rankSingleDisease(List<TreatmentPlan> plans)`:
  - Bước 1: Vẫn tính `score` để xếp hạng thô (sắp xếp từ cao xuống thấp).
  - Bước 2: Lấy Top 3 hoặc Top 5 phác đồ có điểm cao nhất.
  - Bước 3: Gọi `aiService.recommendTreatment(...)` và truyền Top danh sách vào.
  - Bước 4: Lấy `recommendedPlanId` từ AI để gán `dto.setRecommended(true)` và `dto.setRecommendationReason(reasoning từ AI)`.

#### [MODIFY] `RuleEngineService.java`
- Do `TreatmentRankingService` bây giờ phụ thuộc vào Context (Thời tiết, Mức độ bệnh), chúng ta cần truyền thêm `WeatherDTO` và danh sách bệnh vào hàm `rankPlans`.

---

## Verification Plan

### Automated Tests
- Cập nhật `TreatmentRankingServiceTest` để mock `AIService` trả về một JSON hợp lệ và kiểm tra xem phác đồ được chọn có đúng ID đó không.
- Bổ sung Unit Test cho hàm prompt builder để đảm bảo prompt sinh ra chứa đủ Tên bệnh, Thời tiết, Mức độ bệnh.

### Manual Verification
- Gửi một request chẩn đoán giả lập thời tiết "Mưa to". Kiểm tra xem AI có tự động chọn phác đồ dùng thuốc có đặc tính bám dính tốt (hoặc nội hấp) và trả về lời giải thích hợp lý hay không.
- Gửi một request chẩn đoán bệnh "Nặng". Kiểm tra xem AI có ưu tiên thuốc hóa học hơn thuốc sinh học dựa trên dữ liệu RAG hay không.
