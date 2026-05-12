# Generate Database Insert Script from Excel

This plan outlines the approach to generate a database seed/migration script containing `INSERT INTO` statements from the provided Excel file `treatment_plan_v2.xlsx`.

## User Review Required

> [!IMPORTANT]
> Vui lòng xác nhận những chi tiết sau trước khi bắt đầu tạo file SQL:
> 1. **Phạm vi bảng (Tables):** File Excel có rất nhiều sheet (`disease`, `ingredient`, `drug`, `drug_ingredient`, `treatment_plan`, `disease_weather_condition`, `drug_interaction`, `summary_by_disease`, `sources`). Bạn muốn tạo lệnh INSERT cho **tất cả** các sheet này hay chỉ những bảng liên quan đến các Entity đã cung cấp (`Ingredient`, `Drug`, `DrugIngredient`, `TreatmentPlan`, `DrugInteraction`)?
> 2. **Xử lý ID (Primary Key):** Trong Excel đã có sẵn cột `id`. Bạn muốn chèn cứng `id` từ Excel vào DB (phù hợp cho seed data) hay bỏ qua để DB tự tăng (auto-increment)?
> 3. **Vị trí lưu file:** File `.sql` được sinh ra sẽ lưu ở đâu? Ví dụ: `docker/seed_v9_treatment_plan.sql` hay thư mục `src/main/resources/db/migration/`?
> 4. **Xử lý trùng lặp (Conflict):** Có sử dụng cú pháp `INSERT IGNORE` (MySQL) hoặc `ON CONFLICT DO NOTHING` (PostgreSQL) hay chỉ là `INSERT INTO` thông thường? Dựa vào config dự án, bạn đang dùng PostgreSQL hay MySQL?

## Proposed Changes

### Task Breakdown

1. **Đọc dữ liệu từ Excel:** Sử dụng script Python (với `pandas`) để đọc dữ liệu từ các sheet được chỉ định.
2. **Làm sạch và xử lý dữ liệu:**
   - Xử lý các giá trị `NaN`, null.
   - Chuyển đổi định dạng ngày tháng, boolean (`is_active`, `is_delete`, `is_required`).
   - Xử lý các chuỗi văn bản (escape single quotes `'` thành `''` trong SQL).
3. **Sinh lệnh INSERT theo thứ tự ràng buộc khoá ngoại (Foreign Key):**
   - **Bảng độc lập (No FKs):** `disease`, `ingredient`, `drug`
   - **Bảng phụ thuộc bậc 1:** `disease_weather_condition` (phụ thuộc disease), `drug_ingredient` (phụ thuộc drug, ingredient), `drug_interaction` (phụ thuộc ingredient)
   - **Bảng phụ thuộc bậc 2:** `treatment_plan` (phụ thuộc disease, drug)
4. **Lưu file output:** Ghi toàn bộ lệnh INSERT vào một file `.sql` duy nhất.

### 📝 File cần tạo mới

#### [NEW] [generate_seed.py](file:///d:/AgriAI/generate_seed.py)
Script Python để đọc Excel và sinh file SQL. (Có thể đặt trong thư mục `scripts/` hoặc xoá sau khi chạy xong).

#### [NEW] [seed_treatment_plan_v2.sql](file:///d:/AgriAI/docker/seed_treatment_plan_v2.sql)
File chứa các lệnh `INSERT INTO` đã được sinh ra. (Vị trí chính xác chờ bạn xác nhận).

## Verification Plan

### Manual Verification
- Kiểm tra trực quan file `.sql` xem có bị lỗi escape character (như dấu nháy đơn) không.
- Thử chạy file `.sql` trên database local để đảm bảo không vi phạm ràng buộc khoá chính (PK), khoá ngoại (FK), và Not Null.
