-- =============================================================================
-- Schema Extensions: Drug, DrugIngredient, DiseaseWeatherCondition
-- + ALTER treatment_plan
-- Run AFTER docker/init.sql (which creates the base schema)
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLE: drug
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drug (
    id          SERIAL PRIMARY KEY,
    drug_name   VARCHAR(150) NOT NULL,
    formulation VARCHAR(20),          -- SL, SC, WP, EC, SE ...
    manufacturer VARCHAR(150),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    -- BaseEntity audit columns
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP,
    created_by  INTEGER,
    updated_by  INTEGER,
    deleted_by  INTEGER,
    is_delete   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_drug_name UNIQUE (drug_name)
);

COMMENT ON TABLE public.drug IS 'Thuốc thương phẩm (commercial drug products)';
COMMENT ON COLUMN public.drug.formulation IS 'Dạng thuốc: SL, SC, WP, EC, SE, ...';

-- ---------------------------------------------------------------------------
-- 2. TABLE: drug_ingredient
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drug_ingredient (
    id                  SERIAL PRIMARY KEY,
    drug_id             INTEGER NOT NULL REFERENCES public.drug(id) ON DELETE CASCADE,
    ingredient_id       INTEGER NOT NULL REFERENCES public.ingredient(id) ON DELETE RESTRICT,
    concentration_value NUMERIC(10, 4),
    concentration_unit  VARCHAR(20),   -- g/L, g/kg, %, w/w ...
    raw_concentration   VARCHAR(100),  -- raw text khi không parse được chính xác
    -- BaseEntity audit
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP,
    created_by  INTEGER,
    updated_by  INTEGER,
    deleted_by  INTEGER,
    is_delete   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_drug_ingredient UNIQUE (drug_id, ingredient_id)
);

COMMENT ON TABLE public.drug_ingredient IS 'Hoạt chất trong từng sản phẩm thuốc';
COMMENT ON COLUMN public.drug_ingredient.raw_concentration IS 'Hàm lượng dạng text gốc khi không parse được chính xác';

-- ---------------------------------------------------------------------------
-- 3. ALTER TABLE: treatment_plan — thêm các field mới
--    Giữ nguyên field cũ: drug_name, ingredient_id, dosage,
--    dosage_per_ha_value, dosage_per_ha_unit, water_volume_per_ha
-- ---------------------------------------------------------------------------

-- FK sang drug
ALTER TABLE public.treatment_plan
    ADD COLUMN IF NOT EXISTS drug_id INTEGER REFERENCES public.drug(id);

-- Chuẩn hoá liều lượng
ALTER TABLE public.treatment_plan
    ADD COLUMN IF NOT EXISTS dosage_type        VARCHAR(20),   -- PER_HA | PER_TANK | PER_AREA
    ADD COLUMN IF NOT EXISTS dosage_value_min   NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS dosage_value_max   NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS dosage_unit        VARCHAR(20),   -- L, kg, g, ml
    ADD COLUMN IF NOT EXISTS dosage_area_value  NUMERIC(10,4),
    ADD COLUMN IF NOT EXISTS dosage_area_unit   VARCHAR(20);   -- ha, 1000m2

-- UI display
ALTER TABLE public.treatment_plan
    ADD COLUMN IF NOT EXISTS display_dosage        VARCHAR(200),
    ADD COLUMN IF NOT EXISTS mixing_instruction    TEXT,
    ADD COLUMN IF NOT EXISTS display_water_volume  VARCHAR(100);

-- Lịch phun
ALTER TABLE public.treatment_plan
    ADD COLUMN IF NOT EXISTS water_volume_min   NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS water_volume_max   NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS water_volume_unit  VARCHAR(10) DEFAULT 'L/ha',
    ADD COLUMN IF NOT EXISTS spray_times        SMALLINT,
    ADD COLUMN IF NOT EXISTS spray_interval     VARCHAR(50);

-- Metadata
ALTER TABLE public.treatment_plan
    ADD COLUMN IF NOT EXISTS description  TEXT,
    ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.treatment_plan.drug_id            IS 'FK sang bảng drug — thuốc thương phẩm';
COMMENT ON COLUMN public.treatment_plan.dosage_type        IS 'Loại liều: PER_HA | PER_TANK | PER_AREA';
COMMENT ON COLUMN public.treatment_plan.display_dosage     IS 'Chuỗi liều lượng dạng hiển thị cho UI';
COMMENT ON COLUMN public.treatment_plan.mixing_instruction IS 'Hướng dẫn pha và phối trộn';
COMMENT ON COLUMN public.treatment_plan.display_water_volume IS 'Lượng nước dạng hiển thị cho UI';

-- ---------------------------------------------------------------------------
-- 4. TABLE: disease_weather_condition
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disease_weather_condition (
    id                  SERIAL PRIMARY KEY,
    disease_id          INTEGER NOT NULL REFERENCES public.disease(id) ON DELETE CASCADE,
    condition_group     VARCHAR(50) NOT NULL,  -- GROUP_1, GROUP_2 ... (AND logic trong group)
    weather_factor      VARCHAR(30) NOT NULL,  -- TEMPERATURE | HUMIDITY | RAINFALL | WIND_SPEED
    operator            VARCHAR(20) NOT NULL,  -- BETWEEN | GREATER_THAN | LESS_THAN | EQUALS
    min_value           NUMERIC(8, 2),
    max_value           NUMERIC(8, 2),
    unit                VARCHAR(20),           -- °C, %, mm, m/s
    risk_level          VARCHAR(10) NOT NULL,  -- HIGH | MEDIUM | LOW
    recommendation_note TEXT,
    priority            SMALLINT DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    -- BaseEntity audit
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    deleted_at  TIMESTAMP,
    created_by  INTEGER,
    updated_by  INTEGER,
    deleted_by  INTEGER,
    is_delete   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_dwc_weather_factor CHECK (weather_factor IN ('TEMPERATURE','HUMIDITY','RAINFALL','WIND_SPEED')),
    CONSTRAINT chk_dwc_operator       CHECK (operator IN ('BETWEEN','GREATER_THAN','LESS_THAN','EQUALS')),
    CONSTRAINT chk_dwc_risk_level     CHECK (risk_level IN ('HIGH','MEDIUM','LOW'))
);

CREATE INDEX IF NOT EXISTS idx_dwc_disease_id ON public.disease_weather_condition(disease_id);
CREATE INDEX IF NOT EXISTS idx_dwc_active     ON public.disease_weather_condition(disease_id, is_active);

COMMENT ON TABLE public.disease_weather_condition IS
    'Ngưỡng thời tiết theo bệnh — dùng cho DiseaseWeatherRiskEvaluator';
COMMENT ON COLUMN public.disease_weather_condition.condition_group IS
    'Nhóm điều kiện (AND): tất cả row cùng group phải match thì group mới match';
COMMENT ON COLUMN public.disease_weather_condition.priority IS
    'Độ ưu tiên cao hơn khi nhiều group cùng match: cao hơn thì thắng';
