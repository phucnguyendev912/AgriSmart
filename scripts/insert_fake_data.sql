-- Record 1: An Giang - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('An Giang', 10.521479, 105.110350, NOW() - INTERVAL '12 days 4 hours 6 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.8299, created_at, false FROM new_hist;

-- Record 2: Gia Lai - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Gia Lai', 13.778757, 108.170825, NOW() - INTERVAL '21 days 4 hours 10 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'TRUNG_BINH', 0.9492, created_at, false FROM new_hist;

-- Record 3: Hậu Giang - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hậu Giang', 9.783495, 105.629515, NOW() - INTERVAL '23 days 9 hours 17 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'TRUNG_BINH', 0.8752, created_at, false FROM new_hist;

-- Record 4: Bạc Liêu - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bạc Liêu', 9.391027, 105.537779, NOW() - INTERVAL '1 days 22 hours 34 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NANG', 0.7724, created_at, false FROM new_hist;

-- Record 5: Đắk Lắk - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đắk Lắk', 12.682786, 108.025218, NOW() - INTERVAL '12 days 18 hours 45 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'TRUNG_BINH', 0.9003, created_at, false FROM new_hist;

-- Record 6: Bình Định - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bình Định', 13.898346, 109.127630, NOW() - INTERVAL '2 days 13 hours 0 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NANG', 0.784, created_at, false FROM new_hist;

-- Record 7: Ninh Bình - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Ninh Bình', 20.258239, 105.957687, NOW() - INTERVAL '21 days 15 hours 55 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.7699, created_at, false FROM new_hist;

-- Record 8: Phú Yên - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Yên', 13.117825, 109.308065, NOW() - INTERVAL '19 days 21 hours 1 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NANG', 0.8279, created_at, false FROM new_hist;

-- Record 9: Bình Định - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bình Định', 13.753536, 109.182366, NOW() - INTERVAL '2 days 10 hours 23 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NANG', 0.9179, created_at, false FROM new_hist;

-- Record 10: Sóc Trăng - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Sóc Trăng', 9.616155, 105.996010, NOW() - INTERVAL '15 days 16 hours 20 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.825, created_at, false FROM new_hist;

-- Record 11: Đắk Nông - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đắk Nông', 12.021345, 107.680887, NOW() - INTERVAL '17 days 17 hours 58 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.8132, created_at, false FROM new_hist;

-- Record 12: Long An - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Long An', 10.513731, 106.403953, NOW() - INTERVAL '14 days 22 hours 28 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'TRUNG_BINH', 0.7699, created_at, false FROM new_hist;

-- Record 13: Lào Cai - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Lào Cai', 22.313664, 103.854210, NOW() - INTERVAL '25 days 21 hours 9 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NANG', 0.7749, created_at, false FROM new_hist;

-- Record 14: Hải Dương - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hải Dương', 20.839405, 106.239792, NOW() - INTERVAL '5 days 16 hours 46 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'TRUNG_BINH', 0.9805, created_at, false FROM new_hist;

-- Record 15: Yên Bái - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Yên Bái', 21.668811, 104.838080, NOW() - INTERVAL '20 days 12 hours 59 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'TRUNG_BINH', 0.9222, created_at, false FROM new_hist;

-- Record 16: Quảng Nam - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Nam', 15.728664, 108.238917, NOW() - INTERVAL '21 days 21 hours 22 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NHE', 0.8271, created_at, false FROM new_hist;

-- Record 17: Thái Bình - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Thái Bình', 20.460030, 106.410295, NOW() - INTERVAL '7 days 22 hours 53 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'TRUNG_BINH', 0.8239, created_at, false FROM new_hist;

-- Record 18: Phú Yên - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Yên', 13.116809, 109.228451, NOW() - INTERVAL '22 days 7 hours 52 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'TRUNG_BINH', 0.8082, created_at, false FROM new_hist;

-- Record 19: Thái Bình - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Thái Bình', 20.412861, 106.325195, NOW() - INTERVAL '10 days 2 hours 45 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'TRUNG_BINH', 0.8075, created_at, false FROM new_hist;

-- Record 20: Khánh Hòa - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Khánh Hòa', 12.272124, 109.206443, NOW() - INTERVAL '1 days 2 hours 26 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.9648, created_at, false FROM new_hist;

-- Record 21: Thái Bình - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Thái Bình', 20.503235, 106.483228, NOW() - INTERVAL '8 days 6 hours 39 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.7618, created_at, false FROM new_hist;

-- Record 22: Phú Yên - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Yên', 13.059039, 109.335404, NOW() - INTERVAL '24 days 5 hours 0 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NANG', 0.9687, created_at, false FROM new_hist;

-- Record 23: Bình Thuận - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bình Thuận', 10.891829, 108.104329, NOW() - INTERVAL '16 days 17 hours 3 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.8079, created_at, false FROM new_hist;

-- Record 24: Lâm Đồng - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Lâm Đồng', 11.709785, 108.187483, NOW() - INTERVAL '4 days 8 hours 17 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NANG', 0.9875, created_at, false FROM new_hist;

-- Record 25: An Giang - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('An Giang', 10.337310, 105.415376, NOW() - INTERVAL '13 days 3 hours 15 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.9737, created_at, false FROM new_hist;

-- Record 26: Hải Dương - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hải Dương', 20.930095, 106.325005, NOW() - INTERVAL '18 days 10 hours 20 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NHE', 0.9879, created_at, false FROM new_hist;

-- Record 27: Quảng Nam - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Nam', 15.842433, 108.358884, NOW() - INTERVAL '13 days 20 hours 19 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NHE', 0.8852, created_at, false FROM new_hist;

-- Record 28: Bắc Ninh - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bắc Ninh', 21.208837, 106.033064, NOW() - INTERVAL '14 days 10 hours 14 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NHE', 0.8221, created_at, false FROM new_hist;

-- Record 29: Đồng Tháp - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đồng Tháp', 10.477454, 105.642569, NOW() - INTERVAL '13 days 10 hours 44 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.923, created_at, false FROM new_hist;

-- Record 30: Lâm Đồng - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Lâm Đồng', 11.545245, 107.782867, NOW() - INTERVAL '3 days 11 hours 52 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NHE', 0.925, created_at, false FROM new_hist;

-- Record 31: Thái Bình - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Thái Bình', 20.487541, 106.433328, NOW() - INTERVAL '2 days 14 hours 17 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NANG', 0.7559, created_at, false FROM new_hist;

-- Record 32: Nam Định - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nam Định', 20.241092, 106.236389, NOW() - INTERVAL '10 days 16 hours 22 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NHE', 0.9311, created_at, false FROM new_hist;

-- Record 33: Cần Thơ - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cần Thơ', 10.023811, 105.801397, NOW() - INTERVAL '18 days 7 hours 33 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.9524, created_at, false FROM new_hist;

-- Record 34: Bạc Liêu - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bạc Liêu', 9.264795, 105.762068, NOW() - INTERVAL '9 days 12 hours 5 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NANG', 0.7685, created_at, false FROM new_hist;

-- Record 35: Bình Định - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bình Định', 13.800966, 109.214110, NOW() - INTERVAL '2 days 7 hours 15 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.9533, created_at, false FROM new_hist;

-- Record 36: Hà Tĩnh - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Tĩnh', 18.370616, 105.918700, NOW() - INTERVAL '13 days 22 hours 18 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NHE', 0.8704, created_at, false FROM new_hist;

-- Record 37: Hậu Giang - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hậu Giang', 9.783994, 105.613687, NOW() - INTERVAL '14 days 0 hours 44 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.8329, created_at, false FROM new_hist;

-- Record 38: Nam Định - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nam Định', 20.395065, 106.162749, NOW() - INTERVAL '16 days 17 hours 16 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NANG', 0.8674, created_at, false FROM new_hist;

-- Record 39: Gia Lai - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Gia Lai', 13.791632, 108.191463, NOW() - INTERVAL '3 days 16 hours 33 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.8166, created_at, false FROM new_hist;

-- Record 40: Vĩnh Long - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Vĩnh Long', 10.275373, 105.959331, NOW() - INTERVAL '18 days 22 hours 38 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NHE', 0.9137, created_at, false FROM new_hist;

-- Record 41: Yên Bái - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Yên Bái', 21.579921, 104.335768, NOW() - INTERVAL '1 days 23 hours 2 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'TRUNG_BINH', 0.8802, created_at, false FROM new_hist;

-- Record 42: Bến Tre - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bến Tre', 10.172881, 106.474207, NOW() - INTERVAL '14 days 6 hours 9 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.886, created_at, false FROM new_hist;

-- Record 43: Phú Thọ - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Thọ', 21.339019, 105.380341, NOW() - INTERVAL '9 days 18 hours 57 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NHE', 0.8037, created_at, false FROM new_hist;

-- Record 44: Trà Vinh - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Trà Vinh', 9.912644, 106.358096, NOW() - INTERVAL '15 days 14 hours 8 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NANG', 0.8417, created_at, false FROM new_hist;

-- Record 45: Quảng Ngãi - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Ngãi', 15.018556, 108.715204, NOW() - INTERVAL '2 days 19 hours 35 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NANG', 0.9358, created_at, false FROM new_hist;

-- Record 46: Trà Vinh - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Trà Vinh', 9.763616, 106.224797, NOW() - INTERVAL '19 days 3 hours 49 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.8182, created_at, false FROM new_hist;

-- Record 47: Long An - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Long An', 10.745281, 106.214389, NOW() - INTERVAL '21 days 12 hours 28 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'TRUNG_BINH', 0.8196, created_at, false FROM new_hist;

-- Record 48: Cần Thơ - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cần Thơ', 10.187913, 105.486795, NOW() - INTERVAL '12 days 12 hours 50 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.8587, created_at, false FROM new_hist;

-- Record 49: Vĩnh Long - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Vĩnh Long', 10.122707, 105.879337, NOW() - INTERVAL '5 days 17 hours 13 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.8241, created_at, false FROM new_hist;

-- Record 50: Ninh Thuận - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Ninh Thuận', 11.536085, 109.017883, NOW() - INTERVAL '8 days 18 hours 53 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'TRUNG_BINH', 0.8655, created_at, false FROM new_hist;

-- Record 51: Nam Định - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nam Định', 20.187100, 106.116826, NOW() - INTERVAL '10 days 7 hours 53 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NHE', 0.8412, created_at, false FROM new_hist;

-- Record 52: Nghệ An - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nghệ An', 18.935753, 105.309459, NOW() - INTERVAL '15 days 5 hours 54 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NHE', 0.7528, created_at, false FROM new_hist;

-- Record 53: Yên Bái - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Yên Bái', 21.629076, 104.284681, NOW() - INTERVAL '15 days 18 hours 34 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NANG', 0.7602, created_at, false FROM new_hist;

-- Record 54: Hưng Yên - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hưng Yên', 20.766013, 106.041809, NOW() - INTERVAL '15 days 23 hours 48 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.9515, created_at, false FROM new_hist;

-- Record 55: Vĩnh Long - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Vĩnh Long', 10.288985, 106.005129, NOW() - INTERVAL '25 days 3 hours 33 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NANG', 0.9883, created_at, false FROM new_hist;

-- Record 56: Sóc Trăng - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Sóc Trăng', 9.544012, 105.730450, NOW() - INTERVAL '21 days 5 hours 49 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NANG', 0.8337, created_at, false FROM new_hist;

-- Record 57: Hà Tĩnh - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Tĩnh', 18.212010, 105.720424, NOW() - INTERVAL '13 days 0 hours 23 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'TRUNG_BINH', 0.9062, created_at, false FROM new_hist;

-- Record 58: Kiên Giang - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Kiên Giang', 10.084678, 104.998664, NOW() - INTERVAL '3 days 2 hours 22 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.8856, created_at, false FROM new_hist;

-- Record 59: Vĩnh Long - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Vĩnh Long', 10.244020, 105.962694, NOW() - INTERVAL '11 days 9 hours 44 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.855, created_at, false FROM new_hist;

-- Record 60: Hà Nội - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Nội', 21.048926, 105.571502, NOW() - INTERVAL '20 days 23 hours 1 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NANG', 0.828, created_at, false FROM new_hist;

-- Record 61: Hòa Bình - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hòa Bình', 20.787559, 105.300902, NOW() - INTERVAL '21 days 14 hours 50 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.8783, created_at, false FROM new_hist;

-- Record 62: Phú Yên - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Yên', 13.084135, 109.323318, NOW() - INTERVAL '23 days 5 hours 5 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'TRUNG_BINH', 0.7719, created_at, false FROM new_hist;

-- Record 63: Quảng Ngãi - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Ngãi', 14.967391, 108.690639, NOW() - INTERVAL '9 days 22 hours 16 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NANG', 0.8806, created_at, false FROM new_hist;

-- Record 64: Hưng Yên - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hưng Yên', 20.641757, 106.084234, NOW() - INTERVAL '4 days 22 hours 2 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.9634, created_at, false FROM new_hist;

-- Record 65: Đồng Tháp - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đồng Tháp', 10.301089, 105.785212, NOW() - INTERVAL '5 days 6 hours 45 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'TRUNG_BINH', 0.9567, created_at, false FROM new_hist;

-- Record 66: Trà Vinh - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Trà Vinh', 9.896390, 106.327924, NOW() - INTERVAL '5 days 14 hours 46 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.922, created_at, false FROM new_hist;

-- Record 67: Bình Định - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bình Định', 13.905363, 109.087799, NOW() - INTERVAL '16 days 5 hours 49 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.7815, created_at, false FROM new_hist;

-- Record 68: Phú Yên - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Yên', 13.056293, 109.337968, NOW() - INTERVAL '22 days 21 hours 14 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.8566, created_at, false FROM new_hist;

-- Record 69: Vĩnh Long - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Vĩnh Long', 10.131785, 105.866701, NOW() - INTERVAL '20 days 10 hours 11 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.9258, created_at, false FROM new_hist;

-- Record 70: Nghệ An - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nghệ An', 18.664380, 105.654635, NOW() - INTERVAL '3 days 18 hours 13 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.9585, created_at, false FROM new_hist;

-- Record 71: Hà Nội - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Nội', 21.072692, 105.590798, NOW() - INTERVAL '12 days 20 hours 44 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.8936, created_at, false FROM new_hist;

-- Record 72: Khánh Hòa - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Khánh Hòa', 12.494615, 109.066967, NOW() - INTERVAL '18 days 15 hours 31 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NANG', 0.8684, created_at, false FROM new_hist;

-- Record 73: Nghệ An - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Nghệ An', 18.928541, 105.278727, NOW() - INTERVAL '9 days 8 hours 27 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'TRUNG_BINH', 0.8985, created_at, false FROM new_hist;

-- Record 74: Khánh Hòa - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Khánh Hòa', 12.267096, 109.178944, NOW() - INTERVAL '18 days 21 hours 53 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.9306, created_at, false FROM new_hist;

-- Record 75: Cần Thơ - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cần Thơ', 10.198652, 105.442175, NOW() - INTERVAL '20 days 10 hours 20 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.9066, created_at, false FROM new_hist;

-- Record 76: Gia Lai - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Gia Lai', 13.836758, 108.219170, NOW() - INTERVAL '24 days 22 hours 51 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NHE', 0.8103, created_at, false FROM new_hist;

-- Record 77: Quảng Ngãi - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Ngãi', 14.999400, 108.721429, NOW() - INTERVAL '3 days 19 hours 26 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NANG', 0.8163, created_at, false FROM new_hist;

-- Record 78: Phú Thọ - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Phú Thọ', 21.283841, 105.430002, NOW() - INTERVAL '25 days 2 hours 30 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.7699, created_at, false FROM new_hist;

-- Record 79: Đồng Tháp - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đồng Tháp', 10.689084, 105.547641, NOW() - INTERVAL '21 days 17 hours 17 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.9424, created_at, false FROM new_hist;

-- Record 80: Quảng Nam - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Nam', 15.880149, 108.342415, NOW() - INTERVAL '21 days 2 hours 43 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'TRUNG_BINH', 0.9366, created_at, false FROM new_hist;

-- Record 81: Yên Bái - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Yên Bái', 21.599143, 104.299593, NOW() - INTERVAL '5 days 8 hours 31 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'TRUNG_BINH', 0.9785, created_at, false FROM new_hist;

-- Record 82: Cà Mau - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cà Mau', 9.146900, 105.146269, NOW() - INTERVAL '23 days 18 hours 11 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.9638, created_at, false FROM new_hist;

-- Record 83: An Giang - Disease 5
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('An Giang', 10.256296, 105.265643, NOW() - INTERVAL '3 days 21 hours 31 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 5, 'NHE', 0.8498, created_at, false FROM new_hist;

-- Record 84: Bắc Ninh - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Bắc Ninh', 21.183116, 106.090805, NOW() - INTERVAL '3 days 4 hours 26 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.8932, created_at, false FROM new_hist;

-- Record 85: Ninh Bình - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Ninh Bình', 20.235680, 105.972835, NOW() - INTERVAL '20 days 7 hours 20 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'NHE', 0.9216, created_at, false FROM new_hist;

-- Record 86: Hà Tĩnh - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Tĩnh', 18.376892, 105.900374, NOW() - INTERVAL '6 days 8 hours 28 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'NANG', 0.9336, created_at, false FROM new_hist;

-- Record 87: Lào Cai - Disease 3
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Lào Cai', 22.479542, 103.967217, NOW() - INTERVAL '15 days 12 hours 52 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 3, 'TRUNG_BINH', 0.9531, created_at, false FROM new_hist;

-- Record 88: Hà Nam - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Nam', 20.514845, 105.915773, NOW() - INTERVAL '15 days 7 hours 47 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'NHE', 0.868, created_at, false FROM new_hist;

-- Record 89: Quảng Ngãi - Disease 8
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Quảng Ngãi', 14.961803, 108.734936, NOW() - INTERVAL '5 days 16 hours 1 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 8, 'NHE', 0.8986, created_at, false FROM new_hist;

-- Record 90: Thái Bình - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Thái Bình', 20.442090, 106.369247, NOW() - INTERVAL '24 days 8 hours 1 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'TRUNG_BINH', 0.9112, created_at, false FROM new_hist;

-- Record 91: Cà Mau - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cà Mau', 9.174153, 105.115166, NOW() - INTERVAL '2 days 13 hours 21 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'TRUNG_BINH', 0.7878, created_at, false FROM new_hist;

-- Record 92: Cần Thơ - Disease 6
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cần Thơ', 10.127608, 105.598559, NOW() - INTERVAL '18 days 6 hours 4 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 6, 'TRUNG_BINH', 0.9022, created_at, false FROM new_hist;

-- Record 93: Hà Tĩnh - Disease 1
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Hà Tĩnh', 18.330764, 105.916351, NOW() - INTERVAL '5 days 11 hours 54 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 1, 'NHE', 0.9235, created_at, false FROM new_hist;

-- Record 94: Cà Mau - Disease 7
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Cà Mau', 9.158827, 105.112294, NOW() - INTERVAL '14 days 21 hours 30 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 7, 'TRUNG_BINH', 0.7675, created_at, false FROM new_hist;

-- Record 95: Đồng Tháp - Disease 2
WITH new_area AS (
    INSERT INTO area_infor (province, latitude, longitude, created_at, is_delete)
    VALUES ('Đồng Tháp', 10.272478, 105.720628, NOW() - INTERVAL '1 days 10 hours 24 minutes', false)
    RETURNING id, latitude, longitude, created_at
), new_hist AS (
    INSERT INTO diagnose_history (areainfo_id, croptype_id, latitude, longitude, status, created_at, is_delete)
    SELECT id, 2, latitude, longitude, 'COMPLETED', created_at, false FROM new_area
    RETURNING id, created_at
)
INSERT INTO diagnose_history_detail (diagnosehistory_id, disease_id, severity_level, confidence_score, created_at, is_delete)
SELECT id, 2, 'NANG', 0.7729, created_at, false FROM new_hist;
