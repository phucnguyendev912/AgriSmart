-- =========================================================================
-- SCRIPT CẬP NHẬT THÔNG TIN CHI TIẾT BỆNH LÚA (MÔ TẢ & TRIỆU CHỨNG)
-- Dự án: AgriAI
-- =========================================================================

-- 1. Nâng cấp cấu trúc trường dữ liệu sang TEXT để lưu trữ chuỗi văn bản dài
ALTER TABLE public.disease ALTER COLUMN description TYPE text;
ALTER TABLE public.disease ALTER COLUMN symptoms TYPE text;

-- 2. Cập nhật nội dung mô tả và triệu chứng chi tiết cho 7 loại bệnh hại chính

-- Bệnh bạc lá (BLB_RICE)
UPDATE public.disease 
SET description = 'Là một trong những bệnh gây hại quan trọng trên cây lúa. Bệnh bạc lá do vi khuẩn Xanthomonas oryzae pv. oryzae gây ra và là một trong các bệnh gây hại lớn trong canh tác lúa.',
    symptoms = 'Triệu chứng bệnh thường xuất hiện trên phiến lá, ban đầu ở hai bên mép lá phía trên, sau đó lan dần vào giữa lá. Vết bệnh lúc đầu có màu xanh đậm, khi gặp nắng thì héo dần, mô lá chết tạo thành vết dài màu trắng xám. Rìa vết bệnh thường có dạng gợn sóng. Khi thời tiết ẩm hoặc vào sáng sớm, trên vết bệnh có thể xuất hiện giọt dịch màu trắng đục, khi khô chuyển sang màu vàng hoặc nâu. Nếu bệnh nặng, toàn bộ phiến lá có thể bị khô cháy.'
WHERE disease_code = 'BLB_RICE';

-- Bệnh đốm nâu (BS_RICE)
UPDATE public.disease 
SET description = 'Là bệnh hại phổ biến trên lúa, thường được nhắc đến trong các tài liệu đánh giá khả năng chống chịu sâu bệnh của giống lúa. Bệnh thường xuất hiện mạnh hơn khi cây lúa sinh trưởng yếu, điều kiện dinh dưỡng không cân đối hoặc gặp bất lợi về thời tiết. Trong sản xuất, bệnh đốm nâu được xem là một trong các chỉ tiêu cần theo dõi khi đánh giá sức chống chịu của giống lúa.',
    symptoms = 'Bệnh chủ yếu gây hại trên lá, làm xuất hiện các vết đốm màu nâu, ảnh hưởng đến diện tích lá xanh và khả năng quang hợp của cây. Khi bệnh phát triển, các vết đốm có thể lan rộng, làm lá bị khô từng phần.'
WHERE disease_code = 'BS_RICE';

-- Bệnh đạo ôn (BLAST_RICE)
UPDATE public.disease 
SET description = 'Là một trong các loại dịch hại nguy hiểm đối với cây lúa tại Việt Nam nói riêng và các quốc gia khác nói chung. Bệnh chủ yếu do nấm Pyricularia oryzae gây ra.',
    symptoms = 'Bệnh có thể gây hại trên nhiều bộ phận của cây như lá, cổ lá, đốt thân và cổ bông. Trên lá, bệnh thường tạo các vết bệnh dạng hình thoi hoặc kéo dài. Khi bệnh nặng, nhiều vết bệnh liên kết lại làm lá bị cháy khô. Nếu bệnh xuất hiện ở cổ bông, bông lúa có thể bị lép, gãy cổ bông hoặc không vào chắc, ảnh hưởng nghiêm trọng đến năng suất.'
WHERE disease_code = 'BLAST_RICE';

-- Bệnh cháy bìa lá (SCALD_RICE)
UPDATE public.disease 
SET description = 'Thường do nấm Microdochium oryzae gây ra. Bệnh chủ yếu gây hại trên lá lúa, đặc biệt ở phần mép lá và chóp lá.',
    symptoms = 'Triệu chứng thường bắt đầu bằng các vết bệnh nhỏ ở mép lá, sau đó lan rộng thành các mảng cháy có màu nâu xám hoặc trắng xám. Vết bệnh có thể tạo thành các đường vân hoặc vùng loang không đều trên lá. Khi bệnh nặng, lá bị khô từng mảng, làm giảm diện tích quang hợp.'
WHERE disease_code = 'SCALD_RICE';

-- Bệnh khô vằn (SHEATH_BLIGHT)
UPDATE public.disease 
SET description = 'Là bệnh do nấm Rhizoctonia solani gây ra, xuất hiện phổ biến ở hầu hết các vùng trồng lúa tại Việt Nam.',
    symptoms = 'Loại nấm này thường tấn công ở phần gốc, bẹ lá, sau đó lan dần lên phần thân và lá, khiến cây lúa suy yếu nhanh chóng.'
WHERE disease_code = 'SHEATH_BLIGHT';

-- Bệnh sọc vi khuẩn (BLS_RICE)
UPDATE public.disease 
SET description = 'Là bệnh hại chủ yếu trên lá lúa, do vi khuẩn Xanthomonas oryzicola gây ra. Khi bệnh phát sinh, lá lúa có thể bị cháy, làm giảm khả năng quang hợp và ảnh hưởng đến năng suất.',
    symptoms = 'Triệu chứng của bệnh là các vết sọc nhỏ, ngắn, chạy dọc giữa các gân lá. Lúc đầu, vết bệnh có màu xanh tái, sau chuyển dần sang màu nâu, tạo thành các sọc nâu hẹp. Trên bề mặt vết bệnh có thể xuất hiện những giọt dịch nhỏ, tròn, màu vàng đục. Khi khô lại, các giọt dịch này trở thành các hạt keo vi khuẩn trong như hạt trứng cá, dễ rơi khỏi mặt lá và rơi xuống nước trong ruộng.'
WHERE disease_code = 'BLS_RICE';

-- Bệnh tungro (TUNGRO)
UPDATE public.disease 
SET description = 'Là do hai loại vi-rút gây ra, gồm vi-rút tungro dạng thẳng (RTBV) và vi-rút tungro dạng cầu (RTSV). Tác nhân truyền bệnh chủ yếu là rầy xanh đuôi đen.',
    symptoms = 'Cây lúa nhiễm đồng thời cả hai loại vi-rút thường biểu hiện triệu chứng điển hình của bệnh tungro như sinh trưởng còi cọc, ít nhánh, lá chuyển sang màu vàng hoặc vàng cam từ chóp lá rồi lan xuống phần dưới lá. Trên lá có thể xuất hiện các vết nâu đen nhỏ, không đều.'
WHERE disease_code = 'TUNGRO';

COMMIT;
