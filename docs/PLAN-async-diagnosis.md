# Plan: Async Diagnosis Trên Endpoint Hiện Tại

Dự án AgriSmart cần tối ưu hóa trải nghiệm người dùng bằng cách chuyển đổi luồng chẩn đoán bệnh cây trồng thành bất đồng bộ (async). 
Mục tiêu là hiển thị kết quả chẩn đoán bệnh và thời tiết tức thời (pha bắt buộc), trong khi phác đồ điều trị, cảnh báo tương tác thuốc và cẩm nang hướng dẫn (pha background) được xử lý song song ở nền và được cập nhật thông qua cơ chế polling từ client.

## User Review Required

> [!IMPORTANT]
> **Khả năng mở rộng (Scale-out):**
> Thiết kế này sử dụng giải pháp lưu trữ Job trong bộ nhớ (`InMemoryDiagnosisJobStore` sử dụng `ConcurrentHashMap` kết hợp dọn dẹp theo thời gian TTL 10 phút). Cách tiếp cận này đơn giản, thực dụng, không thêm thư viện ngoài (theo yêu cầu của đội phát triển). 
> Tuy nhiên, hệ thống tạm thời sẽ chỉ hoạt động chính xác khi chạy ở dạng **Single-Instance** (một server duy nhất). Nếu mở rộng quy mô chạy nhiều server, cần chuyển đổi sang dùng Redis.

> [!WARNING]
> **Lưu lịch sử chẩn đoán ở background:**
> Việc lưu lịch sử chẩn đoán được đẩy xuống thread nền. Nếu quá trình lưu lịch sử vào DB thất bại (ví dụ: lỗi mạng DB, lỗi ràng buộc dữ liệu), trạng thái chung của Job vẫn có thể là `COMPLETED` hoặc `COMPLETED_WITH_WARNING` với `sectionStatus.history = FAILED`. User vẫn xem được phác đồ nhưng sẽ không có history ID để review/rating.

---

## Open Questions

Không còn câu hỏi mở. Các câu hỏi thảo luận đã được thống nhất hoàn toàn trong quá trình debate:
- Đã chọn phương án thêm endpoint `/api/diagnosis/async` thay vì sửa đổi endpoint hiện tại để đảm bảo tương thích ngược.
- Thiết kế `DiagnosisJobStore` interface độc lập để sẵn sàng chuyển sang Redis khi cần.
- Xử lý Thread nền sử dụng tham số tường minh (email/context), không phụ thuộc vào `SecurityContext`.
- Giao diện Client thực hiện polling tối đa 30s-45s, có cơ chế dọn dẹp (cleanup) đầy đủ khi đổi ảnh/unmount.

---

## Proposed Changes

### 1. Backend Components

#### [NEW] [DiagnosisJobStore.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisJobStore.java)
- Định nghĩa interface quản lý lưu trữ trạng thái Job chẩn đoán.
```java
package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.DiagnosisJobResponse;
import java.util.Optional;

public interface DiagnosisJobStore {
    void put(String jobId, DiagnosisJobResponse job);
    Optional<DiagnosisJobResponse> get(String jobId);
    void remove(String jobId);
}
```

#### [NEW] [InMemoryDiagnosisJobStore.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/InMemoryDiagnosisJobStore.java)
- Implement `DiagnosisJobStore` sử dụng `ConcurrentHashMap`.
- Lưu kèm thời gian tạo/cập nhật của từng Job.
- Tạo một `Scheduled` task chạy mỗi 2-3 phút để dọn dẹp các Job có tuổi thọ vượt quá TTL (mặc định 10 phút) nhằm tránh rò rỉ bộ nhớ.
- Đánh dấu `@Component` và cấu hình chỉ dùng single-instance.

#### [NEW] [SectionStatus.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/enums/SectionStatus.java)
- Enum biểu thị trạng thái của từng phần kết quả:
  - `PENDING`, `LOADING`, `READY`, `FAILED`, `SKIPPED`.

#### [NEW] [DiagnosisJobResponse.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnosisJobResponse.java)
- DTO phản hồi chứa thông tin Job chẩn đoán:
  - `jobId` (String)
  - `overallStatus` (Enum: `PROCESSING`, `COMPLETED`, `FAILED`)
  - `sectionStatus` (Map<String, SectionStatus> chứa trạng thái cho các phần: `disease`, `weather`, `weatherRisk`, `treatment`, `interaction`, `guidance`, `history`)
  - Các trường dữ liệu tương tự như `DiagnoseResponse`: `id` (historyId), `originalImageUrl`, `weather`, `diseases`, `diagnosisType`, `isHealthy`, `treatments`, `interactionWarnings`, `userGuidance`.

#### [MODIFY] [DiagnoseController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java)
- Giữ nguyên endpoint `POST /api/diagnosis` để đảm bảo tương thích ngược.
- Thêm `POST /api/diagnosis/async` nhận multipart, trả về `DiagnosisJobResponse` (partial result kèm `jobId`).
- Thêm `GET /api/diagnosis/jobs/{jobId}` trả về trạng thái và dữ liệu hiện tại của Job, trả về `404 Not Found` nếu không tồn tại Job ID.

#### [MODIFY] [DiagnoseService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java)
- Tách luồng xử lý `diagnose()` hiện tại thành 2 pha chính:
  1. **Pha bắt buộc (Đồng bộ):**
     - Validate input và kiểm tra quyền truy cập.
     - Upload ảnh lên Cloudinary.
     - Chạy song song Vision AI & Weather qua CompletableFuture.
     - Tạo `jobId` ngẫu nhiên (UUID).
     - Khởi tạo `DiagnosisJobResponse` ban đầu với `overallStatus=PROCESSING`.
     - Phân loại: Nếu kết quả chẩn đoán là `HEALTHY` hoặc `UNKNOWN`, đánh dấu các phần không liên quan (`treatment`, `interaction`, `guidance`, `history`) là `SKIPPED` hoặc `COMPLETED`, cập nhật `overallStatus=COMPLETED`, lưu Job vào store và trả về kết quả ngay.
     - Nếu phát hiện bệnh (`DISEASE_DETECTED`), khởi tạo các status `weatherRisk`, `treatment`, `interaction`, `guidance`, `history` ở dạng `PENDING`/`LOADING`, lưu Job vào store, kích hoạt xử lý bất đồng bộ ở background và trả về response partial lập tức.
  2. **Pha xử lý nền (Bất đồng bộ):**
     - Chạy một phương thức chạy nền (dùng `CompletableFuture.runAsync` hoặc `@Async`).
     - Truyền tường minh email của user và thông tin cần thiết vào background thread, không đọc trực tiếp từ ThreadLocal hay SecurityContext.
     - Thực hiện tuần tự các bước:
       - Tính toán Weather Risk -> cập nhật `weatherRisk=READY`, cập nhật Job trong store.
       - Tìm kiếm và sắp xếp Phác đồ (`TreatmentRankingService`) -> cập nhật `treatment=READY`, cập nhật Job trong store.
       - Kiểm tra tương tác thuốc (`DrugInteractionChecker`) -> cập nhật `interaction=READY`, cập nhật Job trong store.
       - Tạo hướng dẫn AI Guidance (`guidancePort.generateGuidance`) -> cập nhật `guidance=READY`, cập nhật Job trong store.
       - Lưu lịch sử vào CSDL nếu người dùng đăng nhập -> cập nhật `history=READY` và lưu `historyId` vào trường `id`, cập nhật Job trong store.
       - Nếu có bất kỳ bước nào lỗi, set trạng thái phần đó thành `FAILED` (giữ nguyên kết quả của các phần thành công khác).
       - Cuối cùng set `overallStatus=COMPLETED` (hoặc `FAILED` nếu toàn bộ background task lỗi nghiêm trọng).

---

### 2. Frontend Components

#### [MODIFY] [diagnosisService.js](file:///d:/AgriAI/agriai_frontend/src/services/diagnosisService.js)
- Thêm hàm `submitDiagnosisAsync(formData)` gửi request tới `POST /api/diagnosis/async`.
- Thêm hàm `getDiagnosisJob(jobId)` gửi request tới `GET /api/diagnosis/jobs/{jobId}`.

#### [MODIFY] [DiagnosisPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- Cập nhật logic submit:
  - Khi submit, gọi `submitDiagnosisAsync`.
  - Nhận kết quả partial đầu tiên, gán ngay vào state `result` để hiển thị ảnh, bệnh và thời tiết.
  - Nếu `overallStatus === 'PROCESSING'`, kích hoạt bộ đếm thời gian polling (Interval) gọi `getDiagnosisJob(jobId)` mỗi 2 giây.
- Triển khai Polling UX Edge Cases:
  - Giới hạn thời gian polling tối đa là 30 giây (hoặc 45 giây). Nếu vượt quá thời gian này mà vẫn chưa hoàn thành, hiển thị thông báo lỗi: *"Phác đồ đang xử lý lâu hơn bình thường, vui lòng thử tải lại sau"* và dừng polling (không xóa kết quả bệnh/thời tiết đã hiện).
  - Tự động xóa/dọn dẹp Interval polling khi component unmount, hoặc khi người dùng chọn ảnh mới, hoặc khi bắt đầu một lượt submit mới.
  - Sử dụng biến tham chiếu (`activeJobIdRef`) để lưu trữ `jobId` đang hoạt động. Nếu có response từ một job cũ trả về sau khi người dùng đã chuyển job mới, lập tức bỏ qua response đó để tránh ghi đè dữ liệu.
  - Thiết lập Skeleton loading (bằng các class Tailwind như `animate-pulse`) đè lên vùng hiển thị Phác đồ điều trị, Cảnh báo tương tác và Hướng dẫn AI khi các phần này có trạng thái là `LOADING` hoặc `PENDING`.
  - Nút rating/review chỉ hiển thị hoặc được enable khi phần `history` đã `READY` (có trường `id` hợp lệ).

---

## Verification Plan

### Automated Tests

#### 1. Backend Integration Tests (`DiagnoseControllerTest.java` & `DiagnosisJobStoreTest.java`)
- Kiểm tra tính đúng đắn của `DiagnosisJobStore` (put, get, remove và TTL cleanup).
- Kiểm tra `POST /api/diagnosis/async` trả về mã 200 kèm theo cấu trúc `DiagnosisJobResponse` chứa `jobId` và trạng thái `PROCESSING`.
- Kiểm tra `GET /api/diagnosis/jobs/{jobId}` trả về trạng thái của job tương ứng hoặc 404 nếu sai ID.
- Kiểm tra với ảnh `HEALTHY` không chạy xử lý background và hoàn thành ngay lập tức.
- Kiểm tra background task cập nhật chính xác trạng thái từng section thành `READY` hoặc `FAILED` khi giả lập lỗi.

#### 2. Frontend Unit/E2E Tests (`diagnosis-ui.spec.js`)
- Giả lập (Mock) API chẩn đoán bất đồng bộ để kiểm tra:
  - Bệnh và thời tiết xuất hiện ngay lập tức sau response đầu tiên.
  - Trạng thái loading skeleton xuất hiện ở phần phác đồ điều trị khi section tương ứng chưa sẵn sàng.
  - Giao diện tự động gửi request polling mỗi 2 giây.
  - Polling dừng chính xác khi nhận trạng thái `COMPLETED` hoặc khi timeout.
  - Thay đổi ảnh hoặc submit mới sẽ hủy polling cũ thành công.

### Manual Verification
1. Mở trang chẩn đoán, chọn một ảnh lá bệnh và loại cây tương ứng, bật GPS.
2. Nhấn **Chẩn đoán ngay**.
3. Xác nhận ảnh lá, nhãn bệnh và thời tiết hiện lên tức thì (< 1-2 giây), trong khi các thẻ Phác đồ, Cảnh báo, Cẩm nang hiện skeleton loading.
4. Đợi 2-4 giây sau, xác nhận các skeleton loading biến mất và phác đồ điều trị cùng hướng dẫn chi tiết hiện lên đầy đủ.
5. Kiểm tra nút **Đánh giá kết quả chẩn đoán** hoạt động chính xác sau khi hoàn thành.
6. Thử nghiệm ngắt kết nối mạng hoặc giả lập lỗi timeout trên client để kiểm tra thông báo cảnh báo xuất hiện đúng thiết kế.
