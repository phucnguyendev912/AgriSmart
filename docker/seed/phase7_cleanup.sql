-- =============================================================================
-- Phase 7: Drop Legacy Columns from treatment_plan
-- Run this script to clean up the legacy fields that were replaced by the
-- new drug relationship and structured dosage fields in Phase 1.5.
-- =============================================================================

ALTER TABLE public.treatment_plan
    DROP COLUMN IF EXISTS ingredient_id,
    DROP COLUMN IF EXISTS drug_name,
    DROP COLUMN IF EXISTS dosage,
    DROP COLUMN IF EXISTS dosage_per_ha_value,
    DROP COLUMN IF EXISTS dosage_per_ha_unit,
    DROP COLUMN IF EXISTS water_volume_per_ha;

-- (Optional) Nếu có các bảng Audit sinh ra bởi Hibernate Envers (như treatment_plan_AUD),
-- bạn cũng có thể drop các cột tương ứng nếu muốn đồng bộ schema lịch sử (không bắt buộc).
-- Ví dụ:
-- ALTER TABLE public.treatment_plan_AUD
--     DROP COLUMN IF EXISTS ingredient_id,
--     DROP COLUMN IF EXISTS drug_name,
--     DROP COLUMN IF EXISTS dosage,
--     DROP COLUMN IF EXISTS dosage_per_ha_value,
--     DROP COLUMN IF EXISTS dosage_per_ha_unit,
--     DROP COLUMN IF EXISTS water_volume_per_ha;
