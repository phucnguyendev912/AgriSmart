# PLAN: Phân tích nguyên nhân chẩn đoán chậm hơn khi đăng nhập

> **Cập nhật lần 4** — Phát hiện thủ phạm thực sự: `@Transactional` khóa connection trong 23 giây chờ AI. Bổ sung Option G (Giải pháp triệt để).

## 1. Mô tả vấn đề

Khi user đăng nhập và thực hiện chẩn đoán bệnh cây, thời gian chờ **lâu hơn** so với khi không đăng nhập.
Đặc biệt khi nhiều user thao tác cùng lúc, hệ thống có dấu hiệu nghẽn, treo (contention).

---

## 2. Nguyên nhân đã xác định (Root Cause Analysis)

### 🔴 Nguyên nhân chính: Extra DB operations khi đã xác thực

Toàn bộ sự khác biệt nằm trong `DiagnoseService.diagnose()` và `DiagnoseHistoryPersistenceService`.

#### Luồng khi **KHÔNG đăng nhập** (guest):

```
validate() → upload image → [vision + weather parallel] → buildResponse → return
```

> **Không có thao tác DB nào** ngoài đọc CropType.

#### Luồng khi **ĐÃ đăng nhập**:

```
validate() → DB: userRepository.findByEmail()
           → DB: INSERT DiagnoseHistory (PENDING)
           → upload image
           → [vision + weather parallel]
           → buildResponse
           → DB: UPDATE DiagnoseHistory (COMPLETED)
           → DB: INSERT DiagnoseHistoryDetail (1 row per disease)
           → DB: INSERT DiagnoseTreatmentRecommendation (N rows per detail)
           → CompletableFuture: geocodingService (background, không block)
           → return
```

### Các bước tốn thêm thời gian khi đăng nhập:

| Bước                                                                    | Mô tả                                           | Ước tính delay |
| ----------------------------------------------------------------------- | ----------------------------------------------- | -------------- |
| `userRepository.findByEmail()`                                          | Query DB tìm user                               | ~5-20ms        |
| `INSERT DiagnoseHistory` (PENDING)                                      | Tạo bản ghi chờ                                 | ~10-30ms       |
| `updateHistory()` → `diagnoseHistoryRepository.save()`                  | UPDATE status sang COMPLETED + lưu weather JSON | ~10-30ms       |
| `saveDetails()` → `diagnoseHistoryDetailRepository.save()`              | INSERT detail per disease × số bệnh             | ~10-20ms × N   |
| `saveTreatmentRecommendations()` → `recommendationRepository.saveAll()` | INSERT treatment rows                           | ~10-30ms       |

> **Tổng cộng: ~50-130ms extra** so với guest trong điều kiện bình thường. Có thể tệ hơn nhiều — xem mục N+1 bên dưới.

---

### 🔵 Vấn đề thiết kế: Tại sao lại tạo PENDING trước thay vì lưu 1 lần sau khi xong?

Design hiện tại tốn **2 DB writes** thay vì 1, vì muốn track được các lần chẩn đoán **thất bại**:

```
 INSERT history (PENDING)     ← write #1, trước AI call
   ↓
 [AI call ~2-4 giây]
   ↓ thành công          ↓ exception / crash
 UPDATE → COMPLETED     UPDATE → FAILED
                          ↑ markHistoryFailed() trong catch block
```

Nếu chỉ INSERT sau khi xong:

- AI timeout sau 10 giây → không lưu gì → không biết request đó từng tồn tại
- Server crash giữa AI call → không có record nào

**Câu hỏi thực tế:** FAILED status có đang được dùng ở đâu không (admin dashboard, báo cáo, debug)?

- **Có** → giữ PENDING pattern
- **Không** → bỏ PENDING, chỉ INSERT 1 lần sau khi xong = giảm ngay 1 DB write (~10-30ms)

---

### 🔴 Nguyên nhân nghiêm trọng #2: N+1 queries thực tế

`saveDetails()` thực ra là **vòng lặp lồng nhau**:

```java
// DiagnoseHistoryPersistenceService.java — saveDetails()
for (DetectedDiseaseMatch match : analysis.detectedDiseases()) {  // vòng ngoài: per disease
    diagnoseHistoryDetailRepository.save(detail);                  // 1 INSERT
    saveTreatmentRecommendations(detail, match.disease().getId(), ...);
    // saveTreatmentRecommendations: loop nội bộ qua treatments
    // → recommendationRepository.saveAll(recommendations)         // 1 INSERT batch per disease
}
```

Ví dụ thực tế: detect **3 bệnh**, mỗi bệnh **4 treatment**:

```
1 × INSERT DiagnoseHistory (PENDING)
  + 1 × INSERT DiagnoseHistory (UPDATE COMPLETED)
  + 3 × INSERT DiagnoseHistoryDetail          = 3 queries
  + 3 × saveAll(4 recommendations each)       = 3 queries (batch)
  + 1 × findByEmail
─────────────────────────────────────────────────────
= 9 queries đồng bộ, tuần tự trước khi return
```

> Nếu không dùng `saveAll()` mà dùng `save()` từng cái: **15 queries riêng lẻ**.
> Code hiện tại đã dùng `saveAll()` nên đây là 9, nhưng vẫn còn tối ưu được.

---

### 🟠 Nguyên nhân NGHIÊM TRỌNG NHẤT: Lỗi quản lý Transaction khóa Connection 23 giây!

Dựa trên Trace Log chạy thực tế, **thời gian ghi DB chỉ mất vỏn vẹn 216ms** (54ms + 162ms), nhưng tổng thời gian chẩn đoán lên tới **23.2 giây**.

Thủ phạm "ăn" thời gian thực sự là các tác vụ gọi API ra bên ngoài:

- `upload()`: **2.19 giây**
- `vision + weather`: **1.9 giây**
- `ruleEngineService()`: **8.48 giây** (Giao tiếp LLM)
- `buildResponse & guidance()`: **10.3 giây** (Giao tiếp LLM)

**TẠI SAO LẠI BỊ NGHẼN KHI ĐĂNG NHẬP?**
Trong `DiagnoseService.java`, toàn bộ class đang bị gắn `@Transactional`:

```java
@Service
@Transactional(noRollbackFor = AppException.class) // <--- LỖI CHÍNH LÀ ĐÂY
public class DiagnoseService { ... }
```

Vì Guest (người dùng chưa đăng nhập) không kích hoạt các lệnh Insert DB, Spring có thể không hold connection hoặc release sớm.
Nhưng với User đăng nhập:

1. Spring rút 1 connection từ DB Pool ngay từ đầu hàm `diagnose()`.
2. Connection bị **khóa cứng** trong suốt 23.2 giây chờ AI/LLM xử lý.
3. Nếu 10 user cùng bấm chẩn đoán, toàn bộ DB Pool (mặc định 10 connections) sẽ bị cạn kiệt trong 23 giây. Bất kỳ ai request thêm sẽ bị lỗi `Connection Timeout`.

> Đây là một **Anti-pattern cực kỳ nguy hiểm** trong Spring Boot (Hold DB connection over external network calls). Nguyên nhân gốc của mọi sự chậm trễ và nghẽn hệ thống đều từ dòng `@Transactional` này mà ra.

### 🟡 Nguyên nhân phụ: Token refresh interceptor (Frontend)

Trong `api.js`, response interceptor tự động gọi `refreshToken()` khi nhận 401.  
Nếu token **vừa hết hạn**, luồng sẽ:

```
POST /api/diagnosis → 401
  → POST /api/auth/refresh-token (~100-300ms)
  → Retry POST /api/diagnosis (~toàn bộ thời gian chẩn đoán)
```

> Trong trường hợp xấu nhất, **tổng thời gian tăng gấp đôi** vì retry lại từ đầu.

---

## 3. Phân tích chi tiết code

### Backend: `DiagnoseService.java` (line 55-106)

```java
public DiagnoseResponse diagnose(String email, DiagnoseRequest request) {
    // [LOGGED IN ONLY] Query DB user + CREATE history record
    DiagnoseHistory history = createPendingHistoryIfAuthenticated(context, request);

    // [BOTH] Upload + Vision + Weather (parallel)
    ...

    // [LOGGED IN ONLY] UPDATE history + INSERT details + INSERT treatments
    if (history != null) {
        historyPersistenceService.updateHistory(history, imageUrl, weather, Status.COMPLETED);
        historyPersistenceService.saveDetails(history, response, analysis);
        runGeocodingInBackground(...); // async, không block
    }

    return response;
}
```

### Backend: `DiagnoseHistoryPersistenceService.java` (line 51-86)

`saveDetails()` thực hiện N+1 DB calls theo số bệnh phát hiện:

- 1 INSERT `DiagnoseHistoryDetail` per disease
- N INSERT `DiagnoseTreatmentRecommendation` per detail

### Frontend: `api.js` (line 28-55)

Response interceptor retry toàn bộ request khi 401, gây double latency.

---

## 4. Các phương án cải thiện (để thảo luận)

### ⚠️ Lưu ý quan trọng: Race condition nếu dùng async

Nếu chuyển sang async (Option A), phải đảm bảo **thứ tự**:

```
updateHistory()  →  saveDetails()
    ↑
  Phải xong trước vì DiagnoseHistoryDetail có FK → DiagnoseHistory
```

Nếu `saveDetails()` chạy trước `updateHistory()` hoàn thành → FK violation. Cần chain `thenRun()` hoặc dùng `CompletableFuture` tuần tự, không chạy song song hai bước này.

---

### Option F: Bỏ PENDING — INSERT 1 lần sau khi xong (đơn giản nhất)

Thay vì INSERT trước → UPDATE sau, chỉ INSERT **1 lần** sau khi AI xong:

```java
// Bỏ createPendingHistoryIfAuthenticated() ở đầu
// ...
// Sau khi AI xong:
if (email != null) {
    DiagnoseHistory history = buildHistory(context, request, imageUrl, weather, Status.COMPLETED);
    diagnoseHistoryRepository.save(history);   // 1 INSERT duy nhất
    historyPersistenceService.saveDetails(history, response, analysis);
}
```

**Ưu điểm:** Giảm ngay 1 round-trip DB mà không thay đổi kiến trúc. Đơn giản nhất trong tất cả options.  
**Nhược điểm:** Mất tracking FAILED diagnoses (nếu AI crash, không có record). Chỉ phù hợp nếu **FAILED status không được dùng**.

---

### Option A: Lưu lịch sử bất đồng bộ (fire-and-forget)

Chuyển toàn bộ `historyPersistenceService` sang `CompletableFuture.runAsync()`.

**Ưu điểm:** Response time = Guest response time  
**Nhược điểm:** Server crash → mất history. Race condition nếu không chain đúng thứ tự.

### Option B: Batch insert — giảm số queries

Gộp tất cả `DiagnoseHistoryDetail` vào một lần `saveAll()` thay vì loop `save()`.

**Ưu điểm:** Giữ đồng bộ, giảm round-trips, dễ implement  
**Nhược điểm:** Vẫn blocking, không giải quyết hoàn toàn connection contention

### Option C: Proactive token refresh (Frontend)

Kiểm tra token expiry trước khi gửi request, refresh nếu sắp hết hạn thay vì đợi 401.

**Ưu điểm:** Tránh double request khi token hết hạn  
**Nhược điểm:** Cần lưu expiry timestamp ở frontend (localStorage)

### Option D: Outbox Pattern — async an toàn, không mất data

Thay vì fire-and-forget, ghi một row `outbox_jobs` **trong cùng transaction** với response:

```
POST /diagnosis
  → AI diagnosis logic
  → INSERT outbox_jobs {payload: JSON, status: PENDING}  ← cùng TX
  → return response ngay

Background Worker (scheduler mỗi vài giây):
  SELECT * FROM outbox_jobs WHERE status='PENDING'
  → INSERT history / details / treatments
  → UPDATE outbox_jobs SET status='DONE'
```

**Ưu điểm:** Không mất data khi crash (outbox đã committed). Response nhanh như guest.  
**Nhược điểm:** Cần thêm bảng `outbox_jobs` + scheduler. Lịch sử không hiển thị **tức thì** sau chẩn đoán (có độ trễ vài giây).

### Option G: Tối ưu Transaction Boundary (VIÊN ĐẠN BẠC - 100% Khuyên dùng)

Giải quyết triệt để tận gốc vấn đề nghẽn cổ chai mà không cần thay đổi kiến trúc hệ thống.

1. Bỏ `@Transactional` ở class `DiagnoseService`.
2. Chỉ đặt `@Transactional` ở các hàm ghi DB trong `DiagnoseHistoryPersistenceService`.

**Luồng hoạt động sau khi sửa:**

```
[Không giữ DB Connection] Gọi AI, Upload, LLM (Mất 23 giây)
[Lấy DB Connection]       Bắt đầu lưu DB (Batch insert)
[Trả DB Connection]       Ghi xong DB (Mất 200 mili-giây)
```

**Ưu điểm:**

- Giải phóng 100% tình trạng nghẽn DB Pool. Hệ thống có thể phục vụ hàng ngàn người cùng lúc mà không sập DB.
- Không mất dữ liệu (an toàn tuyệt đối do DB vẫn lưu tuần tự).
- Dễ làm, sạch code (chuẩn Enterprise).

---

### Option E: Tách endpoint — Frontend tự lưu

Tách thành 2 endpoint riêng, frontend tự gọi:

```
POST /api/diagnosis       → chỉ chẩn đoán AI, không lưu DB (fast path)
POST /api/diagnosis/save  → lưu result + history (gọi background từ FE)
```

**Ưu điểm:** Giảm tải backend.  
**Nhược điểm:** Rủi ro mất data nếu user rớt mạng/đóng tab trước khi FE gọi `/save`. Sinh ra rác lưu trữ (orphan files) nếu file đã upload nhưng không được lưu DB. Nguy cơ bảo mật nếu FE gửi sai data.

---

## 5. So sánh các options

| Option                     | Response speed          | Data safety        | Complexity   | Recommended                         |
| -------------------------- | ----------------------- | ------------------ | ------------ | ----------------------------------- |
| **G — Tối ưu Transaction** | ⚡ **Chỉ giữ DB 200ms** | ✅ **Tuyệt đối**   | **Rất thấp** | 🌟 **BẮT BUỘC (Silver Bullet)**     |
| F — Bỏ PENDING             | 🟡 Giảm ~20ms           | ✅ An toàn         | Rất thấp     | ✅ Tùy chọn (Nếu không dùng FAILED) |
| B — Batch insert           | 🟡 Giảm roundtrip       | ✅ An toàn         | Rất thấp     | ✅ Nên làm cùng Option G            |
| C — Proactive token        | ⚡ Tránh double         | ✅ An toàn         | Thấp         | ✅ Nên làm ở FE                     |
| D — Outbox Pattern         | ⚡ Rất nhanh            | ✅ An toàn         | Cao          | ❌ Không cần thiết nữa              |
| E — Split endpoint         | ⚡ Rất nhanh            | ❌ Rủi ro mất data | Thấp         | ❌ Không khuyên dùng                |

## 6. Kế hoạch thực thi (Sử dụng Option G + B + F)

Vì lỗi `@Transactional` đã được tìm ra, chúng ta chỉ cần giải quyết gọn gàng ở Backend mà không cần đụng tới cấu trúc Frontend.

### Các thay đổi cụ thể:

| Bước | File                                     | Thay đổi                                                                                                     |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | `DiagnoseService.java`                   | Xóa `@Transactional` ở class level.                                                                          |
| 2    | `DiagnoseHistoryPersistenceService.java` | Thêm `@Transactional` vào các hàm `saveDetails`, `updateHistory`.                                            |
| 3    | `DiagnoseHistoryPersistenceService.java` | (Option B) Sử dụng `saveAll()` cho `DiagnoseHistoryDetail` thay vì gọi `save()` trong vòng lặp.              |
| 4    | `DiagnoseService.java`                   | (Option F) Bỏ bước `createPendingHistory` ở đầu. Chỉ Insert 1 lần sau khi có kết quả để tiết kiệm thêm 54ms. |

---

> Plan file: `docs/PLAN-diagnosis-slow-when-logged-in.md`  
> Cập nhật lần 4 — 2026-05-24
