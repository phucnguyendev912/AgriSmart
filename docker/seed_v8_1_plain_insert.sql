-- seed_v8_1_plain_insert.sql

-- Plain PostgreSQL insert/update statements generated from rice-disease-treatment-seed-v8.1-demo-clean.xlsx

BEGIN;



-- 1) disease: update existing rows by disease_code; insert only if missing.

UPDATE public.disease
SET disease_name = 'Bạc lá',
    diseasename_en = 'Bacteria Leaf Blight',
    description = 'Bệnh vi khuẩn Xanthomonas oryzae gây cháy mép/chóp lá.',
    symptoms = 'Lá cháy từ chóp/mép, bạc trắng, lan vào trong.',
    severity_level = 'NANG',
    updated_at = now()
WHERE disease_code = 'BLB_RICE'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'BLB_RICE', 'Bạc lá', 'Bacteria Leaf Blight', 'Bệnh vi khuẩn Xanthomonas oryzae gây cháy mép/chóp lá.', 'Lá cháy từ chóp/mép, bạc trắng, lan vào trong.', 'NANG', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'BLB_RICE'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Sọc vi khuẩn',
    diseasename_en = 'Bacterial Leaf Streak',
    description = 'Bệnh vi khuẩn tạo sọc nhỏ chạy dọc gân lá.',
    symptoms = 'Sọc trong mờ/vàng nâu, có giọt dịch vi khuẩn.',
    severity_level = 'TRUNG_BINH',
    updated_at = now()
WHERE disease_code = 'BLS_RICE'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'BLS_RICE', 'Sọc vi khuẩn', 'Bacterial Leaf Streak', 'Bệnh vi khuẩn tạo sọc nhỏ chạy dọc gân lá.', 'Sọc trong mờ/vàng nâu, có giọt dịch vi khuẩn.', 'TRUNG_BINH', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'BLS_RICE'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Đốm nâu',
    diseasename_en = 'Brown Spot',
    description = 'Bệnh nấm gây đốm nâu trên lá và hạt.',
    symptoms = 'Đốm nâu tròn/bầu dục trên lá; hạt có vết nâu/đen.',
    severity_level = 'TRUNG_BINH',
    updated_at = now()
WHERE disease_code = 'BS_RICE'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'BS_RICE', 'Đốm nâu', 'Brown Spot', 'Bệnh nấm gây đốm nâu trên lá và hạt.', 'Đốm nâu tròn/bầu dục trên lá; hạt có vết nâu/đen.', 'TRUNG_BINH', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'BS_RICE'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Khỏe mạnh',
    diseasename_en = 'Healthy',
    description = 'Trạng thái đối chứng, cây không có dấu hiệu bệnh.',
    symptoms = 'Không có triệu chứng bất thường.',
    severity_level = NULL,
    updated_at = now()
WHERE disease_code = 'HEALTHY'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'HEALTHY', 'Khỏe mạnh', 'Healthy', 'Trạng thái đối chứng, cây không có dấu hiệu bệnh.', 'Không có triệu chứng bất thường.', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'HEALTHY'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Đạo ôn',
    diseasename_en = 'Leaf Blast',
    description = 'Bệnh nấm nguy hiểm do Magnaporthe/Pyricularia.',
    symptoms = 'Vết hình thoi, tâm xám, viền nâu.',
    severity_level = 'NANG',
    updated_at = now()
WHERE disease_code = 'BLAST_RICE'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'BLAST_RICE', 'Đạo ôn', 'Leaf Blast', 'Bệnh nấm nguy hiểm do Magnaporthe/Pyricularia.', 'Vết hình thoi, tâm xám, viền nâu.', 'NANG', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'BLAST_RICE'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Cháy bìa lá',
    diseasename_en = 'Leaf Scald',
    description = 'Bệnh làm lá cháy từ chóp hoặc mép lá.',
    symptoms = 'Lá vàng/cháy từ mép vào, loang dần.',
    severity_level = 'TRUNG_BINH',
    updated_at = now()
WHERE disease_code = 'SCALD_RICE'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'SCALD_RICE', 'Cháy bìa lá', 'Leaf Scald', 'Bệnh làm lá cháy từ chóp hoặc mép lá.', 'Lá vàng/cháy từ mép vào, loang dần.', 'TRUNG_BINH', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'SCALD_RICE'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Khô vằn',
    diseasename_en = 'Sheath Blight',
    description = 'Bệnh nấm Rhizoctonia solani gây hại bẹ lá.',
    symptoms = 'Vết loang dạng vằn trên bẹ lá.',
    severity_level = 'NANG',
    updated_at = now()
WHERE disease_code = 'SHEATH_BLIGHT'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'SHEATH_BLIGHT', 'Khô vằn', 'Sheath Blight', 'Bệnh nấm Rhizoctonia solani gây hại bẹ lá.', 'Vết loang dạng vằn trên bẹ lá.', 'NANG', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'SHEATH_BLIGHT'
    AND coalesce(is_delete, false) = false
);

UPDATE public.disease
SET disease_name = 'Tungro',
    diseasename_en = 'Rice Tungro Virus',
    description = 'Bệnh virus do rầy xanh truyền.',
    symptoms = 'Cây lùn, lá vàng/cam, sinh trưởng kém.',
    severity_level = 'NANG',
    updated_at = now()
WHERE disease_code = 'TUNGRO'
  AND coalesce(is_delete, false) = false;

INSERT INTO public.disease (disease_code, disease_name, diseasename_en, description, symptoms, severity_level, created_at, is_delete)
SELECT 'TUNGRO', 'Tungro', 'Rice Tungro Virus', 'Bệnh virus do rầy xanh truyền.', 'Cây lùn, lá vàng/cam, sinh trưởng kém.', 'NANG', now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.disease
  WHERE disease_code = 'TUNGRO'
    AND coalesce(is_delete, false) = false
);


-- 2) ingredient

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Ningnanmycin', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Ningnanmycin'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Kasugamycin', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Kasugamycin'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Polyoxin', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Polyoxin'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Oxolinic acid', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Oxolinic acid'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Tricyclazole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Tricyclazole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Hexaconazole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Hexaconazole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Azoxystrobin', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Azoxystrobin'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Difenoconazole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Difenoconazole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Fenoxanil', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Fenoxanil'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Isopyrazam', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Isopyrazam'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Propiconazole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Propiconazole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Cyproconazole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Cyproconazole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Profenofos', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Profenofos'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Cyantraniliprole', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Cyantraniliprole'))
    AND coalesce(is_delete, false) = false
);

INSERT INTO public.ingredient (ingredient_name, description, created_at, is_delete)
SELECT 'Pymetrozine', NULL, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.ingredient
  WHERE lower(trim(ingredient_name)) = lower(trim('Pymetrozine'))
    AND coalesce(is_delete, false) = false
);


-- 3) drug

UPDATE public.drug
SET formulation = '4SL',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('BONNY 4SL'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'BONNY 4SL', '4SL', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('BONNY 4SL'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '10SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('STARSUPER 10SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'STARSUPER 10SC', '10SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('STARSUPER 10SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '750WP',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('TRYXO 750WP'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'TRYXO 750WP', '750WP', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('TRYXO 750WP'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '525SE + 10SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'QUÁ XÁ TỐT', '525SE + 10SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('QUÁ XÁ TỐT'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '500SC + 425SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('GAP3'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'GAP3', '500SC + 425SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('GAP3'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '325SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Reflect Xtra 325SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Reflect Xtra 325SC', '325SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Reflect Xtra 325SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '425SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Starvil 425SC trong bộ GAP3'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Starvil 425SC trong bộ GAP3', '425SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Starvil 425SC trong bộ GAP3'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '525SE',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Filia 525SE'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Filia 525SE', '525SE', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Filia 525SE'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '300SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('NewTec 300SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'NewTec 300SC', '300SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('NewTec 300SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '750WP',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('BIMDOWMY 750WP'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'BIMDOWMY 750WP', '750WP', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('BIMDOWMY 750WP'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '750WP',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('NEWBEM 750WP'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'NEWBEM 750WP', '750WP', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('NEWBEM 750WP'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '350SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('AVISO 350SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'AVISO 350SC', '350SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('AVISO 350SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '525SE',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('NATOFULL 525SE'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'NATOFULL 525SE', '525SE', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('NATOFULL 525SE'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '325SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'TOPMYSTAR 325SC TOP NHẬT', '325SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '325SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Amistar Top 325SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Amistar Top 325SC', '325SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Amistar Top 325SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '330EC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Nevo 330EC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Nevo 330EC', '330EC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Nevo 330EC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '50SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('CENTERVIN 50SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'CENTERVIN 50SC', '50SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('CENTERVIN 50SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '5SC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Anvil 5SC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Anvil 5SC', '5SC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Anvil 5SC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '500EC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Selecron 500EC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Selecron 500EC', '500EC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Selecron 500EC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '50EC',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('HOPPECIN 50EC'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'HOPPECIN 50EC', '50EC', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('HOPPECIN 50EC'))
    AND coalesce(is_delete, false) = false
);

UPDATE public.drug
SET formulation = '60WG',
    is_active = true,
    updated_at = now()
WHERE lower(trim(drug_name)) = lower(trim('Minecto Star 60WG'))
  AND coalesce(is_delete, false) = false;

INSERT INTO public.drug (drug_name, formulation, manufacturer, is_active, created_at, is_delete)
SELECT 'Minecto Star 60WG', '60WG', NULL, true, now(), false
WHERE NOT EXISTS (
  SELECT 1 FROM public.drug
  WHERE lower(trim(drug_name)) = lower(trim('Minecto Star 60WG'))
    AND coalesce(is_delete, false) = false
);


-- 4) drug_ingredient

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 40, 'g/L', 'Ningnanmycin 40 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Ningnanmycin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('BONNY 4SL'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 40,
    concentration_unit = 'g/L',
    raw_concentration = 'Ningnanmycin 40 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Ningnanmycin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('BONNY 4SL'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 9, 'g/L', 'Kasugamycin 9 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Kasugamycin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('STARSUPER 10SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 9,
    concentration_unit = 'g/L',
    raw_concentration = 'Kasugamycin 9 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Kasugamycin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('STARSUPER 10SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 1, 'g/L', 'Polyoxin 1 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('STARSUPER 10SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 1,
    concentration_unit = 'g/L',
    raw_concentration = 'Polyoxin 1 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('STARSUPER 10SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/kg', 'Oxolinic acid 200 g/kg', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Oxolinic acid')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('TRYXO 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/kg',
    raw_concentration = 'Oxolinic acid 200 g/kg',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Oxolinic acid')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('TRYXO 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 550, 'g/kg', 'Tricyclazole 550 g/kg', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('TRYXO 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 550,
    concentration_unit = 'g/kg',
    raw_concentration = 'Tricyclazole 550 g/kg',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('TRYXO 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 425, 'g/L', 'Tricyclazole 425 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 425,
    concentration_unit = 'g/L',
    raw_concentration = 'Tricyclazole 425 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 100, 'g/L', 'Hexaconazole 100 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 100,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 100 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 9, 'g/L', 'Kasugamycin 9 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Kasugamycin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 9,
    concentration_unit = 'g/L',
    raw_concentration = 'Kasugamycin 9 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Kasugamycin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 1, 'g/L', 'Polyoxin 1 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 1,
    concentration_unit = 'g/L',
    raw_concentration = 'Polyoxin 1 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('QUÁ XÁ TỐT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/L', 'Azoxystrobin 200 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/L',
    raw_concentration = 'Azoxystrobin 200 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 125, 'g/L', 'Difenoconazole 125 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 125,
    concentration_unit = 'g/L',
    raw_concentration = 'Difenoconazole 125 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 100, 'g/L', 'Hexaconazole 100 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 100,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 100 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 100, 'g/L', 'Fenoxanil 100 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Fenoxanil')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 100,
    concentration_unit = 'g/L',
    raw_concentration = 'Fenoxanil 100 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Fenoxanil')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 100, 'g/L', 'Oxolinic acid 100 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Oxolinic acid')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 100,
    concentration_unit = 'g/L',
    raw_concentration = 'Oxolinic acid 100 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Oxolinic acid')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 300, 'g/L', 'Tricyclazole 300 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 300,
    concentration_unit = 'g/L',
    raw_concentration = 'Tricyclazole 300 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('GAP3'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 125, 'g/L', 'Isopyrazam 125 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Isopyrazam')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Reflect Xtra 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 125,
    concentration_unit = 'g/L',
    raw_concentration = 'Isopyrazam 125 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Isopyrazam')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Reflect Xtra 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/L', 'Azoxystrobin 200 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Reflect Xtra 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/L',
    raw_concentration = 'Azoxystrobin 200 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Reflect Xtra 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 400, 'g/L', 'Tricyclazole 400 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Filia 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 400,
    concentration_unit = 'g/L',
    raw_concentration = 'Tricyclazole 400 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Filia 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 125, 'g/L', 'Propiconazole 125 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Filia 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 125,
    concentration_unit = 'g/L',
    raw_concentration = 'Propiconazole 125 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Filia 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 50, 'g/L', 'Hexaconazole 50 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('NewTec 300SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 50,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 50 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('NewTec 300SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 250, 'g/L', 'Tricyclazole 250 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('NewTec 300SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 250,
    concentration_unit = 'g/L',
    raw_concentration = 'Tricyclazole 250 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('NewTec 300SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 750, 'g/kg', 'Tricyclazole 750 g/kg', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('BIMDOWMY 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 750,
    concentration_unit = 'g/kg',
    raw_concentration = 'Tricyclazole 750 g/kg',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('BIMDOWMY 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 75, '% w/w', 'Tricyclazole 75% w/w', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('NEWBEM 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 75,
    concentration_unit = '% w/w',
    raw_concentration = 'Tricyclazole 75% w/w',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('NEWBEM 750WP'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/L', 'Azoxystrobin 200 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('AVISO 350SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/L',
    raw_concentration = 'Azoxystrobin 200 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('AVISO 350SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 150, 'g/L', 'Difenoconazole 150 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('AVISO 350SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 150,
    concentration_unit = 'g/L',
    raw_concentration = 'Difenoconazole 150 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('AVISO 350SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 425, 'g/L', 'Tricyclazole 425 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('NATOFULL 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 425,
    concentration_unit = 'g/L',
    raw_concentration = 'Tricyclazole 425 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('NATOFULL 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 100, 'g/L', 'Hexaconazole 100 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('NATOFULL 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 100,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 100 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('NATOFULL 525SE'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/L', 'Azoxystrobin 200 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/L',
    raw_concentration = 'Azoxystrobin 200 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 125, 'g/L', 'Difenoconazole 125 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 125,
    concentration_unit = 'g/L',
    raw_concentration = 'Difenoconazole 125 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 200, 'g/L', 'Azoxystrobin 200 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Amistar Top 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 200,
    concentration_unit = 'g/L',
    raw_concentration = 'Azoxystrobin 200 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Amistar Top 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 125, 'g/L', 'Difenoconazole 125 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Amistar Top 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 125,
    concentration_unit = 'g/L',
    raw_concentration = 'Difenoconazole 125 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Amistar Top 325SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 80, 'g/L', 'Cyproconazole 80 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Cyproconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Nevo 330EC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 80,
    concentration_unit = 'g/L',
    raw_concentration = 'Cyproconazole 80 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Cyproconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Nevo 330EC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 250, 'g/L', 'Propiconazole 250 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Nevo 330EC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 250,
    concentration_unit = 'g/L',
    raw_concentration = 'Propiconazole 250 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Nevo 330EC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 50, 'g/L', 'Hexaconazole 50 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('CENTERVIN 50SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 50,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 50 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('CENTERVIN 50SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 50, 'g/L', 'Hexaconazole 50 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Anvil 5SC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 50,
    concentration_unit = 'g/L',
    raw_concentration = 'Hexaconazole 50 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Hexaconazole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Anvil 5SC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, 500, 'g/L', 'Profenofos 500 g/L', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Profenofos')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Selecron 500EC'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = 500,
    concentration_unit = 'g/L',
    raw_concentration = 'Profenofos 500 g/L',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Profenofos')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Selecron 500EC'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, NULL, NULL, 'Cyantraniliprole', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Cyantraniliprole')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Minecto Star 60WG'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = NULL,
    concentration_unit = NULL,
    raw_concentration = 'Cyantraniliprole',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Cyantraniliprole')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Minecto Star 60WG'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_ingredient (drug_id, ingredient_id, concentration_value, concentration_unit, raw_concentration, created_at, is_delete)
SELECT d.id, i.id, NULL, NULL, 'Pymetrozine', now(), false
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Pymetrozine')) AND coalesce(i.is_delete, false) = false
WHERE lower(trim(d.drug_name)) = lower(trim('Minecto Star 60WG'))
  AND coalesce(d.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_ingredient di
    WHERE di.drug_id = d.id
      AND di.ingredient_id = i.id
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_ingredient di
SET concentration_value = NULL,
    concentration_unit = NULL,
    raw_concentration = 'Pymetrozine',
    updated_at = now()
FROM public.drug d
JOIN public.ingredient i ON lower(trim(i.ingredient_name)) = lower(trim('Pymetrozine')) AND coalesce(i.is_delete, false) = false
WHERE di.drug_id = d.id
  AND di.ingredient_id = i.id
  AND lower(trim(d.drug_name)) = lower(trim('Minecto Star 60WG'))
  AND coalesce(d.is_delete, false) = false
  AND coalesce(di.is_delete, false) = false;


-- 5) treatment_plan

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,75 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,75 L/ha',
    mixing_instruction = 'pha 20 ml/10 L nước',
    display_water_volume = 'Tùy thuộc lượng nước phun thực tế',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.75,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước vào bồn trước, thêm BONNY 4SL khi đang khuấy',
    application_time = 'Sinh trưởng mạnh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày nếu áp lực bệnh còn cao',
    safety_notes = 'Nóng ẩm, mưa nhiều, độ ẩm cao; tránh phun sát lúc mưa',
    description = 'Phun khi bệnh chớm xuất hiện trên lá lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày nếu áp lực bệnh còn cao.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,75 L/ha',
       '0,75 L/ha', 'pha 20 ml/10 L nước', 'Tùy thuộc lượng nước phun thực tế',
       'PER_HA', 0.75, NULL, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước vào bồn trước, thêm BONNY 4SL khi đang khuấy', 'Sinh trưởng mạnh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày nếu áp lực bệnh còn cao', 'Nóng ẩm, mưa nhiều, độ ẩm cao; tránh phun sát lúc mưa', 'Phun khi bệnh chớm xuất hiện trên lá lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày nếu áp lực bệnh còn cao.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5-1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5-1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước vào bồn, thêm thuốc khi đang khuấy đều',
    application_time = 'Sinh trưởng đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Có thể đánh giá lại sau 5-7 ngày nếu ruộng còn bệnh hoạt động',
    safety_notes = 'Bệnh bạc lá thường bộc phát khi nóng ẩm, mưa nhiều, ẩm độ cao',
    description = 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Có thể đánh giá lại sau 5-7 ngày nếu ruộng còn bệnh hoạt động.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5-1,0 L/ha',
       '0,5-1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 0.5, 1, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước vào bồn, thêm thuốc khi đang khuấy đều', 'Sinh trưởng đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Có thể đánh giá lại sau 5-7 ngày nếu ruộng còn bệnh hoạt động', 'Bệnh bạc lá thường bộc phát khi nóng ẩm, mưa nhiều, ẩm độ cao', 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Có thể đánh giá lại sau 5-7 ngày nếu ruộng còn bệnh hoạt động.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '25-30 g/bình 25 L',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '25-30 g/bình 25 L',
    mixing_instruction = NULL,
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_TANK',
    dosage_value_min = 25,
    dosage_value_max = 30,
    dosage_unit = 'G',
    dosage_area_value = 25,
    dosage_area_unit = 'L_WATER',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước vào bình trước, thêm bột thuốc sau, khuấy đều',
    application_time = 'Đẻ nhánh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau 5-7 ngày nếu còn bệnh',
    safety_notes = 'Phù hợp khi ruộng đang có điều kiện nóng ẩm; tránh phun lúc sắp mưa',
    description = 'Phun khi tỷ lệ bệnh khoảng 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày nếu còn bệnh.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '25-30 g/bình 25 L',
       '25-30 g/bình 25 L', NULL, '400-500 L/ha',
       'PER_TANK', 25, 30, 'G', 25, 'L_WATER',
       400, 500, 'L/HA',
       'Cho nước vào bình trước, thêm bột thuốc sau, khuấy đều', 'Đẻ nhánh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau 5-7 ngày nếu còn bệnh', 'Phù hợp khi ruộng đang có điều kiện nóng ẩm; tránh phun lúc sắp mưa', 'Phun khi tỷ lệ bệnh khoảng 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày nếu còn bệnh.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '1 cặp/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '1 cặp/ha',
    mixing_instruction = NULL,
    display_water_volume = 'Theo hướng dẫn nhà sản xuất cho 10.000 m2',
    dosage_type = 'PER_HA',
    dosage_value_min = 1,
    dosage_value_max = NULL,
    dosage_unit = 'PAIR',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Pha từng thành phần theo thứ tự nhãn khuyến cáo, khuấy đều trước khi phối chung',
    application_time = 'Đẻ nhánh đến trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại ruộng sau 5-7 ngày',
    safety_notes = 'Ưu tiên lúc bệnh chớm xuất hiện, ruộng khô lá, không mưa ngay sau xử lý',
    description = 'Dùng khi cần xử lý đồng thời đạo ôn và bạc lá/cháy bìa lá trên lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại ruộng sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('QUÁ XÁ TỐT')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '1 cặp/ha',
       '1 cặp/ha', NULL, 'Theo hướng dẫn nhà sản xuất cho 10.000 m2',
       'PER_HA', 1, NULL, 'PAIR', 1, 'HA',
       NULL, NULL, NULL,
       'Pha từng thành phần theo thứ tự nhãn khuyến cáo, khuấy đều trước khi phối chung', 'Đẻ nhánh đến trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại ruộng sau 5-7 ngày', 'Ưu tiên lúc bệnh chớm xuất hiện, ruộng khô lá, không mưa ngay sau xử lý', 'Dùng khi cần xử lý đồng thời đạo ôn và bạc lá/cháy bìa lá trên lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại ruộng sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('QUÁ XÁ TỐT')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,75 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,75 L/ha',
    mixing_instruction = 'pha 20 ml/10 L nước',
    display_water_volume = 'Tùy thuộc lượng nước phun thực tế',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.75,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm BONNY 4SL khi đang khuấy',
    application_time = 'Đẻ nhánh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày',
    safety_notes = 'Nhiệt độ 28-30°C, độ ẩm khoảng 80%, mưa gió và bón thừa đạm làm bệnh nặng hơn',
    description = 'Phun sớm khi ruộng xuất hiện nhóm bệnh vi khuẩn trên lá. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,75 L/ha',
       '0,75 L/ha', 'pha 20 ml/10 L nước', 'Tùy thuộc lượng nước phun thực tế',
       'PER_HA', 0.75, NULL, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước trước, thêm BONNY 4SL khi đang khuấy', 'Đẻ nhánh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày', 'Nhiệt độ 28-30°C, độ ẩm khoảng 80%, mưa gió và bón thừa đạm làm bệnh nặng hơn', 'Phun sớm khi ruộng xuất hiện nhóm bệnh vi khuẩn trên lá. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '25-30 g/bình 25 L',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '25-30 g/bình 25 L',
    mixing_instruction = NULL,
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_TANK',
    dosage_value_min = 25,
    dosage_value_max = 30,
    dosage_unit = 'G',
    dosage_area_value = 25,
    dosage_area_unit = 'L_WATER',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Hòa bột vào nước từ từ, khuấy đều',
    application_time = 'Đẻ nhánh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau 5-7 ngày',
    safety_notes = 'Bệnh thuận lợi trong điều kiện nóng ẩm, mưa gió, lá lúa dễ bị thương tổn',
    description = 'Phun sớm khi ruộng có triệu chứng bệnh vi khuẩn lá và nguy cơ đồng nhiễm đạo ôn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '25-30 g/bình 25 L',
       '25-30 g/bình 25 L', NULL, '400-500 L/ha',
       'PER_TANK', 25, 30, 'G', 25, 'L_WATER',
       400, 500, 'L/HA',
       'Hòa bột vào nước từ từ, khuấy đều', 'Đẻ nhánh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau 5-7 ngày', 'Bệnh thuận lợi trong điều kiện nóng ẩm, mưa gió, lá lúa dễ bị thương tổn', 'Phun sớm khi ruộng có triệu chứng bệnh vi khuẩn lá và nguy cơ đồng nhiễm đạo ôn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5-1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5-1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm thuốc sau, khuấy đều',
    application_time = 'Sinh trưởng đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá sau 5-7 ngày nếu cần',
    safety_notes = 'Nóng ẩm, bón thừa đạm, mưa gió làm bệnh lan nhanh',
    description = 'Phun khi ruộng có nhóm bệnh vi khuẩn lá ở giai đoạn đầu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá sau 5-7 ngày nếu cần.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5-1,0 L/ha',
       '0,5-1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 0.5, 1, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước trước, thêm thuốc sau, khuấy đều', 'Sinh trưởng đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá sau 5-7 ngày nếu cần', 'Nóng ẩm, bón thừa đạm, mưa gió làm bệnh lan nhanh', 'Phun khi ruộng có nhóm bệnh vi khuẩn lá ở giai đoạn đầu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá sau 5-7 ngày nếu cần.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '1 cặp 30 ml/1.000 m2 hoặc 1 cặp 300 ml/10.000 m2',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '1 cặp 30 ml/1.000 m2 hoặc 1 cặp 300 ml/10.000 m2',
    mixing_instruction = NULL,
    display_water_volume = 'Tùy thuộc lượng nước phun thực tế',
    dosage_type = 'PER_AREA',
    dosage_value_min = 1,
    dosage_value_max = NULL,
    dosage_unit = 'PAIR',
    dosage_area_value = 1000,
    dosage_area_unit = 'M2',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Pha từng thành phần theo thứ tự nhãn của bộ sản phẩm, khuấy đều từng bước',
    application_time = 'Từ đẻ nhánh tối đa đến chín sữa, đặc biệt giai đoạn đòng trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau đợt đầu nếu áp lực bệnh còn cao',
    safety_notes = 'Bệnh đốm nâu thường mạnh ở đất nghèo dinh dưỡng, ruộng phèn, ẩm độ cao hoặc quản lý dinh dưỡng kém',
    description = 'Dùng ở giai đoạn đòng trổ khi cần quản lý đồng thời đốm nâu, đốm vằn và nhóm bệnh hại quan trọng trên lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau đợt đầu nếu áp lực bệnh còn cao.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('GAP3')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '1 cặp 30 ml/1.000 m2 hoặc 1 cặp 300 ml/10.000 m2',
       '1 cặp 30 ml/1.000 m2 hoặc 1 cặp 300 ml/10.000 m2', NULL, 'Tùy thuộc lượng nước phun thực tế',
       'PER_AREA', 1, NULL, 'PAIR', 1000, 'M2',
       NULL, NULL, NULL,
       'Pha từng thành phần theo thứ tự nhãn của bộ sản phẩm, khuấy đều từng bước', 'Từ đẻ nhánh tối đa đến chín sữa, đặc biệt giai đoạn đòng trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau đợt đầu nếu áp lực bệnh còn cao', 'Bệnh đốm nâu thường mạnh ở đất nghèo dinh dưỡng, ruộng phèn, ẩm độ cao hoặc quản lý dinh dưỡng kém', 'Dùng ở giai đoạn đòng trổ khi cần quản lý đồng thời đốm nâu, đốm vằn và nhóm bệnh hại quan trọng trên lúa. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau đợt đầu nếu áp lực bệnh còn cao.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('GAP3')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Theo nhãn thương mại cho lúa',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Theo nhãn thương mại cho lúa',
    mixing_instruction = 'Liều dùng theo nhãn sản phẩm thực tế cho đốm nâu',
    display_water_volume = 'Theo nhãn sử dụng của sản phẩm',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm thuốc khi đang khuấy',
    application_time = 'Nuôi đòng đến trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại theo áp lực bệnh trong ruộng',
    safety_notes = 'Theo Syngenta dùng trong giai đoạn nuôi đòng; bệnh đốm nâu thuận lợi ở ruộng ẩm kéo dài hoặc dinh dưỡng mất cân đối',
    description = 'Phun thời kỳ nuôi đòng, khoảng 50-60 ngày sau sạ. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo áp lực bệnh trong ruộng.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Reflect Xtra 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Theo nhãn thương mại cho lúa',
       'Theo nhãn thương mại cho lúa', 'Liều dùng theo nhãn sản phẩm thực tế cho đốm nâu', 'Theo nhãn sử dụng của sản phẩm',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Cho nước trước, thêm thuốc khi đang khuấy', 'Nuôi đòng đến trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại theo áp lực bệnh trong ruộng', 'Theo Syngenta dùng trong giai đoạn nuôi đòng; bệnh đốm nâu thuận lợi ở ruộng ẩm kéo dài hoặc dinh dưỡng mất cân đối', 'Phun thời kỳ nuôi đòng, khoảng 50-60 ngày sau sạ. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo áp lực bệnh trong ruộng.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Reflect Xtra 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Theo bộ GAP3: 1 cặp 30 ml/1.000 m2 hoặc 300 ml/10.000 m2',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Theo bộ GAP3: 1 cặp 30 ml/1.000 m2 hoặc 300 ml/10.000 m2',
    mixing_instruction = NULL,
    display_water_volume = 'Tùy thuộc lượng nước phun thực tế',
    dosage_type = 'PER_AREA',
    dosage_value_min = 1,
    dosage_value_max = NULL,
    dosage_unit = 'PAIR',
    dosage_area_value = 1000,
    dosage_area_unit = 'M2',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Pha theo bộ GAP3 của nhà sản xuất',
    application_time = 'Đòng trổ đến chín sữa',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau 5-7 ngày',
    safety_notes = 'Bệnh nặng hơn khi ruộng nghèo dinh dưỡng, rễ yếu, đất phèn hoặc kéo dài ẩm độ bất lợi',
    description = 'Dùng ở giai đoạn đòng trổ khi ruộng có nguy cơ đốm nâu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Starvil 425SC trong bộ GAP3')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Theo bộ GAP3: 1 cặp 30 ml/1.000 m2 hoặc 300 ml/10.000 m2',
       'Theo bộ GAP3: 1 cặp 30 ml/1.000 m2 hoặc 300 ml/10.000 m2', NULL, 'Tùy thuộc lượng nước phun thực tế',
       'PER_AREA', 1, NULL, 'PAIR', 1000, 'M2',
       NULL, NULL, NULL,
       'Pha theo bộ GAP3 của nhà sản xuất', 'Đòng trổ đến chín sữa', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau 5-7 ngày', 'Bệnh nặng hơn khi ruộng nghèo dinh dưỡng, rễ yếu, đất phèn hoặc kéo dài ẩm độ bất lợi', 'Dùng ở giai đoạn đòng trổ khi ruộng có nguy cơ đốm nâu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Starvil 425SC trong bộ GAP3')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5 L/ha',
    mixing_instruction = '35 ml/bình 25 L hoặc 20 ml/bình 20 L',
    display_water_volume = 'Theo hướng dẫn địa phương',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Lắc đều chai, cho nước trước rồi thêm thuốc khi khuấy',
    application_time = 'Đạo ôn lá, cổ lá và cổ bông',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi 5-7 ngày để quyết định phun nhắc nếu cần',
    safety_notes = 'Nên phun khi ruộng thông thoáng và chưa có mưa ngay sau xử lý',
    description = 'Phun khi lúa có biểu hiện đạo ôn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi 5-7 ngày để quyết định phun nhắc nếu cần.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Filia 525SE')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5 L/ha',
       '0,5 L/ha', '35 ml/bình 25 L hoặc 20 ml/bình 20 L', 'Theo hướng dẫn địa phương',
       'PER_HA', 0.5, NULL, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Lắc đều chai, cho nước trước rồi thêm thuốc khi khuấy', 'Đạo ôn lá, cổ lá và cổ bông', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi 5-7 ngày để quyết định phun nhắc nếu cần', 'Nên phun khi ruộng thông thoáng và chưa có mưa ngay sau xử lý', 'Phun khi lúa có biểu hiện đạo ôn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi 5-7 ngày để quyết định phun nhắc nếu cần.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Filia 525SE')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,75-1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,75-1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.75,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước vào bồn trước, thêm thuốc khi đang khuấy',
    application_time = 'Đạo ôn lá',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau phun đầu nếu ruộng còn áp lực bệnh',
    safety_notes = 'Tránh mưa ngay sau phun',
    description = 'Phun khi tỷ lệ bệnh khoảng 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau phun đầu nếu ruộng còn áp lực bệnh.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NewTec 300SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,75-1,0 L/ha',
       '0,75-1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 0.75, 1, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước vào bồn trước, thêm thuốc khi đang khuấy', 'Đạo ôn lá', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau phun đầu nếu ruộng còn áp lực bệnh', 'Tránh mưa ngay sau phun', 'Phun khi tỷ lệ bệnh khoảng 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau phun đầu nếu ruộng còn áp lực bệnh.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NewTec 300SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,25-0,5 kg/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,25-0,5 kg/ha',
    mixing_instruction = 'pha 25 g/bình 25 L',
    display_water_volume = '400 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.25,
    dosage_value_max = 0.5,
    dosage_unit = 'KG',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = NULL,
    water_volume_unit = 'L/HA',
    application_method = 'Hòa tan bột thuốc từ từ trong nước, khuấy đều',
    application_time = 'Đạo ôn lá, đạo ôn cổ bông',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Nhắc lại tùy áp lực bệnh',
    safety_notes = 'Sau phun 1 giờ nếu gặp mưa ít giảm hiệu lực',
    description = 'Phun khi bệnh xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Nhắc lại tùy áp lực bệnh.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BIMDOWMY 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,25-0,5 kg/ha',
       '0,25-0,5 kg/ha', 'pha 25 g/bình 25 L', '400 L/ha',
       'PER_HA', 0.25, 0.5, 'KG', 1, 'HA',
       400, NULL, 'L/HA',
       'Hòa tan bột thuốc từ từ trong nước, khuấy đều', 'Đạo ôn lá, đạo ôn cổ bông', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Nhắc lại tùy áp lực bệnh', 'Sau phun 1 giờ nếu gặp mưa ít giảm hiệu lực', 'Phun khi bệnh xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Nhắc lại tùy áp lực bệnh.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BIMDOWMY 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,3-0,4 kg/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,3-0,4 kg/ha',
    mixing_instruction = '7,5-8,0 g/10 L nước',
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.3,
    dosage_value_max = 0.4,
    dosage_unit = 'KG',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Hòa tan thuốc trước, sau đó mới thêm sản phẩm phối hợp nếu có',
    application_time = 'Đạo ôn lá và cổ bông',
    spray_times = NULLIF(substring(coalesce('1-2 lần theo diễn biến bệnh', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Lần hai theo giai đoạn trổ hoặc sau 5-7 ngày nếu cần',
    safety_notes = 'Không sợ mưa rửa trôi sau phun 1 giờ',
    description = 'Đạo ôn lá: phun khi bệnh vừa xuất hiện. Đạo ôn cổ bông: phun ngừa khi lúa trổ lẹt xẹt và trổ đều. Số lần phun: 1-2 lần theo diễn biến bệnh. Khoảng cách: Lần hai theo giai đoạn trổ hoặc sau 5-7 ngày nếu cần.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NEWBEM 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,3-0,4 kg/ha',
       '0,3-0,4 kg/ha', '7,5-8,0 g/10 L nước', '400-500 L/ha',
       'PER_HA', 0.3, 0.4, 'KG', 1, 'HA',
       400, 500, 'L/HA',
       'Hòa tan thuốc trước, sau đó mới thêm sản phẩm phối hợp nếu có', 'Đạo ôn lá và cổ bông', NULLIF(substring(coalesce('1-2 lần theo diễn biến bệnh', ''), '^[0-9]+'), '')::smallint, 'Lần hai theo giai đoạn trổ hoặc sau 5-7 ngày nếu cần', 'Không sợ mưa rửa trôi sau phun 1 giờ', 'Đạo ôn lá: phun khi bệnh vừa xuất hiện. Đạo ôn cổ bông: phun ngừa khi lúa trổ lẹt xẹt và trổ đều. Số lần phun: 1-2 lần theo diễn biến bệnh. Khoảng cách: Lần hai theo giai đoạn trổ hoặc sau 5-7 ngày nếu cần.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NEWBEM 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,35 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,35 L/ha',
    mixing_instruction = '10 ml/10 L nước',
    display_water_volume = 'Theo thực tế phun trên ruộng',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.35,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm AVISO 350SC, khuấy đều; nếu phối Bonny hoặc Newbem thì thêm sau khi AVISO đã phân tán đều',
    application_time = 'Trước trổ và sau trổ',
    spray_times = NULLIF(substring(coalesce('2 lần. Khoảng cách: 5-7 ngày', ''), '^[0-9]+'), '')::smallint,
    spray_interval = NULL,
    safety_notes = 'Phù hợp giai đoạn đòng trổ; tránh mưa ngay sau phun',
    description = 'Phun giai đoạn trước trổ và sau trổ 5-7 ngày. Số lần phun: 2 lần. Khoảng cách: 5-7 ngày',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('AVISO 350SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,35 L/ha',
       '0,35 L/ha', '10 ml/10 L nước', 'Theo thực tế phun trên ruộng',
       'PER_HA', 0.35, NULL, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước trước, thêm AVISO 350SC, khuấy đều; nếu phối Bonny hoặc Newbem thì thêm sau khi AVISO đã phân tán đều', 'Trước trổ và sau trổ', NULLIF(substring(coalesce('2 lần. Khoảng cách: 5-7 ngày', ''), '^[0-9]+'), '')::smallint, NULL, 'Phù hợp giai đoạn đòng trổ; tránh mưa ngay sau phun', 'Phun giai đoạn trước trổ và sau trổ 5-7 ngày. Số lần phun: 2 lần. Khoảng cách: 5-7 ngày',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('AVISO 350SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '25-30 g/bình 25 L',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '25-30 g/bình 25 L',
    mixing_instruction = NULL,
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_TANK',
    dosage_value_min = 25,
    dosage_value_max = 30,
    dosage_unit = 'G',
    dosage_area_value = 25,
    dosage_area_unit = 'L_WATER',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Hòa bột kỹ trong nước trước khi phun',
    application_time = 'Đạo ôn lá, đạo ôn cổ bông',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày',
    safety_notes = 'Tránh phun sát mưa lớn',
    description = 'Phun khi tỷ lệ bệnh 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '25-30 g/bình 25 L',
       '25-30 g/bình 25 L', NULL, '400-500 L/ha',
       'PER_TANK', 25, 30, 'G', 25, 'L_WATER',
       400, 500, 'L/HA',
       'Hòa bột kỹ trong nước trước khi phun', 'Đạo ôn lá, đạo ôn cổ bông', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày', 'Tránh phun sát mưa lớn', 'Phun khi tỷ lệ bệnh 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TRYXO 750WP')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,4-0,5 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,4-0,5 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.4,
    dosage_value_max = 0.5,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước vào bồn trước, thêm NATOFULL 525SE khi đang khuấy',
    application_time = 'Đạo ôn lá, đạo ôn cổ bông',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày',
    safety_notes = 'Dùng tốt khi bệnh chớm và ruộng chưa gặp mưa ngay sau xử lý',
    description = 'Phun khi tỷ lệ bệnh 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NATOFULL 525SE')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,4-0,5 L/ha',
       '0,4-0,5 L/ha', NULL, '400-500 L/ha',
       'PER_HA', 0.4, 0.5, 'L', 1, 'HA',
       400, 500, 'L/HA',
       'Cho nước vào bồn trước, thêm NATOFULL 525SE khi đang khuấy', 'Đạo ôn lá, đạo ôn cổ bông', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày', 'Dùng tốt khi bệnh chớm và ruộng chưa gặp mưa ngay sau xử lý', 'Phun khi tỷ lệ bệnh 5-10%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NATOFULL 525SE')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    mixing_instruction = 'sản phẩm đăng ký các bệnh lúa phổ rộng',
    display_water_volume = 'Theo nhãn sử dụng của sản phẩm',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm thuốc sau, khuấy đều',
    application_time = 'Đạo ôn lá',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại theo diễn biến ruộng',
    safety_notes = 'Hiệu quả cao hơn khi phun lúc bệnh chớm xuất hiện',
    description = 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo diễn biến ruộng.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
       'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp', 'sản phẩm đăng ký các bệnh lúa phổ rộng', 'Theo nhãn sử dụng của sản phẩm',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Cho nước trước, thêm thuốc sau, khuấy đều', 'Đạo ôn lá', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại theo diễn biến ruộng', 'Hiệu quả cao hơn khi phun lúc bệnh chớm xuất hiện', 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo diễn biến ruộng.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,75 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,75 L/ha',
    mixing_instruction = 'pha 20 ml/10 L nước',
    display_water_volume = 'Tùy thuộc lượng nước phun thực tế',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.75,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm BONNY 4SL khi đang khuấy',
    application_time = 'Sinh trưởng đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau 5-7 ngày',
    safety_notes = 'Nên phun sớm, tránh mưa ngay sau phun',
    description = 'Phun khi lá bắt đầu cháy từ chóp hoặc mép lá và ruộng có nghi ngờ bệnh lá do vi khuẩn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,75 L/ha',
       '0,75 L/ha', 'pha 20 ml/10 L nước', 'Tùy thuộc lượng nước phun thực tế',
       'PER_HA', 0.75, NULL, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước trước, thêm BONNY 4SL khi đang khuấy', 'Sinh trưởng đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau 5-7 ngày', 'Nên phun sớm, tránh mưa ngay sau phun', 'Phun khi lá bắt đầu cháy từ chóp hoặc mép lá và ruộng có nghi ngờ bệnh lá do vi khuẩn. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('BONNY 4SL')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5-1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5-1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm thuốc sau, khuấy đều',
    application_time = 'Sinh trưởng đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày',
    safety_notes = 'Ưu tiên xử lý sớm trong điều kiện nóng ẩm, lá khô trước khi phun',
    description = 'Phun khi ruộng xuất hiện cháy mép lá giai đoạn đầu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5-1,0 L/ha',
       '0,5-1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 0.5, 1, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước trước, thêm thuốc sau, khuấy đều', 'Sinh trưởng đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày', 'Ưu tiên xử lý sớm trong điều kiện nóng ẩm, lá khô trước khi phun', 'Phun khi ruộng xuất hiện cháy mép lá giai đoạn đầu. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '300-600 ml/ha cho vàng lá chín sớm',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '300-600 ml/ha cho vàng lá chín sớm',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sử dụng thực tế',
    dosage_type = 'PER_HA',
    dosage_value_min = 300,
    dosage_value_max = 600,
    dosage_unit = 'ML',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm TOPMYSTAR 325SC khi đang khuấy',
    application_time = 'Làm đòng đến trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau đợt đầu',
    safety_notes = 'Hiệu quả cao hơn khi phun lúc bệnh chớm xuất hiện',
    description = 'Phun khi tỷ lệ bệnh khoảng 5-10% với nhóm vàng lá/cháy sớm. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau đợt đầu.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '300-600 ml/ha cho vàng lá chín sớm',
       '300-600 ml/ha cho vàng lá chín sớm', NULL, 'Theo nhãn sử dụng thực tế',
       'PER_HA', 300, 600, 'ML', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước trước, thêm TOPMYSTAR 325SC khi đang khuấy', 'Làm đòng đến trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau đợt đầu', 'Hiệu quả cao hơn khi phun lúc bệnh chớm xuất hiện', 'Phun khi tỷ lệ bệnh khoảng 5-10% với nhóm vàng lá/cháy sớm. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại sau đợt đầu.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SCALD_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5-1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5-1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm thuốc sau, khuấy đều',
    application_time = 'Đẻ nhánh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại sau 5-7 ngày',
    safety_notes = 'Bệnh mạnh khi 28-32°C, ẩm độ 96-100%, tán lá dày',
    description = 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5-1,0 L/ha',
       '0,5-1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 0.5, 1, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước trước, thêm thuốc sau, khuấy đều', 'Đẻ nhánh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại sau 5-7 ngày', 'Bệnh mạnh khi 28-32°C, ẩm độ 96-100%, tán lá dày', 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('STARSUPER 10SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '1,0 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '1,0 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-600 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 1,
    dosage_value_max = NULL,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 600,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm thuốc khi đang khuấy',
    application_time = 'Khô vằn ở giai đoạn đẻ nhánh - làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Kiểm tra lại sau đợt đầu nếu vết bệnh tiếp tục lan',
    safety_notes = 'Tránh mưa ngay sau phun',
    description = 'Phun khi tỷ lệ bệnh khoảng 10-20%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Kiểm tra lại sau đợt đầu nếu vết bệnh tiếp tục lan.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NewTec 300SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '1,0 L/ha',
       '1,0 L/ha', NULL, '400-600 L/ha',
       'PER_HA', 1, NULL, 'L', 1, 'HA',
       400, 600, 'L/HA',
       'Cho nước trước, thêm thuốc khi đang khuấy', 'Khô vằn ở giai đoạn đẻ nhánh - làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Kiểm tra lại sau đợt đầu nếu vết bệnh tiếp tục lan', 'Tránh mưa ngay sau phun', 'Phun khi tỷ lệ bệnh khoảng 10-20%. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Kiểm tra lại sau đợt đầu nếu vết bệnh tiếp tục lan.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('NewTec 300SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,25-0,3 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,25-0,3 L/ha',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sản phẩm',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.25,
    dosage_value_max = 0.3,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm thuốc khi khuấy',
    application_time = 'Làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi theo áp lực bệnh',
    safety_notes = 'Ruộng ẩm cao, tán lá rậm là điều kiện thuận lợi cho bệnh',
    description = 'Phun vào thời điểm lúa làm đòng. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi theo áp lực bệnh.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Amistar Top 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,25-0,3 L/ha',
       '0,25-0,3 L/ha', NULL, 'Theo nhãn sản phẩm',
       'PER_HA', 0.25, 0.3, 'L', 1, 'HA',
       NULL, NULL, NULL,
       'Cho nước trước, thêm thuốc khi khuấy', 'Làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi theo áp lực bệnh', 'Ruộng ẩm cao, tán lá rậm là điều kiện thuận lợi cho bệnh', 'Phun vào thời điểm lúa làm đòng. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi theo áp lực bệnh.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Amistar Top 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,3-0,5 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,3-0,5 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '400-500 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.3,
    dosage_value_max = 0.5,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 500,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước vào bồn trước, thêm thuốc sau',
    application_time = 'Sinh trưởng đến đòng trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại ruộng nếu bệnh còn lan',
    safety_notes = 'Hiệu quả tốt khi bệnh mới xuất hiện',
    description = 'Phun khi thấy bệnh xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại ruộng nếu bệnh còn lan.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Nevo 330EC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,3-0,5 L/ha',
       '0,3-0,5 L/ha', NULL, '400-500 L/ha',
       'PER_HA', 0.3, 0.5, 'L', 1, 'HA',
       400, 500, 'L/HA',
       'Cho nước vào bồn trước, thêm thuốc sau', 'Sinh trưởng đến đòng trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại ruộng nếu bệnh còn lan', 'Hiệu quả tốt khi bệnh mới xuất hiện', 'Phun khi thấy bệnh xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi lại ruộng nếu bệnh còn lan.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Nevo 330EC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '1,0-1,2 L/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '1,0-1,2 L/ha',
    mixing_instruction = NULL,
    display_water_volume = '320-400 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 1,
    dosage_value_max = 1.2,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 320,
    water_volume_max = 400,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm thuốc sau, khuấy đều',
    application_time = 'Đẻ nhánh đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi sau 5-7 ngày',
    safety_notes = 'Bệnh phát triển mạnh trong điều kiện ẩm độ rất cao',
    description = 'Phun khi bệnh mới xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi sau 5-7 ngày.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('CENTERVIN 50SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '1,0-1,2 L/ha',
       '1,0-1,2 L/ha', NULL, '320-400 L/ha',
       'PER_HA', 1, 1.2, 'L', 1, 'HA',
       320, 400, 'L/HA',
       'Cho nước trước, thêm thuốc sau, khuấy đều', 'Đẻ nhánh đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi sau 5-7 ngày', 'Bệnh phát triển mạnh trong điều kiện ẩm độ rất cao', 'Phun khi bệnh mới xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi sau 5-7 ngày.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('CENTERVIN 50SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sử dụng thực tế',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm TOPMYSTAR 325SC khi khuấy',
    application_time = 'Làm đòng đến trổ',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Đánh giá lại theo thực tế ruộng',
    safety_notes = 'Hiệu quả cao hơn khi phun sớm',
    description = 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo thực tế ruộng.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
       'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp', NULL, 'Theo nhãn sử dụng thực tế',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Cho nước trước, thêm TOPMYSTAR 325SC khi khuấy', 'Làm đòng đến trổ', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Đánh giá lại theo thực tế ruộng', 'Hiệu quả cao hơn khi phun sớm', 'Phun khi bệnh chớm xuất hiện. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Đánh giá lại theo thực tế ruộng.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('TOPMYSTAR 325SC TOP NHẬT')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sử dụng của sản phẩm',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước rồi thêm thuốc khi khuấy liên tục',
    application_time = 'Nuôi đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi theo áp lực bệnh',
    safety_notes = 'Ruộng rậm, ẩm cao là điều kiện thuận lợi của bệnh',
    description = 'Phun ở thời kỳ nuôi đòng 50-60 ngày sau sạ. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi theo áp lực bệnh.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Reflect Xtra 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp',
       'Liều dùng theo nhãn sản phẩm cho nhóm bệnh lúa phù hợp', NULL, 'Theo nhãn sử dụng của sản phẩm',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Cho nước trước rồi thêm thuốc khi khuấy liên tục', 'Nuôi đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi theo áp lực bệnh', 'Ruộng rậm, ẩm cao là điều kiện thuận lợi của bệnh', 'Phun ở thời kỳ nuôi đòng 50-60 ngày sau sạ. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi theo áp lực bệnh.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Reflect Xtra 325SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Liều dùng theo nhãn sản phẩm thực tế',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Liều dùng theo nhãn sản phẩm thực tế',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sử dụng thực tế',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Cho nước trước, thêm thuốc khi đang khuấy',
    application_time = 'Sinh trưởng đến làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi thực tế ruộng',
    safety_notes = 'Bệnh nặng hơn trong điều kiện ẩm cao, ruộng rậm',
    description = 'Dùng cho nhóm bệnh đốm vằn/khô vằn khi ruộng bắt đầu có bệnh. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi thực tế ruộng.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Anvil 5SC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Liều dùng theo nhãn sản phẩm thực tế',
       'Liều dùng theo nhãn sản phẩm thực tế', NULL, 'Theo nhãn sử dụng thực tế',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Cho nước trước, thêm thuốc khi đang khuấy', 'Sinh trưởng đến làm đòng', NULLIF(substring(coalesce('Theo dõi thực tế ruộng để quyết định số lần phun', ''), '^[0-9]+'), '')::smallint, 'Theo dõi thực tế ruộng', 'Bệnh nặng hơn trong điều kiện ẩm cao, ruộng rậm', 'Dùng cho nhóm bệnh đốm vằn/khô vằn khi ruộng bắt đầu có bệnh. Số lần phun: Theo dõi thực tế ruộng để quyết định số lần phun. Khoảng cách: Theo dõi thực tế ruộng.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Anvil 5SC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,75-1,0 L/ha cho rầy xanh trên lúa',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,75-1,0 L/ha cho rầy xanh trên lúa',
    mixing_instruction = NULL,
    display_water_volume = '400-800 L/ha',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.75,
    dosage_value_max = 1,
    dosage_unit = 'L',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = 400,
    water_volume_max = 800,
    water_volume_unit = 'L/HA',
    application_method = 'Cho nước trước, thêm Selecron 500EC khi đang khuấy',
    application_time = 'Đặc biệt quan trọng ở giai đoạn sinh trưởng dinh dưỡng',
    spray_times = NULLIF(substring(coalesce('Theo mật độ rầy và áp lực truyền bệnh', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi quần thể rầy sau xử lý',
    safety_notes = 'Tungro phụ thuộc sự hiện diện của rầy xanh; nên xử lý sớm khi quần thể rầy tăng',
    description = 'Phun khi rầy xanh chớm xuất hiện ở ruộng có nguy cơ Tungro. Số lần phun: Theo mật độ rầy và áp lực truyền bệnh. Khoảng cách: Theo dõi quần thể rầy sau xử lý.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Selecron 500EC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,75-1,0 L/ha cho rầy xanh trên lúa',
       '0,75-1,0 L/ha cho rầy xanh trên lúa', NULL, '400-800 L/ha',
       'PER_HA', 0.75, 1, 'L', 1, 'HA',
       400, 800, 'L/HA',
       'Cho nước trước, thêm Selecron 500EC khi đang khuấy', 'Đặc biệt quan trọng ở giai đoạn sinh trưởng dinh dưỡng', NULLIF(substring(coalesce('Theo mật độ rầy và áp lực truyền bệnh', ''), '^[0-9]+'), '')::smallint, 'Theo dõi quần thể rầy sau xử lý', 'Tungro phụ thuộc sự hiện diện của rầy xanh; nên xử lý sớm khi quần thể rầy tăng', 'Phun khi rầy xanh chớm xuất hiện ở ruộng có nguy cơ Tungro. Số lần phun: Theo mật độ rầy và áp lực truyền bệnh. Khoảng cách: Theo dõi quần thể rầy sau xử lý.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Selecron 500EC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = 'Liều dùng theo nhãn sản phẩm thực tế',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = 'Liều dùng theo nhãn sản phẩm thực tế',
    mixing_instruction = NULL,
    display_water_volume = 'Theo nhãn sản phẩm thực tế',
    dosage_type = NULL,
    dosage_value_min = NULL,
    dosage_value_max = NULL,
    dosage_unit = NULL,
    dosage_area_value = NULL,
    dosage_area_unit = NULL,
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Pha theo nhãn nhà sản xuất khi có bao bì/nhãn chi tiết',
    application_time = 'Giai đoạn sinh dưỡng cần ưu tiên cắt rầy sớm',
    spray_times = NULLIF(substring(coalesce('Theo mật độ rầy ngoài đồng', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại quần thể rầy sau xử lý',
    safety_notes = 'Tungro tăng khi có nguồn virus và quần thể rầy xanh mang bệnh',
    description = 'Phun khi rầy xanh, rầy lưng trắng hoặc rầy nâu chớm xuất hiện. Số lần phun: Theo mật độ rầy ngoài đồng. Khoảng cách: Theo dõi lại quần thể rầy sau xử lý.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('HOPPECIN 50EC')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, 'Liều dùng theo nhãn sản phẩm thực tế',
       'Liều dùng theo nhãn sản phẩm thực tế', NULL, 'Theo nhãn sản phẩm thực tế',
       NULL, NULL, NULL, NULL, NULL, NULL,
       NULL, NULL, NULL,
       'Pha theo nhãn nhà sản xuất khi có bao bì/nhãn chi tiết', 'Giai đoạn sinh dưỡng cần ưu tiên cắt rầy sớm', NULLIF(substring(coalesce('Theo mật độ rầy ngoài đồng', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại quần thể rầy sau xử lý', 'Tungro tăng khi có nguồn virus và quần thể rầy xanh mang bệnh', 'Phun khi rầy xanh, rầy lưng trắng hoặc rầy nâu chớm xuất hiện. Số lần phun: Theo mật độ rầy ngoài đồng. Khoảng cách: Theo dõi lại quần thể rầy sau xử lý.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('HOPPECIN 50EC')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );

UPDATE public.treatment_plan tp
SET drug_id = dr.id,
    drug_name = dr.drug_name,
    dosage = '0,5-0,7 kg/ha',
    treatment_name = dr.drug_name || ' - ' || dis.disease_name,
    display_dosage = '0,5-0,7 kg/ha',
    mixing_instruction = NULL,
    display_water_volume = 'Phun ướt đều bề mặt lá',
    dosage_type = 'PER_HA',
    dosage_value_min = 0.5,
    dosage_value_max = 0.7,
    dosage_unit = 'KG',
    dosage_area_value = 1,
    dosage_area_unit = 'HA',
    water_volume_min = NULL,
    water_volume_max = NULL,
    water_volume_unit = NULL,
    application_method = 'Hòa hạt thuốc vào nước từ từ, khuấy đều trước khi phun',
    application_time = 'Sinh trưởng dinh dưỡng đến đầu làm đòng',
    spray_times = NULLIF(substring(coalesce('Theo mật độ rầy', ''), '^[0-9]+'), '')::smallint,
    spray_interval = 'Theo dõi lại sau xử lý để quyết định lần kế tiếp',
    safety_notes = 'Tập trung khi rầy xanh hiện diện trong ruộng',
    description = 'Phun ướt đều bề mặt lá khi có rầy xanh/rầy chích hút. Số lần phun: Theo mật độ rầy. Khoảng cách: Theo dõi lại sau xử lý để quyết định lần kế tiếp.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Minecto Star 60WG')) AND coalesce(dr.is_delete, false) = false
WHERE tp.disease_id = dis.id
  AND tp.drug_id = dr.id
  AND dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(tp.is_delete, false) = false;

INSERT INTO public.treatment_plan (
  disease_id, drug_id, treatment_name, drug_name, dosage,
  display_dosage, mixing_instruction, display_water_volume,
  dosage_type, dosage_value_min, dosage_value_max, dosage_unit, dosage_area_value, dosage_area_unit,
  water_volume_min, water_volume_max, water_volume_unit,
  application_method, application_time, spray_times, spray_interval, safety_notes, description,
  is_required, is_active, created_at, is_delete
)
SELECT dis.id, dr.id, dr.drug_name || ' - ' || dis.disease_name, dr.drug_name, '0,5-0,7 kg/ha',
       '0,5-0,7 kg/ha', NULL, 'Phun ướt đều bề mặt lá',
       'PER_HA', 0.5, 0.7, 'KG', 1, 'HA',
       NULL, NULL, NULL,
       'Hòa hạt thuốc vào nước từ từ, khuấy đều trước khi phun', 'Sinh trưởng dinh dưỡng đến đầu làm đòng', NULLIF(substring(coalesce('Theo mật độ rầy', ''), '^[0-9]+'), '')::smallint, 'Theo dõi lại sau xử lý để quyết định lần kế tiếp', 'Tập trung khi rầy xanh hiện diện trong ruộng', 'Phun ướt đều bề mặt lá khi có rầy xanh/rầy chích hút. Số lần phun: Theo mật độ rầy. Khoảng cách: Theo dõi lại sau xử lý để quyết định lần kế tiếp.',
       false, true, now(), false
FROM public.disease dis
JOIN public.drug dr ON lower(trim(dr.drug_name)) = lower(trim('Minecto Star 60WG')) AND coalesce(dr.is_delete, false) = false
WHERE dis.disease_code = 'TUNGRO'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_plan tp
    WHERE tp.disease_id = dis.id
      AND tp.drug_id = dr.id
      AND coalesce(tp.is_delete, false) = false
  );


-- 6) disease_weather_condition

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BLAST_HIGH_1', 'TEMPERATURE', 'BETWEEN', 20, 28, '°C', 'Điều kiện thuận lợi cho đạo ôn khi nhiệt độ nằm trong khoảng 20-28°C.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BLAST_HIGH_1'
      AND dwc.weather_factor = 'TEMPERATURE'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 20,
    max_value = 28,
    unit = '°C',
    recommendation_note = 'Điều kiện thuận lợi cho đạo ôn khi nhiệt độ nằm trong khoảng 20-28°C.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BLAST_RICE'
  AND dwc.condition_group = 'BLAST_HIGH_1'
  AND dwc.weather_factor = 'TEMPERATURE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BLAST_HIGH_1', 'HUMIDITY', 'GREATER_THAN', 90, NULL, '%', 'Nguy cơ đạo ôn tăng cao khi độ ẩm không khí trên 90%.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BLAST_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BLAST_HIGH_1'
      AND dwc.weather_factor = 'HUMIDITY'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'GREATER_THAN',
    min_value = 90,
    max_value = NULL,
    unit = '%',
    recommendation_note = 'Nguy cơ đạo ôn tăng cao khi độ ẩm không khí trên 90%.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BLAST_RICE'
  AND dwc.condition_group = 'BLAST_HIGH_1'
  AND dwc.weather_factor = 'HUMIDITY'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'SHEATH_BLIGHT_HIGH_1', 'TEMPERATURE', 'BETWEEN', 28, 32, '°C', 'Khô vằn phát triển mạnh trong điều kiện nhiệt độ 28-32°C.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'SHEATH_BLIGHT_HIGH_1'
      AND dwc.weather_factor = 'TEMPERATURE'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 28,
    max_value = 32,
    unit = '°C',
    recommendation_note = 'Khô vằn phát triển mạnh trong điều kiện nhiệt độ 28-32°C.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND dwc.condition_group = 'SHEATH_BLIGHT_HIGH_1'
  AND dwc.weather_factor = 'TEMPERATURE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'SHEATH_BLIGHT_HIGH_1', 'HUMIDITY', 'BETWEEN', 85, 100, '%', 'Khô vằn thuận lợi khi ẩm độ tán lá duy trì ở mức 85-100%.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'SHEATH_BLIGHT'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'SHEATH_BLIGHT_HIGH_1'
      AND dwc.weather_factor = 'HUMIDITY'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 85,
    max_value = 100,
    unit = '%',
    recommendation_note = 'Khô vằn thuận lợi khi ẩm độ tán lá duy trì ở mức 85-100%.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'SHEATH_BLIGHT'
  AND dwc.condition_group = 'SHEATH_BLIGHT_HIGH_1'
  AND dwc.weather_factor = 'HUMIDITY'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BLB_HIGH_1', 'TEMPERATURE', 'BETWEEN', 25, 34, '°C', 'Bạc lá có nguy cơ cao khi nhiệt độ nằm trong khoảng 25-34°C.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BLB_HIGH_1'
      AND dwc.weather_factor = 'TEMPERATURE'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 25,
    max_value = 34,
    unit = '°C',
    recommendation_note = 'Bạc lá có nguy cơ cao khi nhiệt độ nằm trong khoảng 25-34°C.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BLB_RICE'
  AND dwc.condition_group = 'BLB_HIGH_1'
  AND dwc.weather_factor = 'TEMPERATURE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BLB_HIGH_1', 'HUMIDITY', 'GREATER_THAN', 70, NULL, '%', 'Bạc lá dễ bùng phát khi độ ẩm tương đối trên 70%.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BLB_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BLB_HIGH_1'
      AND dwc.weather_factor = 'HUMIDITY'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'GREATER_THAN',
    min_value = 70,
    max_value = NULL,
    unit = '%',
    recommendation_note = 'Bạc lá dễ bùng phát khi độ ẩm tương đối trên 70%.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BLB_RICE'
  AND dwc.condition_group = 'BLB_HIGH_1'
  AND dwc.weather_factor = 'HUMIDITY'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BLS_HIGH_1', 'TEMPERATURE', 'BETWEEN', 27, 35, '°C', 'Sọc vi khuẩn phát sinh mạnh trong điều kiện nóng ẩm 27-35°C.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BLS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BLS_HIGH_1'
      AND dwc.weather_factor = 'TEMPERATURE'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 27,
    max_value = 35,
    unit = '°C',
    recommendation_note = 'Sọc vi khuẩn phát sinh mạnh trong điều kiện nóng ẩm 27-35°C.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BLS_RICE'
  AND dwc.condition_group = 'BLS_HIGH_1'
  AND dwc.weather_factor = 'TEMPERATURE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BROWN_SPOT_HIGH_1', 'TEMPERATURE', 'BETWEEN', 25, 30, '°C', 'Đốm nâu phát triển thuận lợi ở nhiệt độ 25-30°C.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BROWN_SPOT_HIGH_1'
      AND dwc.weather_factor = 'TEMPERATURE'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'BETWEEN',
    min_value = 25,
    max_value = 30,
    unit = '°C',
    recommendation_note = 'Đốm nâu phát triển thuận lợi ở nhiệt độ 25-30°C.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BS_RICE'
  AND dwc.condition_group = 'BROWN_SPOT_HIGH_1'
  AND dwc.weather_factor = 'TEMPERATURE'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

INSERT INTO public.disease_weather_condition (disease_id, condition_group, weather_factor, operator, min_value, max_value, unit, recommendation_note, is_active, created_at, is_delete)
SELECT dis.id, 'BROWN_SPOT_HIGH_1', 'HUMIDITY', 'GREATER_THAN', 80, NULL, '%', 'Đốm nâu có nguy cơ cao khi độ ẩm tương đối trên 80%.', true, now(), false
FROM public.disease dis
WHERE dis.disease_code = 'BS_RICE'
  AND coalesce(dis.is_delete, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM public.disease_weather_condition dwc
    WHERE dwc.disease_id = dis.id
      AND dwc.condition_group = 'BROWN_SPOT_HIGH_1'
      AND dwc.weather_factor = 'HUMIDITY'
      AND coalesce(dwc.is_delete, false) = false
  );

UPDATE public.disease_weather_condition dwc
SET operator = 'GREATER_THAN',
    min_value = 80,
    max_value = NULL,
    unit = '%',
    recommendation_note = 'Đốm nâu có nguy cơ cao khi độ ẩm tương đối trên 80%.',
    is_active = true,
    updated_at = now()
FROM public.disease dis
WHERE dwc.disease_id = dis.id
  AND dis.disease_code = 'BS_RICE'
  AND dwc.condition_group = 'BROWN_SPOT_HIGH_1'
  AND dwc.weather_factor = 'HUMIDITY'
  AND coalesce(dis.is_delete, false) = false
  AND coalesce(dwc.is_delete, false) = false;

-- 7) drug_interaction

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Có thể phối hợp để tăng hiệu quả phòng trừ bệnh hại lúa.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Có thể phối hợp để tăng hiệu quả phòng trừ bệnh hại lúa.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Azoxystrobin')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Có thể phối hợp để tăng hiệu quả phòng trừ bệnh hại lúa.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Có thể phối hợp để tăng hiệu quả phòng trừ bệnh hại lúa.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Difenoconazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Có thể phối hợp để tăng hiệu quả phòng trừ nấm và vi khuẩn hại lúa.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Có thể phối hợp để tăng hiệu quả phòng trừ nấm và vi khuẩn hại lúa.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Ningnanmycin'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Hỗn hợp rất tốt để tăng hiệu quả phòng trừ nấm bệnh trên lúa.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Azoxystrobin'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Hỗn hợp rất tốt để tăng hiệu quả phòng trừ nấm bệnh trên lúa.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Azoxystrobin'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Hỗn hợp rất tốt để tăng hiệu quả phòng trừ nấm bệnh trên lúa.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Difenoconazole'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Hỗn hợp rất tốt để tăng hiệu quả phòng trừ nấm bệnh trên lúa.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Difenoconazole'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Hai hoạt chất cùng có trong STARSUPER 10SC.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Kasugamycin'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Hai hoạt chất cùng có trong STARSUPER 10SC.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Polyoxin')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Kasugamycin'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Hai hoạt chất cùng có trong TRYXO 750WP.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Oxolinic acid'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Hai hoạt chất cùng có trong TRYXO 750WP.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Oxolinic acid'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Hai hoạt chất cùng có trong Filia 525SE.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Tricyclazole'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Hai hoạt chất cùng có trong Filia 525SE.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Propiconazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Tricyclazole'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'SUPPORT', 'LOW', 'Tương hỗ mạnh trong NewTec 300SC.', 'MIX', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Hexaconazole'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'SUPPORT',
    severity = 'LOW',
    warning_message = 'Tương hỗ mạnh trong NewTec 300SC.',
    action_rule = 'MIX',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('Tricyclazole')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Hexaconazole'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

INSERT INTO public.drug_interaction (ingredient_a_id, ingredient_b_id, interaction_type, severity, warning_message, action_rule, interval_days, created_at, is_delete)
SELECT least(ia.id, ib.id), greatest(ia.id, ib.id), 'CONFLICT', 'HIGH', 'Ion đồng có thể ức chế hoặc tiêu diệt vi khuẩn sống, làm giảm hiệu lực chế phẩm sinh học.', 'SEPARATE', NULL, now(), false
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('thuốc gốc đồng')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Chế phẩm sinh học chứa Bacillus subtilis'))
  AND coalesce(ia.is_delete, false) = false
  AND ia.id <> ib.id
  AND NOT EXISTS (
    SELECT 1 FROM public.drug_interaction di
    WHERE di.ingredient_a_id = least(ia.id, ib.id)
      AND di.ingredient_b_id = greatest(ia.id, ib.id)
      AND coalesce(di.is_delete, false) = false
  );

UPDATE public.drug_interaction di
SET interaction_type = 'CONFLICT',
    severity = 'HIGH',
    warning_message = 'Ion đồng có thể ức chế hoặc tiêu diệt vi khuẩn sống, làm giảm hiệu lực chế phẩm sinh học.',
    action_rule = 'SEPARATE',
    interval_days = NULL,
    updated_at = now()
FROM public.ingredient ia
JOIN public.ingredient ib ON lower(trim(ib.ingredient_name)) = lower(trim('thuốc gốc đồng')) AND coalesce(ib.is_delete, false) = false
WHERE lower(trim(ia.ingredient_name)) = lower(trim('Chế phẩm sinh học chứa Bacillus subtilis'))
  AND coalesce(ia.is_delete, false) = false
  AND di.ingredient_a_id = least(ia.id, ib.id)
  AND di.ingredient_b_id = greatest(ia.id, ib.id)
  AND coalesce(di.is_delete, false) = false;

COMMIT;
