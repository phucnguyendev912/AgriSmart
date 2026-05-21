# Workflow: Interactive Agri Chat AI (Trợ lý Nông nghiệp AI Tương tác)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** xây dựng tính năng Trợ lý AI nông nghiệp đa kỹ năng, từ giao diện Widget nổi ở frontend (React) đến các giải pháp kiến trúc RAG tĩnh siêu nhẹ (Lightweight RAG), cơ chế phân loại ý định (Intent Classifier), chuỗi liên kết kỹ năng (Multi-Skill Chain) và giải pháp cô lập transaction trong Spring Boot.

---

## 1. Tổng quan chức năng

AgriBot là một trợ lý ảo thông minh chạy trực tiếp trên ứng dụng, hỗ trợ người nông dân giải đáp mọi thắc mắc về kỹ thuật canh tác, bệnh dịch, và tương tác hóa học giữa các loại thuốc bảo vệ thực vật.

### Các mảnh ghép cấu thành tính năng:
1. **Chatbot Widget:** Giao diện Widget nổi (Float Widget) hiển thị ở góc dưới màn hình trên toàn bộ hệ thống, giúp người dùng mở chat ở bất cứ đâu.
2. **Quản lý Phiên chat (Chat Sessions):** Tự động lưu trữ lịch sử hội thoại của người dùng đã đăng nhập, tự sinh tiêu đề phiên chat từ tin nhắn đầu tiên.
3. **Phân loại Ý định (Intent Classification):** Sử dụng cơ chế lai (Hybrid) kết hợp so khớp từ khóa tĩnh và gọi mô hình ngôn ngữ lớn (LLM) làm fallback để nhận diện ý định nông dân thuộc 4 nhóm chính: Bệnh dịch (`DISEASE`), Phác đồ điều trị (`TREATMENT`), Xung đột thuốc (`CONFLICT`), và Kỹ thuật canh tác (`CULTIVATION`).
4. **Làm giàu ngữ cảnh (Context Enrichment):** Phân tích lịch sử chat để tự động bổ sung chủ ngữ bệnh hại bị thiếu trong các câu hỏi ngắn tiếp theo.
5. **Lightweight RAG Engine (Công cụ RAG nội bộ siêu nhẹ):** Tự động quét, phân tách và chấm điểm các tài liệu tri thức Markdown có sẵn dựa trên tần suất xuất hiện từ khóa và cộng điểm tiêu đề (Heading Boost) để làm đầu vào cho LLM.
6. **Mô hình Ngôn ngữ Lớn (LangChain4j):** Đóng gói ngữ cảnh chuyên môn và lịch sử trò chuyện để sinh câu trả lời ngắn gọn, thân thiện, không chứa định dạng Markdown gây nhiễu cho nông dân.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả quá trình gửi tin nhắn, phân loại ý định, xây dựng ngữ cảnh và trả về tin nhắn phản hồi:

### 2.1. Luồng Gửi và xử lý tin nhắn (Send Message Workflow)

```
[ Nông dân / Admin ]
        │ (1) Nhập câu hỏi (Ví dụ: "Lúa bị đạo ôn phun thuốc gì?") -> Nhấn gửi
        ▼
[ React (ChatBotWidget.jsx) ]
        │ (2) Kiểm tra đăng nhập. Gọi API POST /api/chat/sessions/{id}/messages
        ▼
[ Backend (ChatController.java) ]
        │ (3) Nhận JSON body. Gọi chatbotService.chatForSession(email, sessionId, request)
        ▼
[ ChatbotService.java ]
        │
        ├─(4) Mở TRANSACTION 1:
        │     - Load thông tin Session & Lịch sử tin nhắn gần nhất từ Database.
        │     - Lưu tin nhắn mới của người dùng vào Database.
        │     - Commit & TỰ ĐỘNG ĐÓNG TRANSACTION 1 (Giải phóng Connection DB về pool).
        │
        ├─(5) Phân loại ý định thông qua [IntentClassifier]:
        │     - So khớp từ khóa với các kỹ năng nông nghiệp.
        │     - Nếu điểm số không quá chênh lệch, gọi LLM phân loại (Fallback).
        │
        ├─(6) Phân loại chế độ hỏi thông qua [ChatQueryModeClassifier]:
        │     - Xác định xem là câu hỏi kiến thức chung hay chẩn đoán thực tế tại ruộng.
        │
        ├─(7) Giải quyết chuỗi kỹ năng bằng [MultiSkillChainResolver]:
        │     - Phân tích xem câu hỏi có cần kích hoạt thêm kỹ năng thứ 2 không.
        │       (Ví dụ: Hỏi bệnh lúa kèm từ khóa "trị" -> Chaining: DISEASE + TREATMENT).
        │
        ├─(8) Làm giàu ngữ cảnh (Subject Enrichment) nếu câu hỏi ngắn bị thiếu chủ ngữ.
        │
        ├─(9) Triển khai Lightweight RAG bằng [SkillContextBuilder]:
        │     - Đọc nội dung Markdown tương ứng với kỹ năng đã phân loại.
        │     - Phân tách thành các phân đoạn tiêu đề (Sections).
        │     - Chấm điểm từ khóa + Cộng 5 điểm Heading Boost nếu tiêu đề khớp với bệnh trong câu hỏi.
        │     - Chọn ra các phân đoạn tốt nhất dưới 3000 ký tự làm Context.
        │
        ├─(10) Gọi mô hình AI (LangChain4j) để sinh câu trả lời (Không giữ kết nối Database).
        │
        ├─(11) Mở TRANSACTION 2:
        │      - Lưu tin nhắn phản hồi của AI vào Database.
        │      - Commit & TỰ ĐỘNG ĐÓNG TRANSACTION 2.
        ▼
[ React (ChatBotWidget.jsx) ]
        │ (12) Nhận Response 200 OK
        ▼
[ Hiển thị tin nhắn trả lời của Trợ lý AI và tự động cuộn xuống cuối màn hình ]
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [ChatController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/ChatController.java)
* **Vai trò:** Cung cấp các REST API HTTP để quản lý phiên chat và gửi nhận tin nhắn.
* **Đặc điểm thiết kế:**
  * Không dùng WebSocket: Quyết định sử dụng REST API truyền thống kết hợp xử lý đồng bộ giúp đơn giản hóa việc phân trang tin nhắn cũ, xử lý Authentication bảo mật qua Cookie HttpOnly JWT, và tận dụng cơ chế Connection Pooling của Spring Boot.

#### B. [ChatbotService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/ChatbotService.java)
* **Vai trò:** Lớp trung tâm điều phối nghiệp vụ chat.
* **Đặc điểm thiết kế:**
  * Sử dụng giải pháp **Self-Proxy** (`self`) để tự gọi các phương thức có `@Transactional` trong cùng một lớp, đảm bảo Spring AOP áp dụng đúng hành vi đóng mở giao dịch.
  * Tách biệt logic giao dịch (Transaction Isolation) khi gọi LLM ngoài mạng để tránh nghẽn Connection Pool DB.

#### C. [IntentClassifier.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/IntentClassifier.java)
* **Vai trò:** Phân loại câu hỏi của người nông dân vào đúng nhóm kỹ năng (Kỹ năng: Bệnh hại, Điều trị, Xung đột hoạt chất, Canh tác).
* **Đặc điểm thiết kế:**
  * Thuật toán lai (Hybrid): Quét từ khóa tĩnh trước bằng CPU cục bộ (Fast Path, Zero-cost). Nếu độ lệch điểm giữa 2 kỹ năng quá nhỏ, hệ thống sẽ kích hoạt gọi mô hình LLM làm Fallback (Slow Path, Token cost) để đảm bảo độ chính xác.

#### D. [SkillContextBuilder.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/SkillContextBuilder.java)
* **Vai trò:** Triển khai bộ lọc tri thức (Local RAG) dựa trên tệp Markdown.
* **Hàm cốt lõi:**
  * `scoreSections(sections, query)`: Chấm điểm các phân đoạn bằng cách tính tần suất từ khóa. Tích hợp giải thuật **Heading Boost** cộng 5 điểm nếu tiêu đề chứa từ ghép (Bigram) xuất hiện trong câu hỏi của người nông dân (Ví dụ: "Đốm nâu", "Đạo ôn").

#### E. [MultiSkillChainResolver.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/MultiSkillChainResolver.java)
* **Vai trò:** Tự động xâu chuỗi nhiều kỹ năng dựa trên câu hỏi người dùng.
* **Logic:** Nếu người dùng hỏi về Bệnh hại nhưng có từ khóa "phun", "trị", hệ thống tự nạp thêm ngữ cảnh của cả kỹ năng Điều trị (`TREATMENT`) vào Prompt.

---

### 3.2. Các Component quan trọng phía Frontend

#### A. [ChatBotWidget.jsx](file:///d:/AgriAI/agriai_frontend/src/features/chat/components/ChatBotWidget.jsx)
* **Vai trò:** Widget nổi toàn cục chứa giao diện cửa sổ chat.
* **Logic xử lý:**
  * Quản lý trạng thái mở rộng/thu nhỏ (`isOpen`), trạng thái đang gõ chữ của AI (`isTyping`).
  * Giao diện phân loại thông minh: Cho phép người dùng chủ động chọn nhóm kỹ năng quan tâm thông qua select box (`SKILL_OPTIONS`).
  * Tích hợp thanh bên (Side Panel) trượt ra hiển thị danh sách các cuộc hội thoại cũ (`showHistory`).

---

## 4. Giải thích kỹ thuật sử dụng trong code

### 4.1. Giải pháp cô lập Giao dịch DB khi gọi API bên ngoài (Connection Pool Protection)
Trong `ChatbotService.java` (dòng 62-81):
```java
public ChatResponse chatForSession(String email, Integer sessionId, SendChatMessageRequest request) {
    // TX 1: Mở transaction đọc history + lưu tin nhắn User -> COMMIT & CLOSE
    SessionContext ctx = self.loadHistoryAndSaveUser(email, sessionId, userText);

    // Gọi AI qua Internet (Network I/O) - KHÔNG giữ transaction DB
    String answer = buildContextAndGenerateWithHistory(userText, ctx.history(), request.getSelectedSkill());

    // TX 2: Mở transaction mới lưu tin nhắn AI -> COMMIT & CLOSE
    ChatMessage aiMessage = self.saveAiResponse(ctx.session(), answer);
    ...
}
```
* **Tại sao thiết kế như vậy?** Việc gọi API AI (LangChain4j kết nối sang Gemini/OpenAI) là một tác vụ rất chậm và không ổn định về thời gian phản hồi (mất từ 1-5 giây). Nếu dùng `@Transactional` ở mức method `chatForSession`, Spring Boot sẽ chiếm giữ một database connection trong Pool (HikariCP) suốt 5 giây đó. Khi có 20 nông dân chat đồng thời, toàn bộ connection pool (mặc định size = 10 hoặc 20) sẽ bị chiếm dụng hết để chờ mạng I/O. Ứng dụng sẽ gặp lỗi treo hệ thống (Connection Pool Starvation).
* **Giải pháp của Senior:** Chia nhỏ thành 2 transaction ngắn kết hợp kỹ thuật self-proxy để bọc AOP. Connection chỉ được lấy ra từ pool khi thao tác ghi DB (mất 5-10ms) và trả ngay lập tức trước khi gọi AI.

### 4.2. Giải pháp Self-Proxy trong Spring Boot
```java
@Autowired
@Lazy
private ChatbotService self;
```
* **Giải thích:** Khi gọi phương thức `@Transactional` từ một phương thức khác trong cùng một lớp, Spring AOP sẽ bị bỏ qua (bypass proxy) vì cuộc gọi diễn ra thông qua tham chiếu `this` nội bộ của Java. Để Spring nhận diện và bọc Transaction, chúng ta phải tự tiêm (inject) chính class đó thông qua `@Lazy` (để tránh lỗi vòng lặp phụ thuộc - Circular Dependency) và gọi qua biến `self`.

---

## 5. Database & Query Analysis

### 5.1. Thiết kế lược đồ bảng (Schema Design)

```
[users] 1 ─────── N [chat_sessions] 1 ─────── N [chat_messages]
```

* `chat_sessions` chứa tiêu đề phiên chat (`session_title`) và thời gian tin nhắn cuối cùng (`last_message_at`).
* `chat_messages` chứa nội dung tin nhắn (`message_content`), loại người gửi (`sender_type` - USER hoặc AI).

### 5.2. Giải thuật Lightweight RAG Engine (RAG cục bộ siêu nhẹ)
Thay vì sử dụng một Vector Database đắt đỏ (như pgvector, Pinecone) để thực hiện tìm kiếm ngữ nghĩa (Semantic Search), hệ thống sử dụng thuật toán chấm điểm từ khóa nội bộ (In-memory Keyword Scoring):
1. **Phân tách Markdown:** Cắt tài liệu tri thức thành danh sách các đoạn (`SkillSection`) bằng Regex phân tách các thẻ tiêu đề `##` và `###`.
2. **Score từ đơn:** Đếm số từ trong câu hỏi của người nông dân xuất hiện ở nội dung đoạn.
3. **Heading Boost (Đột phá tiêu đề):** Xây dựng các từ ghép 2 từ (Bigrams - ví dụ: "đạo ôn", "đốm nâu"). Nếu tiêu đề đoạn chứa từ ghép này, phân đoạn đó được cộng đột biến 5 điểm.
4. **Giới hạn ngân sách ký tự (Token Budgeting):** Chỉ chọn các phân đoạn điểm cao nhất sao cho tổng số ký tự tích lũy dưới 3000 ký tự (tránh làm tràn cửa sổ ngữ cảnh của LLM và tối ưu hóa chi phí token).

---

## 6. Kiến trúc & Design Pattern

### 6.1. Hybrid Intent Classifier Pattern
* Hệ thống kết hợp **Fast Path** (So khớp từ khóa cục bộ bằng CPU, độ trễ 0.1ms, chi phí 0$) và **Slow Path** (Gọi LLM phân loại, độ trễ 500ms, chi phí token). Điều này thể hiện tư duy thiết kế hệ thống tối ưu hóa chi phí vận hành (Cost-effective System Design) rất cao của Senior.

---

## 7. Điểm chưa tối ưu (Technical Debt)

### 7.1. Trả lời đồng bộ gây trải nghiệm người dùng kém (Synchronous blocking reply)
* **Giải thích:** API `/api/chat/sessions/{id}/messages` là API chặn đồng bộ. Nông dân gửi tin nhắn lên và phải chờ đợi trình duyệt xoay vòng từ 3-5 giây cho đến khi AI viết xong toàn bộ câu trả lời rồi backend mới trả về một lúc.
* **Tác hại:** Trong các ứng dụng AI hiện đại, người dùng mong muốn nhìn thấy các chữ chạy ra dần dần (Streaming response) để giảm thời gian chờ đợi cảm nhận (Perceived latency). Trả lời đồng bộ làm giao diện có cảm giác bị đơ.

---

## 8. Hướng tối ưu (Refactoring Code)

### 8.1. Chuyển sang SSE (Server-Sent Events) để hỗ trợ AI Streaming
**Giải pháp:** Sử dụng `SseEmitter` của Spring MVC ở Backend kết hợp với API Streaming của LangChain4j (`StreamingChatLanguageModel`) để đẩy từng từ của câu trả lời về Frontend thời gian thực.

#### [TRƯỚC] Trả về đồng bộ chặn
```java
@PostMapping("/sessions/{id}/messages")
public ResponseEntity<ChatResponse> sendMessage(...) {
    return ResponseEntity.ok(chatbotService.chatForSession(...));
}
```

#### [SAU] Trả về dạng luồng (Streaming) bằng SSE
```java
@GetMapping(value = "/sessions/{id}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamMessage(Principal principal, @PathVariable Integer id, @RequestParam String message) {
    SseEmitter emitter = new SseEmitter(60000L);
    chatbotService.streamChat(email, id, message, emitter);
    return emitter;
}
```

---

## 9. Mindset của Senior Developer

1. **Tối ưu hóa chi phí và hiệu năng (Frugal Engineering):** Không dùng dao mổ trâu để giết gà. Việc tự triển khai Local RAG trên RAM với tài liệu Markdown tĩnh là minh chứng cho việc hiểu rõ giới hạn dữ liệu. Vector DB chỉ thực sự cần thiết khi tập dữ liệu tri thức nông nghiệp lên tới hàng trăm ngàn trang tài liệu.
2. **Bảo mật và Phân quyền API:** Ngăn chặn việc người dùng đánh tráo ID phiên chat thông qua kiểm tra logic: `chatSessionService.getSessionOrThrow(email, sessionId)`. Nếu phiên chat đó không thuộc về tài khoản gửi yêu cầu, hệ thống sẽ quăng ngay lỗi `FORBIDDEN (403)` lập tức.

---

## 10. Kết luận cho feature

Tính năng Interactive Agri Chat AI là một bài học tuyệt vời về cách thiết kế ứng dụng tích hợp mô hình AI ngôn ngữ lớn. Bằng cách tách nhỏ Transaction DB để bảo vệ Connection Pool, xây dựng giải pháp Local RAG nội bộ siêu nhẹ dựa trên từ khóa tĩnh và gộp chuỗi kỹ năng thông minh, hệ thống đạt hiệu năng vận hành vượt trội với chi phí hạ tầng tối thiểu.
