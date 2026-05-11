-- Phase 8: Model Refactoring Cleanup
-- Xóa các cột hiển thị UI cũ không còn sử dụng

ALTER TABLE treatment_plan 
DROP COLUMN display_dosage, 
DROP COLUMN display_water_volume, 
DROP COLUMN frequency;

-- Lưu ý: Cột dosage_type giữ nguyên cấu trúc VARCHAR trong DB, vì EnumType.STRING ánh xạ tương thích trực tiếp.
