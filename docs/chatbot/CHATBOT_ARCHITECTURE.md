# Tài liệu Kỹ thuật: Kiến trúc Chatbot AgriAI

## 1. Tổng quan

Chatbot AgriAI được xây dựng theo mô hình **RAG đơn giản hóa** (Retrieval-Augmented Generation). Thay vì pipeline AI phức tạp nhiều lớp, hệ thống hoạt động theo nguyên tắc:

> **Tìm dữ liệu từ DB → Ghép vào Prompt → AI trả lời**

Kết quả là AI vừa chính xác (nhờ DB), vừa tự nhiên (nhờ kiến thức AI).

---

## 2. Sơ đồ Luồng Hoạt động

```
[Người dùng] → POST /api/chat/sessions/{id}/messages
                        │
                        ▼
               ChatController.sendMessage()
                        │
                        ▼
               ChatbotService.chatForSession()
                        │
               ┌────────┴──────────────────────────────┐
               │        BƯỚC 1: Lưu câu hỏi            │
               │  chatMessageService.saveUserMessage()  │
               └────────┬──────────────────────────────┘
                        │
               ┌────────┴──────────────────────────────────────────────┐
               │       BƯỚC 2-4: buildContextAndGenerate()             │
               │                                                        │
               │  2a. DiseaseLookupService.resolveExplicitDisease()    │
               │       → Tìm tên bệnh trong text → Khớp với DB        │
               │                                                        │
               │  2b. TreatmentLookupService.findByDisease()           │
               │       → Lấy phác đồ điều trị (nếu có bệnh)           │
               │                                                        │
               │  2c. DrugInteractionChecker.buildInteractionWarnings() │
               │       → Kiểm tra xung đột hoạt chất (nếu có thuốc)   │
               │                                                        │
               │  3.  buildPrompt() → Ghép ngữ cảnh DB + câu hỏi      │
               │                                                        │
               │  4.  chatModel.generate(prompt) → Gọi DeepSeek API   │
               └────────┬──────────────────────────────────────────────┘
                        │
               ┌────────┴──────────────────────────────┐
               │        BƯỚC 5: Lưu câu trả lời        │
               │  chatMessageService.saveAiMessage()   │
               │  chatSessionService.updateLastMessage()│
               └────────┬──────────────────────────────┘
                        │
                        ▼
               ChatResponse → [Trả về Frontend]
```

---

## 3. Giải thích Chi tiết Từng Hàm

### 3.1. `chatForSession(email, sessionId, request)`

**Vai trò:** Điểm vào chính cho người dùng đã đăng nhập.

**Tại sao thiết kế vậy?**

- Xác minh quyền sở hữu session trước (`getSessionOrThrow`) để tránh người dùng A đọc được chat của người dùng B.
- Lưu câu hỏi người dùng **trước** khi gọi AI: đảm bảo lịch sử được ghi nhận dù AI có gặp lỗi.
- Tách riêng logic xử lý AI vào `buildContextAndGenerate()` để hàm này dễ đọc và hàm kia dễ test.

---

### 3.2. `buildContextAndGenerate(userText)`

**Vai trò:** Trái tim của chatbot — kết hợp dữ liệu DB và AI.

**Tại sao thiết kế vậy?**

- Tách hàm này ra riêng để cả `chatAsGuest()` và `chatForSession()` đều dùng chung một logic xử lý AI. Không lặp code.
- `Optional<Disease>` trả về từ `resolveExplicitDisease` cho phép xử lý an toàn case không tìm thấy bệnh mà không cần `if (disease != null)`.

**Logic:**

```
resolveExplicitDisease("lúa bị đạo ôn", null)
  → Tìm trong DB theo diseaseName, diseaseNameEn, diseaseCode
  → Trả về Optional.of(Disease{name="Đạo ôn"})

findByDisease(disease)
  → SELECT * FROM treatment_plan WHERE disease_id = X AND is_delete = false
  → Sắp xếp: isRequired=true lên đầu
  → Trả về [Beam 75WP (bắt buộc), Fuji-One 40EC]

buildInteractionWarnings(plans)
  → Lấy ingredient_id từ mỗi plan
  → Chỉ chạy nếu có >= 2 ingredient khác nhau
  → Truy vấn bảng drug_interaction để tìm cặp xung đột
```

---

### 3.3. `buildDbContextText(disease, plans, warnings)`

**Vai trò:** Chuyển đổi dữ liệu Entity thành đoạn text có cấu trúc cho AI.

**Tại sao thiết kế vậy?**

- AI không hiểu Java Object. Nó cần text thuần. Hàm này đảm nhiệm việc "dịch" dữ liệu sang ngôn ngữ mà AI đọc được.
- Đánh dấu thuốc `(bắt buộc)` giúp AI biết cần ưu tiên gợi ý loại nào trước.
- Tách riêng giúp dễ thay đổi định dạng ngữ cảnh sau này mà không ảnh hưởng logic khác.

**Output mẫu:**

```
[DỮ LIỆU HỆ THỐNG - ưu tiên sử dụng để trả lời chính xác]
Bệnh: Đạo ôn — Bệnh do nấm Magnaporthe oryzae gây ra...
Phác đồ điều trị: Beam 75WP (bắt buộc), Fuji-One 40EC
Cảnh báo xung đột thuốc:
  - Không phun Beam 75WP cùng với thuốc trừ sâu gốc Pyrethroid
```

---

### 3.4. `buildPrompt(question, dbContext)`

**Vai trò:** Tổng hợp System Prompt + DB Context + Câu hỏi người dùng.

**Tại sao thiết kế vậy?**

- **System Prompt** (phần NGUYÊN TẮC TRẢ LỜI) định hướng hành vi AI: tự nhiên, không từ chối, không dùng markdown.
- **DB Context** được chèn vào giữa nếu có, để AI "đọc trước" dữ liệu đã kiểm duyệt.
- **Fallback khi không có DB**: Nếu không tìm thấy bệnh nào, contextSection = "" → AI tự trả lời bằng kiến thức của mình → Chatbot không bao giờ trả lời "Tôi không biết".

---

### 3.5. `generateAnswer(prompt)`

**Vai trò:** Gọi DeepSeek API với cơ chế phòng thủ.

**Tại sao thiết kế vậy?**

- `chatModel == null`: Cho phép app chạy kể cả chưa cấu hình API key. Rất quan trọng cho môi trường phát triển/test.
- `try-catch Exception`: Mạng có thể gặp lỗi, DeepSeek có thể timeout. Không để exception lan ra ngoài làm crash request.
- Check `answer.isBlank()`: Phòng trường hợp AI trả về chuỗi rỗng (bất thường nhưng có thể xảy ra).

---

## 4. Các Công nghệ Sử dụng

| Công nghệ                       | Lý do                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `langchain4j` `OpenAiChatModel` | Tích hợp DeepSeek API theo chuẩn OpenAI, không bị lock-in vào một nhà cung cấp AI cụ thể. |
| `@Nullable OpenAiChatModel`     | Cho phép Bean là `null`, app không crash khi thiếu cấu hình.                              |
| `@Transactional`                | Đảm bảo việc lưu User Message và AI Message là một đơn vị nguyên tử.                      |
| `Optional<Disease>`             | Xử lý an toàn trường hợp không tìm thấy bệnh, không cần kiểm tra null thủ công.           |
| `Stream API`                    | Thu gọn và dùng `Collectors.joining` để nối tên thuốc thành chuỗi text gọn gàng.          |
| `StringBuilder`                 | Xây dựng chuỗi ngữ cảnh DB hiệu quả hơn nối chuỗi thông thường (`+`).                     |

---

## 5. Các Tệp Đã Xóa (Cleanup)

| Tệp đã xóa                             | Lý do xóa                                                 |
| -------------------------------------- | --------------------------------------------------------- |
| `IntentDetectorService`                | Không còn dùng AI để phân tích ý định trước khi trả lời   |
| `KnowledgeAssemblerService`            | Logic được tích hợp trực tiếp vào `ChatbotService`        |
| `PromptBuilderService`                 | Prompt đơn giản, viết thẳng trong `buildPrompt()`         |
| `ReasoningOrchestratorService`         | Không còn dùng Rule Engine phức tạp                       |
| `CropResolverService`                  | Không cần xác định loại cây trồng                         |
| `dto/chat/*`                           | Tất cả DTO dành riêng cho pipeline cũ                     |
| `ChatReference`, `ChatSuggestedAction` | Không còn trả về references hay action gợi ý              |
| `ChatResponseType` enum                | Không còn phân loại AGRI_KNOWLEDGE / OUT_OF_SCOPE         |
| `docs/chatbot/*`                       | Tài liệu mô tả luồng pipeline cũ - thay bằng tài liệu này |

---

## 6. Hướng phát triển tiếp theo (Gợi ý)

- Thêm **lịch sử hội thoại** vào Prompt: Gửi N câu hỏi/trả lời trước để AI hiểu ngữ cảnh hội thoại đang diễn ra.
- Thêm **Fuzzy Search** cho bệnh: Dùng `rankCandidates()` trong `DiseaseLookupService` để tìm bệnh dù người dùng gõ sai chính tả.
- **Streaming response**: Trả về kết quả từng phần (Server-Sent Events) để UX tốt hơn.
