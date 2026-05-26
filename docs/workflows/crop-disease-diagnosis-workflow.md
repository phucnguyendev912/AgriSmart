# Workflow: AI Crop Disease Diagnosis (Chẩn đoán bệnh cây trồng bằng Trí tuệ Nhân tạo)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** xử lý chẩn đoán bệnh cây trồng qua hình ảnh sử dụng AI, tích hợp dữ liệu thời tiết thực tế, chạy Rule Engine đề xuất điều trị, và quản lý lịch sử/đánh giá từ client (React) đến server (Spring Boot).

---

## 1. Tổng quan chức năng

Chẩn đoán bệnh bằng AI là tính năng trọng tâm của AgriSmart, giúp nông dân phát hiện bệnh trên lá cây trồng tức thì thông qua camera điện thoại hoặc ảnh tải lên.

### Các mảnh ghép cấu thành tính năng:
1. **Xác thực hình ảnh & Dữ liệu đầu vào:** Kiểm tra định dạng ảnh và kiểm tra xem loại cây trồng được chọn có hoạt động không.
2. **Lưu trữ đám mây (Cloudinary):** Lưu trữ hình ảnh nông dân tải lên để làm bằng chứng chẩn đoán và làm đầu vào cho AI.
3. **Phân tích hình ảnh (Vision AI):** Gửi ảnh đến một server Deep Learning (chạy YOLO/ResNet) để nhận diện các vùng lá bị tổn thương và nhãn bệnh.
4. **Tích hợp thời tiết thực tế (Weather API):** Sử dụng tọa độ GPS của người dùng tại thời điểm chụp ảnh để lấy thông tin thời tiết (nhiệt độ, độ ẩm, lượng mưa).
5. **Động cơ luật (Rule Engine):** Kết hợp kết quả bệnh từ AI và điều kiện thời tiết để:
   * Đề xuất phác đồ phun thuốc tối ưu.
   * Cảnh báo tương tác xấu giữa các hoạt chất thuốc bảo vệ thực vật.
   * Đưa ra cảnh báo thời tiết bất lợi (ví dụ: sắp mưa to không nên phun thuốc vì thuốc bị rửa trôi).
6. **AI Guidance (LLM):** Sử dụng mô hình ngôn ngữ lớn (Gemini/OpenAI) để sinh cẩm nang hướng dẫn điều trị chi tiết, dễ hiểu cho nông dân.
7. **Lịch sử chẩn đoán & Định vị dịch bệnh:** Lưu trữ toàn bộ kết quả chẩn đoán và tọa độ GPS của ổ dịch phục vụ vẽ bản đồ dịch bệnh.
8. **Đánh giá phản hồi (User Review):** Nông dân có thể đánh giá độ chính xác của AI và gửi phản hồi để đội ngũ kỹ sư cải tiến mô hình.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả toàn bộ quá trình chẩn đoán bệnh từ lúc nông dân tải ảnh lên đến lúc nhận kết quả và gửi đánh giá phản hồi:

### 2.1. Luồng Chẩn đoán bệnh (Diagnose Request)

```
[ Nông dân / Admin ]
        │ (1) Tải ảnh lá bệnh + Chọn loại cây + Bật GPS -> Nhấn "Chẩn đoán ngay"
        ▼
[ React (DiagnosisPage.jsx) ]
        │ (2) Gửi POST /api/diagnosis (Multipart Form Data: image, cropTypeId, lat, lng)
        ▼
[ Backend (DiagnoseController.java) ]
        │ (3) Gọi diagnoseService.diagnose(email, request)
        ▼
[ DiagnoseService.java ]
        │
        ├─(4) Gọi [DiagnosisValidationService] để kiểm tra tính hợp lệ của ảnh & loại cây trồng
        │
        ├─(5) Tạo trước 1 bản ghi lịch sử ở DB với trạng thái PENDING (Pending State Pattern)
        │     để tránh mất vết chẩn đoán nếu các bước gọi API bên ngoài (AI, Cloudinary) bị lỗi.
        │
        ├─(6) Upload ảnh lên Cloudinary thông qua [CloudinaryService] -> Lấy URL ảnh công khai
        │
        ├─(7) Xử lý song song bất đồng bộ (Asynchronous Parallel Processing):
        │     ├── Nhánh A: Gọi [VisionAIService] gửi ảnh sang server YOLO -> Nhận diện nhãn bệnh
        │     └── Nhánh B: Gọi [WeatherApiService] lấy thông tin thời tiết dựa trên tọa độ GPS
        │
        ├─(8) Đợi cả 2 nhánh hoàn thành (join). Phân tích kết quả bệnh & đối chiếu với Database
        │
        ├─(9) Chạy [RuleEngineService] xử lý đề xuất thuốc, tương tác thuốc và cảnh báo thời tiết
        │     ├── Gọi [TreatmentRankingService] để sắp xếp, đánh giá & chọn ra phác đồ khuyên dùng tối ưu
        │     │     ├── [Cấu hình Batch]: gemini.recommend.batch.enabled (mặc định true), max-diseases (mặc định 5)
        │     │     ├── [Nếu bật Batch]: Sắp xếp bệnh theo confidence giảm dần -> Chọn Top 5 bệnh
        │     │     │   gọi [AIService.recommendTreatmentsBatch] qua Gemini để đề xuất phác đồ cho tất cả trong 1 call duy nhất
        │     │     ├── [Nếu tắt Batch]: Chạy Legacy Sequential loop gọi recommendTreatment từng bệnh
        │     │     └── [Fallback]: Bệnh ngoài Top 5, hoặc khi Gemini lỗi/timeout/sai ID phác đồ 
        │     │         sẽ không có phác đồ khuyên dùng (recommended = false), không dùng default plan để gắn khuyến nghị giả
        │     └── Chạy [DrugInteractionChecker] lọc các phác đồ có recommended = true để kiểm tra tương tác hoạt chất thuốc
        │
        ├─(10) Gọi [GuidancePort] (LLM/Gemini) sinh cẩm nang hướng dẫn điều trị dạng văn bản
        │
        ├─(11) Cập nhật trạng thái bản ghi lịch sử thành COMPLETED
        │      và lưu Snapshot JSON kết quả điều trị vào bảng `diagnose_history_details`
        │
        ├─(12) Kích hoạt Geocoding ở background để chuyển tọa độ thành địa danh thực tế
        ▼
[ React (DiagnosisPage.jsx) ]
        │ (13) Nhận dữ liệu Response 200 OK
        ▼
[ Hiển thị kết quả chẩn đoán, thời tiết, phác đồ điều trị, cảnh báo hoạt chất và AI Guidance ]
```

---

### 2.2. Luồng Đánh giá kết quả chẩn đoán (Review Request)

Sau khi chẩn đoán thành công và nông dân đã đăng nhập, họ có thể gửi đánh giá phản hồi về độ chính xác của AI:

```
[ Nông dân / Admin ]
        │ (1) Nhấp nút "Đánh giá kết quả chẩn đoán" -> Chọn số sao & Nhập feedback
        ▼
[ React (DiagnosisRatingModal.jsx) ]
        │ (2) Gửi POST /api/reviews (JSON body: historyId, isAccurate, rating, feedback)
        ▼
[ Backend (DiagnoseReviewController.java) ]
        │ (3) Gọi reviewService.submitReview(email, request)
        ▼
[ DiagnoseReviewService.java ]
        │
        ├─(4) Xác thực người dùng hiện tại có đúng là người sở hữu lịch sử chẩn đoán này không
        ├─(5) Tìm hoặc tạo mới bản ghi đánh giá trong bảng `diagnose_reviews`
        ├─(6) Lưu đánh giá vào Database
        ▼
[ React (DiagnosisRatingModal.jsx) ]
        │ (7) Nhận Response 200 OK -> Đóng modal & Hiển thị thông báo cảm ơn
        ▼
[ Giao diện cập nhật nút "Đã đánh giá" ]
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [DiagnoseController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java)
* **Vai trò:** Tiếp nhận request HTTP POST chẩn đoán bệnh từ client.
* **Đặc điểm thiết kế:**
  * Nhận dữ liệu dạng `MULTIPART_FORM_DATA_VALUE` do client gửi ảnh file nhị phân.
  * Sử dụng `@Valid @ModelAttribute DiagnoseRequest request` để tự động binding các tham số form-data vào DTO và validate dữ liệu.
  * Tích hợp `Principal principal` để trích xuất email của người dùng nếu họ đã đăng nhập. Nếu người dùng chưa đăng nhập (GUEST), `principal` sẽ là `null`. Hệ thống vẫn cho phép chẩn đoán nhưng sẽ không lưu lịch sử để xem lại sau.

#### B. [DiagnoseService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java)
* **Vai trò:** Nhạc trưởng điều phối toàn bộ nghiệp vụ chẩn đoán bệnh.
* **Hàm cốt lõi:**
  * `diagnose(String email, DiagnoseRequest request)`: Thực hiện validate đầu vào, lưu lịch sử pending, upload ảnh, gọi song song AI & Weather, chạy Rule Engine và LLM Guidance, cuối cùng cập nhật lịch sử hoàn thành.

#### C. [VisionAIService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java)
* **Vai trò:** Kết nối đến server Deep Learning chuyên dụng (YOLO/ResNet) chạy ở cổng 8010 để nhận diện bệnh từ ảnh.
* **Logic xử lý:**
  * Tải ảnh từ Cloudinary xuống bộ nhớ dưới dạng mảng byte (`byte[]`).
  * Đóng gói mảng byte vào `ByteArrayResource` và gửi qua HTTP POST dạng `multipart/form-data` đến endpoint dự báo.
  * Parse JSON kết quả để lấy danh sách nhãn bệnh và độ tin cậy.

#### D. [DiagnosisValidationService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java)
* **Vai trò:** Đảm bảo tính toàn vẹn dữ liệu đầu vào.
* **Logic xử lý:**
  * Kiểm tra ảnh tải lên có rỗng không và có đúng định dạng ảnh không (`contentType.startsWith("image/")`).
  * Kiểm tra loại cây trồng có tồn tại trong hệ thống và đang hoạt động không (`isActive` = true và `isDelete` = false).

#### E. [DiagnoseHistoryService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java)
* **Vai trò:** Quản lý truy vấn lịch sử chẩn đoán của người dùng.
* **Logic xử lý:**
  * Hỗ trợ tìm kiếm phân trang (`Pageable`) kèm theo lọc thời gian (`fromDate`, `toDate`).
  * Thực hiện parse snapshot dữ liệu JSON lưu trong trường `treatment_data` để dựng lại chi tiết kết quả chẩn đoán cũ (bao gồm phác đồ điều trị, hoạt chất thuốc bảo vệ thực vật, cảnh báo tương tác...).

#### F. [DiagnoseReviewService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java)
* **Vai trò:** Tiếp nhận đánh giá của nông dân về kết quả AI.
* **Logic xử lý:**
  * Thực hiện kiểm tra quyền sở hữu nghiêm ngặt: Đảm bảo người gửi đánh giá chính là chủ nhân của lần chẩn đoán đó.

#### G. [TreatmentRankingService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentRankingService.java)
* **Vai trò:** Lập thứ tự ưu tiên và đánh giá các phác đồ điều trị ứng viên cho từng bệnh được phát hiện, chọn ra phác đồ khuyên dùng tối ưu nhất.
* **Logic xử lý:**
  * **Xác định danh sách ưu tiên:** Sắp xếp các bệnh được phát hiện theo độ tin cậy (`confidence` giảm dần), sau đó theo ID bệnh (`diseaseId` tăng dần) để đảm bảo độ chính xác và ổn định.
  * **Phân lô đề xuất (Batching):** Lọc ra tối đa Top N bệnh (cấu hình qua `gemini.recommend.max-diseases`, mặc định là 5) để gộp chung gửi sang Gemini.
  * **Luồng chạy Batch:** Gọi `aiService.recommendTreatmentsBatch` để gửi duy nhất 1 cuộc gọi API, thay vì gọi tuần tự tốn kém.
  * **Luồng Sequential cũ:** Nếu `gemini.recommend.batch.enabled = false`, tự động chạy vòng lặp di sản tuần tự.
  * **Xác thực và Fallback chặt chẽ:** Đối chiếu `recommendedPlanId` của Gemini với danh sách candidate plans trong DB. Nếu không khớp hoặc có lỗi/timeout/cooldown, tất cả các phác đồ ứng viên của bệnh đó được gán `recommended = false` (không gắn khuyến nghị giả).

#### H. [AIService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AIService.java)
* **Vai trò:** Kết nối trực tiếp đến Google Gemini API bằng LangChain4j, chịu trách nhiệm sinh guidance và nhận diện/đề xuất phác đồ điều trị.
* **Logic xử lý:**
  * **Cấu hình tối ưu:** Duy trì `recommendModel` chuyên dụng với nhiệt độ thấp (`temperature = 0.1` để tránh ảo tưởng), chế độ JSON format bắt buộc, và thời hạn timeout (`timeout = 20s`).
  * **Bộ ngắt mạch gọn nhẹ (Lightweight Circuit Breaker):** Khi phát hiện lỗi mạng nặng (Timeout, lỗi Quota 429, lỗi Server 5xx), hệ thống sẽ kích hoạt trạng thái "Nguội" (cooldown) trong 30 giây bằng biến nguyên tử `AtomicLong recommendUnavailableUntil`. Trong thời gian cooldown, mọi yêu cầu đề xuất qua Gemini sẽ bị bỏ qua và trả về `null` ngay lập tức để giải phóng hệ thống. Bộ đếm sẽ tự động reset về 0 khi có 1 yêu cầu thành công.
  * **Phân tích cú pháp hai lớp:** Hàm `parseBatchResponse` hỗ trợ parse định dạng JSON trả về từ Gemini bằng cách thử parse wrapper `{"items": [...]}` trước, nếu thất bại sẽ thử parse trực tiếp mảng JSON `[...]` để đảm bảo tỷ lệ parse thành công cao nhất.

---

### 3.2. Các Component quan trọng phía Frontend

#### A. [DiagnosisPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
* **Vai trò:** Trang giao diện chính cho tính năng chẩn đoán.
* **Logic xử lý:**
  * Sử dụng custom hook `useLocationPermission()` để lấy tọa độ kinh độ/vĩ độ của người dùng nếu họ cấp quyền GPS.
  * Gọi API `GET /api/crop-types` để hiển thị danh sách cây trồng cho nông dân chọn.
  * Sử dụng `URL.createObjectURL(file)` để tạo URL xem trước ảnh trước khi tải lên.
  * Gửi request chẩn đoán qua Axios bằng `FormData` để upload file nhị phân.
  * Khi nhận response, truyền dữ liệu tương ứng vào các panel con: `DiagnoseResultPanel` (kết quả bệnh), `DiagnoseWeatherCards` (thời tiết), `DiagnoseSprayProgramsPanel` (phác đồ điều trị), `DiagnoseInteractionWarnings` (cảnh báo tương tác thuốc).

#### B. [DiagnosisRatingModal.jsx](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/components/DiagnosisRatingModal.jsx)
* **Vai trò:** Hộp thoại cho phép người dùng chấm điểm sao (1-5), chọn xem AI chẩn đoán có chính xác không (`isAccurate`) và nhập ý kiến đóng góp.

---

## 4. Giải thích kỹ thuật sử dụng trong code

### 4.1. Asynchronous Parallel Processing với `CompletableFuture`
Trong `DiagnoseService.java` (dòng 59-65):
```java
CompletableFuture<List<VisionResultDTO>> visionFuture = CompletableFuture.supplyAsync(
        () -> visionDetectionPort.detect(imageUrl));
CompletableFuture<WeatherDTO> weatherFuture = CompletableFuture.supplyAsync(
        () -> fetchWeatherSafely(request));

List<VisionResultDTO> visionResults = visionFuture.join();
WeatherDTO weather = weatherFuture.join();
```
* **Tại sao cần dùng?** Cả việc gọi server Vision AI để nhận diện ảnh và gọi API OpenWeatherMap để lấy thông tin thời tiết đều là các tác vụ I/O qua mạng chậm (Network I/O bound). Nếu chạy tuần tự (gọi xong AI mới gọi Weather), tổng thời gian phản hồi của API chẩn đoán sẽ bằng:
  $$\text{Tổng thời gian} = \text{Thời gian AI} + \text{Thời gian Weather}$$
  Bằng cách sử dụng `CompletableFuture.supplyAsync()`, Spring Boot sẽ chạy 2 tác vụ này song song trên các thread khác nhau của Thread Pool. Tổng thời gian xử lý lúc này chỉ bằng:
  $$\text{Tổng thời gian} = \max(\text{Thời gian AI}, \text{Thời gian Weather})$$
  Điều này cải thiện đáng kể trải nghiệm người dùng (UX), giảm thiểu tình trạng nông dân phải chờ đợi xoay vòng quá lâu trên ứng dụng di động/web.

### 4.2. Multipart Form Data Binding
Đăng tải hình ảnh bắt buộc sử dụng định dạng `multipart/form-data`. Ở Backend Spring Boot:
* Sử dụng `@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)` để báo cho Spring Security và Spring MVC biết request này chứa file nhị phân.
* Sử dụng `@ModelAttribute DiagnoseRequest request` thay vì `@RequestBody`. Đây là một điểm cần chú ý: `@RequestBody` dùng để parse JSON body từ chuỗi ký tự, còn `@ModelAttribute` dùng để binding các trường form-data (bao gồm cả các trường văn bản thường và các đối tượng `MultipartFile` nhị phân) vào DTO Java.

### 4.3. Tối ưu hóa độ trễ & chi phí LLM với Batching Gemini Recommendations
* **Mục tiêu:** Cắt giảm độ trễ (latency) khi chẩn đoán nhiều bệnh cùng lúc trên một ảnh lá cây.
* **Cách thực hiện:** Thay vì duyệt tuần tự từng bệnh và thực hiện N cuộc gọi HTTP riêng biệt sang Gemini (gây tích lũy thời gian phản hồi: $T_{\text{tổng}} = \sum_{i=1}^N T_{\text{Gemini}, i}$), hệ thống gom toàn bộ thông tin của tối đa Top 5 bệnh ưu tiên và toàn bộ danh sách phác đồ ứng viên vào một Prompt phân cấp duy nhất.
* **Cơ chế hoạt động:**
  - LLM trả về cấu trúc JSON được bọc trong đối tượng wrapper `{"items": [{"diseaseId": 1, "recommendedPlanId": 10, "reasoning": "..."}]}` hoặc mảng JSON thuần `[...]`.
  - Nhờ việc gộp (batching) này, tổng thời gian chọn phác đồ chỉ tốn đúng **1 cuộc gọi Gemini duy nhất** ($T_{\text{tổng}} \approx \max(T_{\text{Vision}}, T_{\text{Weather}}) + T_{\text{Gemini\_Batch}}$), giúp giảm độ trễ chẩn đoán tổng thể từ trung bình 8-15 giây xuống dưới 3-4 giây khi có nhiều bệnh phát hiện đồng thời.
  - **Cô lập lỗi:** Nếu Gemini gặp sự cố (bị timeout hoặc trả về JSON sai định dạng), hệ thống tự động ghi nhận log và thực hiện fallback an toàn (không đánh dấu phác đồ khuyên dùng), đảm bảo luồng chẩn đoán chính vẫn trả về kết quả cho nông dân bình thường mà không bị ngắt quãng.

---

## 5. Database & Query Analysis

### 5.1. Thiết kế lược đồ bảng (Schema Design)

Mối quan hệ cơ sở dữ liệu cho tính năng chẩn đoán được thiết kế như sau:

```
[users] 1 ─────── N [diagnose_histories] 1 ─────── N [diagnose_history_details]
                           │                                  │
                           │ N                                │ N
                           ▼ 1                                ▼ 1
                     [crop_types]                         [diseases]
```

### 5.2. Kỹ thuật JSON Snapshot Storage (Document Pattern)
Trong bảng `diagnose_history_details`, cột `treatment_data` được thiết kế dưới dạng `TEXT` chứa chuỗi định dạng JSON (được parse thành `DiagnosisDetailSnapshotDTO`).
* **Tại sao không thiết kế chuẩn hóa (Normalize) thành nhiều bảng SQL quan hệ?**
  * **Đóng băng dữ liệu lịch sử:** Trong nông nghiệp, thông tin thuốc bảo vệ thực vật, phác đồ phun thuốc, các cảnh báo hoạt chất và thông tin thời tiết thay đổi liên tục. Nếu dùng khóa ngoại liên kết trực tiếp đến bảng danh mục thuốc hiện tại, khi admin chỉnh sửa thông tin thuốc đó ở tương lai, toàn bộ lịch sử chẩn đoán của nông dân ở quá khứ sẽ bị thay đổi theo. Việc lưu snapshot JSON giúp đóng băng toàn bộ thông tin tại thời điểm chẩn đoán diễn ra, đảm bảo tính trung thực của lịch sử.
  * **Hiệu năng truy vấn (Performance):** Khi người dùng muốn xem lại chi tiết một lần chẩn đoán, thay vì phải JOIN 7-8 bảng khác nhau (History, Detail, Disease, Treatment, SprayProgram, Warnings, Weather...) gây áp lực lớn cho CPU của Database, hệ thống chỉ cần query 1 câu lệnh đơn giản dựa trên ID lịch sử và nạp chuỗi JSON lên ứng dụng để parse.
* **Nhược điểm:**
  * Hệ thống mất khả năng tìm kiếm SQL chuẩn trên các trường nằm trong JSON (ví dụ không thể dễ dàng viết query: "Tìm tất cả các lượt chẩn đoán mà thuốc hoạt chất Abamectin được đề xuất" vì dữ liệu nằm trong chuỗi JSON). Đây là sự đánh đổi (trade-off) hợp lý vì tính năng xem lịch sử chẩn đoán chỉ cần truy vấn theo User ID và Thời gian.

---

## 6. Kiến trúc & Design Pattern

### 6.1. Pending State Pattern (Mẫu trạng thái chờ)
Trong `DiagnoseService.java`, trước khi thực hiện upload ảnh lên Cloudinary và gọi các API bên ngoài, hệ thống sẽ lưu trước bản ghi lịch sử với trạng thái `PENDING`:
```java
DiagnoseHistory history = createPendingHistoryIfAuthenticated(context, request);
```
Nếu quá trình upload Cloudinary thất bại, hoặc server AI/Weather gặp sự cố mạng, hệ thống sẽ bắt exception trong khối `try-catch` và chuyển trạng thái bản ghi lịch sử này thành `FAILED` trong database:
```java
catch (Exception exception) {
    markHistoryFailed(history);
    ...
}
```
* **Tại sao áp dụng?** Việc tương tác với các bên thứ ba (Cloudinary, Python AI API, Weather API) luôn tiềm ẩn rủi ro lỗi mạng hoặc sập server bất ngờ. Nếu chúng ta không lưu trước trạng thái `PENDING` mà đợi đến cuối mới lưu cả bản ghi, khi xảy ra lỗi ở giữa chừng, toàn bộ transaction bị rollback và hệ thống sẽ không có bất kỳ vết tích nào về việc người dùng đã cố gắng thực hiện chẩn đoán. Việc lưu trạng thái `PENDING` và cập nhật thành `FAILED` giúp đội ngũ vận hành (Operations) dễ dàng theo dõi tỷ lệ lỗi chẩn đoán thực tế để kịp thời xử lý.

---

## 7. Điểm chưa tối ưu (Technical Debt)

### 7.1. Tải và truyền file ảnh trung gian gây lãng phí tài nguyên (Double Network Hop)
Trong `VisionAIService.java` (dòng 36):
```java
byte[] imageBytes = downloadImage(imageUrl);
```
* **Giải thích:** Client tải ảnh lên Java Server -> Java Server tải ảnh lên Cloudinary -> Cloudinary trả về URL ảnh -> Java Server lại tải ảnh đó từ Cloudinary về bộ nhớ RAM của mình (`downloadImage`) -> Java Server gửi mảng byte ảnh này qua RestTemplate tới Python AI Server.
* **Tác hại:** Việc này tạo ra **Double Network Hop** (tải lên rồi lại tải xuống liên tục). Java Server phải gánh một lượng băng thông mạng vô cùng lớn và tốn RAM để lưu trữ mảng byte của ảnh trong bộ nhớ trước khi chuyển tiếp. Khi có hàng trăm nông dân chẩn đoán cùng lúc, server Java dễ bị nghẽn băng thông mạng hoặc hết bộ nhớ Heap (OutOfMemoryError).

### 7.2. Đồng bộ hóa I/O chặn Thread Pool (`CompletableFuture.join()`)
Trong `DiagnoseService.java` (dòng 64-65):
```java
List<VisionResultDTO> visionResults = visionFuture.join();
WeatherDTO weather = weatherFuture.join();
```
* **Giải thích:** Việc gọi `.join()` ngay lập tức sau khi khởi chạy các tác vụ bất đồng bộ biến tiến trình này thành đồng bộ cưỡng bức tại thời điểm đó. Thread chính của request sẽ bị chặn (blocked) chờ cho đến khi cả 2 tác vụ chạy xong. Điều này làm giảm hiệu suất của mô hình non-blocking.

---

## 8. Hướng tối ưu (Refactoring Code)

### 8.1. Khắc phục vấn đề Double Network Hop
**Giải pháp:** Thay vì Java Server phải tải ảnh về rồi gửi sang Python AI Server, ta hãy cấu hình để Python AI Server nhận trực tiếp URL ảnh. Java Server chỉ cần gửi một JSON chứa `imageUrl` sang Python AI Server. Python AI Server (thường có hiệu năng xử lý ảnh tốt bằng các thư viện C++ dưới nắp máy) sẽ tự tải ảnh từ Cloudinary về xử lý.

#### [TRƯỚC] VisionAIService gửi file nhị phân
```java
// Tải ảnh về RAM Java gây tốn bộ nhớ và băng thông
byte[] imageBytes = downloadImage(imageUrl);
ByteArrayResource imageResource = new ByteArrayResource(imageBytes);
MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
body.add("image", new HttpEntity<>(imageResource, createFileHeaders()));
...
restTemplate.exchange(predictUrl, HttpMethod.POST, requestEntity, String.class);
```

#### [SAU] VisionAIService gửi JSON chứa URL ảnh
```java
// Chỉ gửi URL ảnh siêu nhẹ, không tốn RAM và băng thông truyền file nhị phân
VisionAIRequest aiRequest = new VisionAIRequest(imageUrl);
HttpEntity<VisionAIRequest> requestEntity = new HttpEntity<>(aiRequest, headers);
ResponseEntity<String> response = restTemplate.exchange(
        predictUrl, HttpMethod.POST, requestEntity, String.class);
```

---

## 9. Mindset của Senior Developer

Khi thiết kế một hệ thống tích hợp AI và dịch vụ bên ngoài, một Senior Developer luôn đặt ra các câu hỏi và giải pháp sau:
1. **Cô lập lỗi (Fault Isolation):** Các dịch vụ AI hay Thời tiết của bên thứ ba có thể sập bất cứ lúc nào. Hệ thống chẩn đoán của chúng ta phải hoạt động theo nguyên tắc **Graceful Degradation** (Suy giảm chất lượng an toàn). Ví dụ: Nếu Weather API sập, hệ thống vẫn phải trả về kết quả chẩn đoán bệnh từ AI bình thường (chỉ bỏ qua phần cảnh báo thời tiết). Điều này thể hiện qua việc bọc `fetchWeatherSafely` trong block `try-catch` riêng biệt.
2. **Quản lý tài nguyên bất đồng bộ:** Sử dụng `CompletableFuture` chạy song song giúp tăng tốc độ phản hồi API, nhưng phải cấu hình một **Custom Thread Pool Executor** riêng cho nó. Nếu dùng thread pool mặc định của hệ thống (`ForkJoinPool.commonPool()`), một dịch vụ AI bị chậm có thể chiếm dụng toàn bộ luồng của hệ thống, gây sập hoặc treo toàn bộ các API thông thường khác của Spring Boot.

---

## 10. Kết luận cho feature

Tính năng AI Crop Disease Diagnosis thể hiện sự kết hợp hài hòa giữa lập trình bất đồng bộ (`CompletableFuture`), kiến trúc lưu trữ Snapshot JSON thực dụng và cơ chế xử lý lỗi an toàn (`Pending State`). Việc nhận diện các điểm nghẽn I/O trung gian (Double Network Hop) giúp chúng ta có hướng đi đúng đắn để tối ưu hóa hiệu năng hệ thống khi ứng dụng mở rộng quy mô phục vụ hàng triệu nông dân.
