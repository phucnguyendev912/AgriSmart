# Directory Structure Refactoring Plan

## Goal
Quy hoạch lại toàn bộ cấu trúc thư mục của dự án (Frontend & Backend) để tuân thủ 100% cấu trúc chuẩn trong guideline, đồng thời tuyệt đối không làm mất code và đảm bảo hệ thống vẫn chạy ổn định.

## Tasks
- [ ] Task 1: Khảo sát hiện trạng thư mục `agriai_backend/` và `agriai_frontend/` → Verify: Đưa ra danh sách các file/folder đang sai chuẩn cần di chuyển.
- [ ] Task 2: Refactor Frontend (React) → Verify: Di chuyển file vào `features/`, `components/`, `pages/` (cập nhật imports) và chạy build thành công.
- [ ] Task 3: Refactor Backend (Spring Boot) → Verify: Map đúng các package (`controller`, `service`, `dto`, `exception`), cập nhật lệnh import và compile thành công.
- [ ] Task 4: Kiểm tra toàn vẹn → Verify: Khởi động thử dự án (hoặc chạy test) để xác nhận không vỡ layout, không lỗi API do sai đường dẫn.

## Done When
- [ ] Toàn bộ hệ thống tuân thủ cấu trúc của `PROJECT_GUIDELINES.md`.
- [ ] Mọi imports/exports đều được cập nhật tự động và hệ thống không báo lỗi `Module not found` hay `Cannot resolve variable/class`.
- [ ] Code logic được giữ nguyên vẹn 100%.
