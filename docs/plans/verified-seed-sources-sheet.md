# Verified Seed Sources Sheet

## Mô tả yêu cầu

Cập nhật pipeline build workbook seed để:

1. Tìm thêm dữ liệu thật trên web cho các field còn mơ hồ hoặc thiếu trong `treatment_plan`, ưu tiên:
   - `dosage`
   - `frequency`
   - `display_water_volume`
   - `spray_times`
   - `spray_interval`
2. Dùng cả nguồn tiếng Việt và tiếng Anh khi cần.
3. Tuyệt đối không bịa nguồn, không bịa dữ liệu.
4. Thêm một sheet `sources` vào workbook cuối, với một dòng cho mỗi field để truy vết chính xác từng ô.

## File sẽ sửa

- `D:\AgriAI\scripts\build_verified_seed_workbook.py`

## File đầu ra dự kiến

- `D:\AgriAI\generated\rice-disease-treatment-seed-v8.1-demo-clean-verified-v4.xlsx`
- `D:\AgriAI\generated\rice-disease-treatment-seed-v8.1-demo-clean-verified-v4.provenance.json`

## Kế hoạch thực hiện

1. Đọc lại workbook hiện tại và xác định các row `treatment_plan` còn placeholder hoặc thiếu numeric/source rõ ràng.
2. Mở rộng nguồn crawl bổ sung cho các thuốc và bệnh còn thiếu dữ liệu.
3. Chuẩn hóa provenance theo mức field, không chỉ theo mức row.
4. Sinh sheet `sources` trong workbook:
   - `sheet_name`
   - `row_key`
   - `field_name`
   - `disease_code`
   - `disease_name`
   - `drug_name`
   - `source_url`
   - `source_title`
   - `source_language`
   - `source_note`
   - `fetched_at`
5. Build lại workbook v4.
6. Kiểm tra lại:
   - cấu trúc workbook
   - coverage sheet `sources`
   - các field còn placeholder
   - các field numeric đã parse được

## Tiêu chí hoàn thành

- Workbook cuối có sheet `sources`.
- Mỗi field quan trọng trong `treatment_plan` có thể truy ngược về nguồn thật nếu có dữ liệu.
- Các field không tìm được nguồn vẫn giữ null hoặc note trung thực, không thay bằng suy diễn.
- Không làm hỏng mapping khóa ngoại hiện có của workbook.
