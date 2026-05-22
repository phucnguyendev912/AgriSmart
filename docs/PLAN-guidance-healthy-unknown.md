# PLAN - Phân biệt cây khỏe và không xác định trong AI Guidance

Hệ thống chẩn đoán hiện tại chưa phân biệt được giữa hai trường hợp:
1. Cây khỏe mạnh (`HEALTHY`)
2. Không xác định được bệnh (`UNKNOWN`)

Cả hai trường hợp này hiện đều trả về hướng dẫn AI (bao gồm cả LLM prompt và fallback guidance) giống nhau, ghi nhận cây khỏe mạnh: *"Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại."*

Kế hoạch này sẽ điều chỉnh backend (`AIService.java`) để cung cấp phản hồi/hướng dẫn phù hợp cho từng trường hợp cụ thể.

## User Review Required

> [!WARNING]
> Thay đổi này ảnh hưởng trực tiếp đến nội dung tư vấn chuyên gia AI gửi tới người dùng cuối. Cần thống nhất các mẫu câu tư vấn tiêu chuẩn khi hệ thống gặp lỗi kết nối LLM (fallback guidance) và cấu trúc prompt gửi sang mô hình Gemini.

## Open Questions

> [!IMPORTANT]
> **Câu hỏi 1:** Khi cây khỏe mạnh, chúng ta có cần truyền thêm dữ liệu thời tiết (nếu có) để AI đưa ra cảnh báo sớm về các nguy cơ bệnh dịch trong tương lai gần (ví dụ: mưa ẩm kéo dài) hay chỉ cần đưa ra các lời khuyên chăm sóc thông thường?
>
> **Câu hỏi 2:** Trong trường hợp không xác định được bệnh (`UNKNOWN`), bên cạnh lời khuyên chụp ảnh rõ nét hơn, chúng ta có cần thêm khuyến cáo nông dân liên hệ cán bộ bảo vệ thực vật địa phương hoặc đính kèm hotline hỗ trợ không?

## Proposed Changes

---

### [Component] Backend Services

#### [MODIFY] [AIService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AIService.java)

1. Cập nhật phương thức `fallbackGuidance(DiagnoseResponse response)`:
   - Nếu `isHealthy` là `true` hoặc `diagnosisType` là `"HEALTHY"`:
     Trả về: *"Cây của bạn đang trong tình trạng khỏe mạnh. Tiếp tục chăm sóc như hiện tại, bón phân cân đối và theo dõi ruộng vườn thường xuyên để phòng ngừa sâu bệnh."*
   - Nếu `diagnosisType` là `"UNKNOWN"`:
     Trả về: *"Hệ thống chưa thể xác định rõ tình trạng hoặc loại bệnh trên cây qua hình ảnh này. Vui lòng chụp lại ảnh cận cảnh vết bệnh, sắc nét dưới ánh sáng tự nhiên đầy đủ và thử chẩn đoán lại. Không nên tự ý phun thuốc khi chưa rõ nguyên nhân."*
   - Ngược lại (có bệnh): giữ nguyên phác đồ điều trị đề xuất.

2. Cập nhật phương thức `buildPrompt(DiagnoseResponse response)`:
   - Tách thành 3 nhánh prompt chuyên biệt:
     - **Nhánh `HEALTHY`**: Yêu cầu AI đưa ra lời khuyên chăm sóc phòng ngừa chủ động ngắn gọn (khoảng 3-4 câu), giữ ruộng sạch cỏ, bón phân cân đối, theo dõi sát sao, không dùng thuốc bừa bãi.
     - **Nhánh `UNKNOWN`**: Yêu cầu AI hướng dẫn cách chụp ảnh tốt hơn (chụp cận cảnh vết bệnh, ánh sáng tự nhiên tốt, rõ nét), khuyên theo dõi diễn biến ruộng vườn và nhắc nhở không tự ý phun thuốc hóa học bừa bãi khi chưa rõ bệnh.
     - **Nhánh `DISEASE_DETECTED`**: Giữ nguyên prompt hiện tại (với các case 1, 2, 3 và chi tiết thuốc đề xuất).

#### [MODIFY] [LLMServiceTest.java](file:///d:/AgriAI/agriai_backend/agriai/src/test/java/com/phucnguyen/agriai/service/LLMServiceTest.java)

1. Thêm test case `generateGuidance_noApiKey_unknownState` để kiểm thử fallback guidance cho trạng thái `UNKNOWN`.
2. Kiểm tra lại test case `generateGuidance_noApiKey_healthyPlant` để đảm bảo nội dung phản hồi cây khỏe hoạt động bình thường.

---

## Verification Plan

### Automated Tests
- Chạy toàn bộ test suite của backend bằng lệnh:
  `mvn test` hoặc `./mvnw test` trong thư mục `agriai_backend/agriai` để đảm bảo không lỗi regression.

### Manual Verification
- Chẩn đoán thử nghiệm qua API hoặc frontend:
  1. Với ảnh cây khỏe (`isHealthy = true`): Kiểm tra text tư vấn AI hiển thị thông tin chúc mừng và chăm sóc phòng vệ.
  2. Với ảnh không nhận diện được bệnh (`diagnosisType = UNKNOWN`): Kiểm tra text tư vấn AI hiển thị hướng dẫn chụp lại ảnh và cảnh báo không phun thuốc bừa bãi.
