# Dữ liệu chi tiết bệnh lúa từ nguồn web đã kiểm chứng

Ngày rà soát nguồn: 2026-05-08  
Nguyên tắc: ưu tiên nguồn web Việt Nam; được phép dùng Plantix để bổ sung các bệnh chưa có nguồn Việt Nam đủ rõ. Chỉ ghi nguồn đã tìm thấy trên web, có nội dung khớp với bệnh tương ứng. Không tự tạo nguồn.

## Cập nhật v8.1 - ngưỡng thời tiết định lượng

Nguyên tắc seed `disease_weather_condition`: chỉ chuyển thành `min_value`, `max_value`, `operator` khi nguồn ghi con số rõ cho đúng yếu tố thời tiết đó. Các cụm như "nóng ẩm", "mưa nhiều", "ẩm ướt", "se lạnh", "ẩm độ cao" không được tự suy diễn thành số.

| diseaseCode DB | Bệnh | Seed DB? | Ngưỡng rõ dùng cho seed | Ghi chú loại mơ hồ |
|---|---|---:|---|---|
| BLB_RICE | Bạc lá | Có | Nhiệt độ 25-34°C; RH > 70% | Có số rõ; mưa gió chỉ giữ làm ghi chú, không seed rainfall. |
| BLS_RICE | Sọc vi khuẩn | Có một phần | Nhiệt độ 27-35°C | Không seed RH vì nguồn chỉ nói "nóng ẩm", không có % rõ. |
| BS_RICE | Đốm nâu | Có | Nhiệt độ 25-30°C; RH > 80% | Bổ sung từ nguồn ngoài nước có số rõ. |
| HEALTHY | Khỏe mạnh | Không | Không có | Không phải bệnh, không seed cảnh báo thời tiết. |
| BLAST_RICE | Đạo ôn | Có | Nhiệt độ 20-28°C; ẩm độ > 90% | Có số rõ từ nguồn trong/ngoài nước. |
| SCALD_RICE | Cháy lá/cháy bìa lá trong DB | Không | Không có | Nguồn hiện dùng chỉ mô tả ẩm ướt/liên quan cuối vụ. |
| SHEATH_BLIGHT | Khô vằn | Có | Nhiệt độ 28-32°C; ẩm độ tán lá 85-100% | Có số rõ từ VAAS/IRRI. |
| TUNGRO | Tungro | Không | Không có | Bệnh virus phụ thuộc rầy xanh và nguồn cây nhiễm, không có ngưỡng thời tiết số rõ. |

## Nguồn chính đã dùng

- VAAS - Ngân hàng kiến thức trồng lúa: https://vaas.vn/kienthuc/Caylua/06/index.htm
- VAAS - Những bài học về trồng lúa: https://vaas.vn/kienthuc/Caylua/10/index.htm
- Trung tâm Khuyến nông Quốc gia: https://khuyennongvn.gov.vn
- Cục Trồng trọt và Bảo vệ thực vật: https://ppd.gov.vn
- Quy chuẩn kỹ thuật quốc gia QCVN 01-140:2013/BNNPTNT, bản tra cứu công khai: https://vanbanphapluat.co/qcvn-01-140-2013-bnnptnt-dieu-tra-thu-thap-xu-ly-bao-quan-mau-benh-virus-hai-lua
- Plantix Library: https://plantix.net

## Ghi chú nguồn

- Các bệnh có nguồn Việt Nam đủ rõ sẽ dùng VAAS, Khuyến nông Việt Nam, PPD hoặc QCVN.
- Các bệnh chưa có nguồn Việt Nam đủ rõ nhưng có trang Plantix khớp nội dung sẽ ghi rõ nguồn Plantix.
- Không dùng link IRRI chi tiết bị lỗi truy cập trực tiếp.

## Bảng tóm tắt cho DB Disease

| diseaseCode | Tên tiếng Việt | Tên tiếng Anh/tham chiếu | Tác nhân | Mô tả ngắn | Triệu chứng ngắn cho DB | Mức độ | Nguồn |
|---|---|---|---|---|---|---|---|
| RICE_BLAST | Đạo ôn | Rice blast | Nấm Pyricularia oryzae/Magnaporthe oryzae | Bệnh nấm nguy hiểm, gây hại lá, cổ lá, đốt thân, cổ bông, gié và hạt. | Vết hình thoi, tâm xám trắng, viền nâu; nặng gây cháy lá, thối cổ bông, lép trắng. | NANG | VAAS, Khuyến nông VN |
| SHEATH_BLIGHT | Khô vằn | Sheath blight | Nấm Rhizoctonia solani | Bệnh nấm trên bẹ lá, thân và lá, phát triển mạnh khi ruộng rậm, nóng ẩm. | Bẹ lá có vết bầu dục xanh xám, sau bạc nâu, viền nâu tím; vết bệnh loang vằn. | NANG | VAAS |
| BACTERIAL_BLIGHT | Bạc lá/Cháy bìa lá | Bacterial blight | Vi khuẩn Xanthomonas oryzae | Bệnh vi khuẩn gây cháy mép/chóp lá, thường nặng khi mưa gió, ẩm cao, bón thừa đạm. | Vết bệnh từ mép/chóp lá lan vào, trắng xám hoặc vàng xám, rìa gợn sóng, có giọt dịch vi khuẩn. | NANG | Khuyến nông VN, VAAS |
| BACTERIAL_LEAF_STREAK | Đốm sọc vi khuẩn | Bacterial leaf streak | Vi khuẩn Xanthomonas oryzicola | Bệnh vi khuẩn tạo các sọc nhỏ trên lá, dễ phát sinh sau mưa gió làm xây xát lá. | Sọc nhỏ chạy dọc giữa gân lá, xanh tái rồi nâu; có giọt dịch vàng đục, khô như hạt keo. | TRUNG_BINH | PPD, trang xã Tam Nông |
| BROWN_SPOT | Đốm nâu | Brown spot | Nấm Bipolaris oryzae | Bệnh nấm gây hại cây mầm, lá và hạt, nguồn bệnh có thể tồn tại trên hạt giống. | Lá có chấm nâu nhạt rồi thành vết tròn/bầu dục nâu; hạt có vết nâu hoặc đen. | TRUNG_BINH | VAAS |
| NARROW_BROWN_SPOT | Đốm nâu hẹp | Narrow brown leaf spot | Nấm Sphaerulina oryzina | Bệnh nấm tạo vết hẹp chạy song song gân lá, thường rõ từ giai đoạn cuối sinh trưởng. | Vết thẳng hẹp 2-10 mm, rộng 1-1,5 mm, song song trục lá; bẹ có thể có dạng vết lưới. | TRUNG_BINH | Plantix |
| LEAF_SCALD | Cháy lá | Leaf scald | Nấm Microdochium oryzae | Bệnh nấm làm lá có dạng bỏng/cháy, thường bắt đầu ở đỉnh hoặc mép phiến lá. | Vết bệnh xanh xám như ngậm nước ở chóp/mép lá, sau vàng nhạt đến nâu tối, vùng bệnh khô như bị bỏng. | TRUNG_BINH | VAAS |
| FALSE_SMUT | Giả than | False smut | Nấm Ustilaginoidea/Villosiclava virens | Bệnh trên bông làm một số hạt biến thành khối bào tử, giảm trọng lượng và sức nảy mầm. | Một số hạt thành khối bào tử màu cam, sau vàng xanh hoặc xanh đen; hạt gần đó thường lép. | TRUNG_BINH | Plantix |
| SHEATH_ROT | Thối bẹ | Sheath rot | Nấm Sarocladium oryzae | Bệnh gây hại bẹ lá đòng, làm bông trổ không thoát, hạt lép và biến màu. | Bẹ lá đòng có vết bầu dục dài, tâm xám viền nâu; nặng làm bẹ thối nâu đen, có nấm trắng. | TRUNG_BINH | VAAS |
| STEM_ROT | Thối thân | Stem rot | Nấm Sclerotium oryzae/Magnaporthe salvinii | Bệnh nấm gây vết đen ở bẹ gần mực nước, làm thối lóng thân, đổ ngã và hạt lép. | Vết đen nhỏ gần mực nước trên bẹ ngoài; trong thân có sợi nấm, hạch nấm đen, cây dễ đổ ngã. | NANG | Plantix |
| BAKANAE | Lúa von | Bakanae/Foolish seedling | Nấm Fusarium moniliforme/Fusarium fujikuroi | Bệnh truyền qua hạt giống và tàn dư cây bệnh, làm cây mạ cao bất thường hoặc biến dạng sinh trưởng. | Cây mạ cao gấp đôi bình thường, xanh vàng nhạt, cứng giòn; có thể lùn hoặc không đổi chiều cao. | TRUNG_BINH | VAAS |
| GRAIN_DISCOLORATION | Lem lép hạt | Grain discoloration complex | Nhiều tác nhân: nấm, vi khuẩn, nhện gié, thời tiết | Hội chứng hạt lúa bị biến màu, lép/lửng, giảm năng suất và chất lượng gạo. | Vỏ trấu sậm màu từ nâu đến đen, đốm hoặc đen toàn bộ; hạt lép, lửng, chất lượng giảm. | TRUNG_BINH | VAAS, Khuyến nông VN |
| GRASSY_STUNT | Vàng lùn/lúa cỏ | Rice grassy stunt | Virus RGSV, môi giới rầy nâu | Bệnh virus làm lúa lùn, vàng, dạng bụi cỏ; không có thuốc đặc trị, quản lý qua rầy nâu và vệ sinh đồng ruộng. | Lá xanh nhạt sang vàng/cam, cây lùn, chồi giảm hoặc mọc nhiều dạng bụi cỏ, lá ngắn hẹp. | NANG | VAAS, Khuyến nông VN, PPD |
| RAGGED_STUNT | Lùn xoắn lá | Rice ragged stunt | Virus RRSV, môi giới rầy nâu | Bệnh virus làm cây lúa lùn, lá xanh đậm, xoắn/rách mép, bông trổ kém. | Cây lùn, lá xanh đậm, rìa lá rách hoặc gợn sóng, gân/bẹ có bướu, bông không trổ thoát, hạt lép. | NANG | VAAS, Khuyến nông VN, PPD |
| TUNGRO | Tungro | Rice tungro | Virus RTBV/RTSV, môi giới rầy xanh | Bệnh virus làm cây lùn, vàng/cam, giảm số nhánh, bông ngắn và nhiều hạt lép. | Cây lùn, lá vàng hoặc vàng da cam, có thể có vết gỉ sắt, số nhánh giảm, bông ngắn, hạt lép. | NANG | QCVN 01-140:2013/BNNPTNT |

## Chi tiết từng bệnh

### 1. Đạo ôn

- Tác nhân: nấm Pyricularia oryzae, cũng thường được ghi nhận theo tên Magnaporthe oryzae.
- Bộ phận hại: lá, đốt thân, cổ bông, gié, hạt.
- Triệu chứng: vết bệnh tiêu biểu trên lá có hình thoi, hai đầu nhọn, tâm xám trắng; trên giống nhiễm, vết bệnh lớn có thể liên kết thành mảng cháy khô. Trên cổ bông/cổ gié, bệnh làm bông hoặc từng gié lép trắng.
- Điều kiện thuận lợi: nhiệt độ 20-28 độ C, thuận lợi nhất khoảng 24-28 độ C; ẩm độ không khí khoảng/trên 90%, có mưa phùn, sương mù hoặc trời âm u; giống nhiễm; bón nhiều đạm; ruộng thiếu cân đối dinh dưỡng.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/069_benhdaoon.htm
  - Khuyến nông Việt Nam: https://khuyennongvn.gov.vn/khoa-hoc-cong-nghe/khcn-trong-nuoc/phong-tru-benh-dao-on-hai-lua-21414.html
  - UBND huyện Đăk Glei, Kon Tum: https://huyendakglei.kontum.gov.vn/thong-tin-tuyen-truyen/Benh-dao-on-hai-lua-va-bien-phap-phong-tru-5967

### 2. Khô vằn

- Tác nhân: nấm Rhizoctonia solani.
- Bộ phận hại: bẹ lá, thân, lá; bệnh có thể leo lên lá đòng khi nặng.
- Triệu chứng: bẹ lá đổi màu, có vệt to hình bầu dục; ban đầu xanh sẫm, sau bạc nâu, viền nâu tím. Vết bệnh lớn dần, kéo dài và hòa lẫn thành hình vằn trên bẹ lá.
- Điều kiện thuận lợi: nhiệt độ cao khoảng 28-32 độ C, ẩm độ tán lá 85-100%; ruộng cấy dày, rậm rạp, bón nhiều đạm hoặc bón đạm lai rai về cuối vụ; mùa mưa làm nguy cơ lây lan cao hơn.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/070_khovan.htm
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/19_benhkhovan.htm
  - Plantix: https://www.plantix.net/en/library/plant-diseases/100080/rice-sheath-blight/

### 3. Bạc lá/Cháy bìa lá

- Tác nhân: vi khuẩn Xanthomonas oryzae.
- Bộ phận hại: phiến lá, đặc biệt lá đòng và bộ lá giai đoạn đòng đến chín sữa.
- Triệu chứng: bệnh thường bắt đầu ở mép/chóp lá rồi lan dần vào giữa lá; vết bệnh xanh đậm lúc mới xuất hiện, sau héo, chết tế bào thành vệt trắng xám; rìa vết bệnh gợn sóng. Khi ẩm hoặc sáng sớm có giọt dịch trắng đục/vàng nâu chứa vi khuẩn.
- Điều kiện thuận lợi: nhiệt độ thường thuận lợi khoảng 25-30 độ C theo nguồn Khuyến nông Yên Bái, hoặc 25-34 độ C và ẩm độ trên 70% theo Plantix; mưa gió làm lá xây xát; ruộng bón đạm không cân đối; giống lá to bản, lá mềm.
- Nguồn:
  - Khuyến nông Việt Nam: https://khuyennongvn.gov.vn/khoa-hoc-cong-nghe/khcn-trong-nuoc/phong-tru-benh-bac-la-hai-lua-19117.html
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/078_chaybiala.htm
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/14_benhbachla.htm
  - Cổng công dân số Yên Bái: https://congdanso.yenbai.gov.vn/vi/chi-tiet-tin?id=1302
  - Plantix: https://www.plantix.net/en/library/plant-diseases/300014/bacterial-blight-of-rice/

### 4. Đốm sọc vi khuẩn

- Tác nhân: vi khuẩn Xanthomonas oryzicola.
- Bộ phận hại: lá.
- Triệu chứng: vết bệnh là các sọc nhỏ chạy dọc giữa gân lá, ban đầu xanh tái hoặc trong mờ, sau chuyển nâu. Trên vết bệnh có thể xuất hiện giọt dịch vàng đục; khi khô thành hạt keo như trứng cá.
- Điều kiện thuận lợi: nóng ẩm, nắng mưa xen kẽ, mưa to kèm gió; nguồn PPD ghi nhận bệnh phát sinh mạnh trong đợt thời tiết nóng ẩm 27-35 độ C tại Vĩnh Phúc; ruộng sâu trũng, thừa đạm, thiếu kali, gieo cấy dày. Đây là khoảng nhiệt độ ghi nhận thực tế trong ổ dịch, không phải ngưỡng tối ưu sinh học tuyệt đối.
- Nguồn:
  - Cục Trồng trọt và BVTV: https://www.ppd.gov.vn/tin-sxtt-amp%3B-bvtv-dia-phuong/vi%CC%83nh-phu%CC%81cx3a%3B-quan-ly-benh-dom-soc-vi-khuan.html
  - Trang thông tin điện tử xã Tam Nông, Phú Thọ: https://tamnong.phutho.gov.vn/tin-tuc-su-kien/thong-bao/thong-bao-tuyen-truyen-benh-dom-soc-vi-khuan-tren-lua-bien-phap-phong-tru/

### 5. Đốm nâu

- Tác nhân: nấm Bipolaris oryzae.
- Bộ phận hại: cây mầm, lá, rễ mầm, hạt.
- Triệu chứng: cây mầm có vết nâu tròn/bầu dục trên lá mầm, rễ mầm biến màu và thối đen. Trên lá, vết bệnh ban đầu là chấm nhỏ nâu nhạt, sau thành vết tròn/bầu dục màu nâu. Trên hạt, bệnh làm hạt có vết nâu hoặc biến màu đen.
- Điều kiện thuận lợi: VAAS nêu bệnh phát triển mạnh trên đất nghèo dinh dưỡng, đất phèn/cát/độc hữu cơ, ruộng quá úng hoặc khô hạn; bệnh thích hợp trong điều kiện nhiệt độ cao, ẩm độ thấp. Cập nhật v8.1 từ nguồn eAgri/TNAU: nhiệt độ 25-30 độ C và ẩm độ tương đối trên 80% là điều kiện thuận lợi cao; đây là ngưỡng số có thể seed cho cảnh báo thời tiết.
- Nguồn bệnh: nấm tồn tại trên hạt, là nguồn bệnh cho vụ sau.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/23_benhdomnau.htm
  - eAgri/TNAU: https://www.eagri.org/eagri50/PATH272/lecture01/002.html

### 6. Cháy lá

- Tác nhân: nấm Microdochium oryzae.
- Bộ phận hại: lá.
- Triệu chứng: triệu chứng ban đầu phát triển trên đỉnh hoặc gờ phiến lá; vết bệnh xanh xám, giống ngậm nước. Vết bệnh biến đổi giữa vàng nhạt và nâu tối, vùng nhiễm khô đi giống bị bỏng/cháy.
- Điều kiện thuận lợi: nguồn VAAS hiện dùng không nêu khoảng nhiệt độ cụ thể; bệnh thường liên quan lá già/cuối vụ, nguồn bệnh từ hạt và gốc rạ, điều kiện ẩm ướt làm bệnh dễ phát triển.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/25_benhchayla.htm

### 7. Đốm nâu hẹp

- Tác nhân: nấm Sphaerulina oryzina.
- Bộ phận hại: lá, bẹ lá, bông/hạt.
- Triệu chứng: vết bệnh dạng đường thẳng hẹp, dài khoảng 2-10 mm, thường không rộng quá 1-1,5 mm, chạy song song với trục lá. Trên bẹ lá có thể tạo dạng vết lưới; giai đoạn muộn có thể làm hạt chín sớm hoặc đổi màu.
- Điều kiện thuận lợi: đất thiếu kali, nhiệt độ khoảng 25-28 độ C; bệnh xuất hiện từ giai đoạn trổ bông và nặng hơn khi cây gần chín.
- Nguồn:
  - Plantix: https://www.plantix.net/en/library/plant-diseases/100183/narrow-brown-leaf-spot-of-rice/

### 8. Giả than

- Tác nhân: nấm Ustilaginoidea virens, Plantix ghi tên Villosiclava virens.
- Bộ phận hại: hạt trên bông.
- Triệu chứng: triệu chứng thấy rõ khi bông hình thành và hạt gần chín; một số hạt riêng lẻ biến thành khối bào tử màu cam, mềm như nhung, sau chuyển vàng xanh hoặc xanh đen. Thường chỉ vài hạt trên bông bị thành khối bào tử, nhưng bệnh làm giảm trọng lượng hạt và sức nảy mầm.
- Điều kiện thuận lợi: ẩm độ cao trên 90%, mưa nhiều, nhiệt độ khoảng 25-35 độ C, đất hoặc ruộng bón nhiều đạm.
- Nguồn:
  - Plantix: https://www.plantix.net/en/library/plant-diseases/100162/false-smut/

### 9. Thối bẹ

- Tác nhân: nấm Sarocladium oryzae.
- Bộ phận hại: bẹ lá đòng, bông và hạt.
- Triệu chứng: bệnh xuất hiện trên bẹ lá đòng vào thời kỳ sắp trỗ; vết bệnh ban đầu bầu dục dài hoặc bất định, dài 0,5-1,5 cm, giữa màu xám, viền nâu hoặc toàn vết nâu sẫm. Bệnh nặng làm bông trỗ không thoát, bẹ lá đòng thối nâu đen, có lớp nấm trắng; hạt lép lửng và biến màu.
- Điều kiện thuận lợi: thời tiết nóng ẩm; theo Plantix, thời tiết nóng 20-28 độ C và ẩm ướt thuận lợi cho bệnh; bệnh nặng khi ẩm độ/nhiệt độ cao, ruộng dày, có vết thương do côn trùng ở giai đoạn làm đòng đến trỗ.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/076_thoibe.htm
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/22_benhthoibe.htm
  - Plantix: https://plantix.net/vi/library/plant-diseases/100163/sheath-rot-of-rice/

### 10. Thối thân

- Tác nhân: nấm Sclerotium oryzae/Magnaporthe salvinii.
- Bộ phận hại: bẹ lá gần mực nước, lóng thân.
- Triệu chứng: triệu chứng ban đầu là vết đen nhỏ, bất định trên bẹ ngoài gần mực nước. Khi bệnh tiến triển, vết lan vào bẹ trong và thân, làm mô thân thối; trong thân có sợi nấm xám và hạch nấm đen. Cây bệnh dễ đổ ngã, bông nhỏ, hạt phấn/lép.
- Điều kiện thuận lợi: Plantix nêu bệnh tăng khi ẩm độ cao, bón nhiều đạm, cây có vết thương và bệnh tăng khi cây gần chín; nguồn hiện dùng không nêu khoảng nhiệt độ cụ thể cho thối thân.
- Nguồn:
  - Plantix: https://www.plantix.net/en/library/plant-diseases/100179/stem-rot-of-rice/

### 11. Lúa von

- Tác nhân: nấm Fusarium moniliforme, thường được đồng nghĩa/ghi nhận hiện đại với nhóm Fusarium fujikuroi.
- Nguồn bệnh: tồn tại trong đất, tàn dư cây bệnh và phôi hạt giống; chủ yếu lây qua hạt giống.
- Triệu chứng: cây mạ bệnh có thể cao gấp hai lần mạ bình thường, toàn cây xanh vàng nhạt, cứng giòn. Một số trường hợp cây bị lùn hoặc không thay đổi rõ chiều cao.
- Điều kiện thuận lợi: nấm có thể phát triển ở 10-37 độ C, thích hợp nhất 24-32 độ C; ẩm độ cao và ánh sáng yếu làm bệnh thuận lợi.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/075_luavon.htm

### 12. Lem lép hạt

- Tác nhân: là hội chứng do nhiều nguyên nhân, gồm nhện gié, vi khuẩn Pseudomonas/Burkholderia glumae, nhiều nấm như Bipolaris, Fusarium, Curvularia, Microdochium, Pyricularia, Sarocladium, Ustilaginoidea...
- Bộ phận hại: hạt trên bông.
- Triệu chứng: vỏ trấu sậm màu từ nâu đến đen, có thể đốm hoặc đen toàn bộ; xảy ra cả trên hạt có gạo và hạt lép. Hạt bị bệnh thường lép/lửng, giảm năng suất và chất lượng.
- Điều kiện thuận lợi: giai đoạn trỗ bông đến chín sữa gặp nhiệt độ thấp, ẩm độ cao, mưa nhiều; giống/hạt giống mang nguồn bệnh; ruộng có cỏ dại hoặc đất phèn/mặn. Nguồn VAAS hiện dùng không nêu khoảng nhiệt độ số cụ thể.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/079_lemlephat.htm
  - Khuyến nông Việt Nam: https://khuyennongvn.gov.vn/khoa-hoc-cong-nghe/khcn-trong-nuoc/mot-so-bien-phap-ky-thuat-de-san-xuat-lua-mua-hieu-qua-15803.html

### 13. Vàng lùn/lúa cỏ

- Tác nhân: Rice grassy stunt virus, môi giới truyền bệnh là rầy nâu.
- Triệu chứng vàng lùn: lá từ xanh nhạt chuyển sang vàng nhạt, vàng da cam rồi vàng khô; vết vàng thường từ chóp lá lan xuống bẹ; lá có xu hướng xòe ngang; cây giảm chiều cao và giảm số chồi.
- Triệu chứng lúa cỏ: bụi lúa lùn, nhiều chồi mọc thẳng giống bụi cỏ; lá ngắn, hẹp, xanh vàng hoặc vàng cam; lá non có nhiều đốm gỉ sắt hoặc vàng đỏ.
- Điều kiện thuận lợi: nguồn hiện dùng nhấn mạnh yếu tố rầy nâu môi giới, lúa chét/tàn dư bệnh và canh tác lúa liên tục; không nêu ngưỡng nhiệt độ cụ thể cho virus.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/073_vanglun.htm
  - Khuyến nông Việt Nam: https://khuyennongvn.gov.vn/thien-tai-dich-hai/soc-trang-can-trong-lua-bi-benh-vang-lun-lun-xoan-la-vu-thu--dong-17268.html
  - Cục Trồng trọt và BVTV: https://ppd.gov.vn/tien-bo-ky-thuat/tien-bo-ky-thuatx3a%3B-quot%3Bquy-trinh-phong-chong-benh-virut-vang-lun-lun-xoan-la-do-ray-nau-la-moi-gioi-truyen-benh-tai-cac-tinh-phia-nam.html

### 14. Lùn xoắn lá

- Tác nhân: Rice ragged stunt virus, môi giới truyền bệnh là rầy nâu.
- Triệu chứng: cây lúa cằn cọc, thấp lùn; chiều cao cây, chiều dài lá, rễ và cổ áo giảm 40-60% so với cây khỏe. Số dảnh/khóm có thể nhiều nhưng hầu hết không có bông hoặc trỗ muộn, trỗ không thoát. Theo nguồn Khuyến nông Sóc Trăng, lá xanh đậm, rìa lá rách và gợn sóng, dọc gân lá có bướu; lúa không trổ được hoặc hạt lép.
- Điều kiện thuận lợi: nguồn hiện dùng nhấn mạnh rầy nâu môi giới, lúa nhiễm và nguồn bệnh trên đồng ruộng; không nêu ngưỡng nhiệt độ cụ thể cho virus.
- Nguồn:
  - VAAS: https://vaas.vn/kienthuc/Caylua/06/17_benhlunxoanla.htm
  - VAAS: https://vaas.vn/kienthuc/Caylua/10/073_vanglun.htm
  - Khuyến nông Việt Nam: https://khuyennongvn.gov.vn/thien-tai-dich-hai/soc-trang-can-trong-lua-bi-benh-vang-lun-lun-xoan-la-vu-thu--dong-17268.html
  - Cục Trồng trọt và BVTV: https://www.ppd.gov.vn/san-xuat-nong-nghiep-ben-vung/dien-dan-khuyen-nong---nong-nghiep-bien-phap-phong-chong-ray-nau-va-benh-vang-lun-%E2%80%93-lun-xoan-la-40%3Bvl-%E2%80%93-lxl41%3B-tren-lua-tai-cac-tinh-nam-bo.html

### 15. Tungro

- Tác nhân: Rice tungro bacilliform virus và Rice tungro spherical virus.
- Triệu chứng theo QCVN 01-140:2013/BNNPTNT: cây lùn; lá biến vàng hoặc vàng da cam, trên lá có thể có vết màu gỉ sắt; số nhánh giảm; bông ngắn; hạt lép hoàn toàn hoặc lép lửng.
- Triệu chứng theo Plantix bản tiếng Việt: lúa phát triển còi cọc, đẻ ít nhánh, lá vàng hoặc vàng cam từ chóp lá lan xuống phần dưới lá; lá mất màu có thể có vết nâu đen nhỏ.
- Điều kiện thuận lợi: nguồn hiện dùng xác nhận bệnh virus và triệu chứng; yếu tố chính là rầy xanh môi giới và nguồn cây nhiễm, không nêu ngưỡng nhiệt độ cụ thể.
- Ghi chú nguồn: đây là nguồn quy chuẩn kỹ thuật quốc gia, dùng để xác nhận triệu chứng điển hình của bệnh virus hại lúa đã được công bố ở Việt Nam.
- Nguồn:
  - QCVN 01-140:2013/BNNPTNT: https://vanbanphapluat.co/qcvn-01-140-2013-bnnptnt-dieu-tra-thu-thap-xu-ly-bao-quan-mau-benh-virus-hai-lua
  - Plantix tiếng Việt: https://plantix.net/vi/library/plant-diseases/200033/tungro/

## SQL seed tham khảo

Cần thay `:riceCropTypeId` bằng id crop type "Lúa" trong database. Chỉ seed các bệnh đã có nguồn Việt Nam ở trên.

```sql
insert into disease (croptype_id, disease_name, diseasename_en, disease_code, description, symptoms, severity_level, is_delete, created_at)
values
(:riceCropTypeId, 'Đạo ôn', 'Rice blast', 'RICE_BLAST', 'Bệnh nấm nguy hiểm, gây hại lá, cổ lá, đốt thân, cổ bông, gié và hạt.', 'Vết hình thoi, tâm xám trắng, viền nâu; nặng gây cháy lá, thối cổ bông, lép trắng.', 'NANG', false, now()),
(:riceCropTypeId, 'Khô vằn', 'Sheath blight', 'SHEATH_BLIGHT', 'Bệnh nấm trên bẹ lá, thân và lá, phát triển mạnh khi ruộng rậm, nóng ẩm.', 'Bẹ lá có vết bầu dục xanh xám, sau bạc nâu, viền nâu tím; vết bệnh loang vằn.', 'NANG', false, now()),
(:riceCropTypeId, 'Bạc lá/Cháy bìa lá', 'Bacterial blight', 'BACTERIAL_BLIGHT', 'Bệnh vi khuẩn gây cháy mép/chóp lá, thường nặng khi mưa gió, ẩm cao, bón thừa đạm.', 'Vết bệnh từ mép/chóp lá lan vào, trắng xám hoặc vàng xám, rìa gợn sóng, có giọt dịch vi khuẩn.', 'NANG', false, now()),
(:riceCropTypeId, 'Đốm sọc vi khuẩn', 'Bacterial leaf streak', 'BACTERIAL_LEAF_STREAK', 'Bệnh vi khuẩn tạo các sọc nhỏ trên lá, dễ phát sinh sau mưa gió làm xây xát lá.', 'Sọc nhỏ chạy dọc giữa gân lá, xanh tái rồi nâu; có giọt dịch vàng đục, khô như hạt keo.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Đốm nâu', 'Brown spot', 'BROWN_SPOT', 'Bệnh nấm gây hại cây mầm, lá và hạt, nguồn bệnh có thể tồn tại trên hạt giống.', 'Lá có chấm nâu nhạt rồi thành vết tròn/bầu dục nâu; hạt có vết nâu hoặc đen.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Đốm nâu hẹp', 'Narrow brown leaf spot', 'NARROW_BROWN_SPOT', 'Bệnh nấm tạo vết hẹp chạy song song gân lá, thường rõ từ giai đoạn cuối sinh trưởng.', 'Vết thẳng hẹp 2-10 mm, rộng 1-1,5 mm, song song trục lá; bẹ có thể có dạng vết lưới.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Cháy lá', 'Leaf scald', 'LEAF_SCALD', 'Bệnh nấm làm lá có dạng bỏng/cháy, thường bắt đầu ở đỉnh hoặc mép phiến lá.', 'Vết xanh xám như ngậm nước ở chóp/mép lá, sau vàng nhạt đến nâu tối, vùng bệnh khô như bị bỏng.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Giả than', 'False smut', 'FALSE_SMUT', 'Bệnh trên bông làm một số hạt biến thành khối bào tử, giảm trọng lượng và sức nảy mầm.', 'Một số hạt thành khối bào tử màu cam, sau vàng xanh hoặc xanh đen; hạt gần đó thường lép.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Thối bẹ', 'Sheath rot', 'SHEATH_ROT', 'Bệnh gây hại bẹ lá đòng, làm bông trổ không thoát, hạt lép và biến màu.', 'Bẹ lá đòng có vết bầu dục dài, tâm xám viền nâu; nặng làm bẹ thối nâu đen, có nấm trắng.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Thối thân', 'Stem rot', 'STEM_ROT', 'Bệnh nấm gây vết đen ở bẹ gần mực nước, làm thối lóng thân, đổ ngã và hạt lép.', 'Vết đen nhỏ gần mực nước trên bẹ ngoài; trong thân có sợi nấm, hạch nấm đen, cây dễ đổ ngã.', 'NANG', false, now()),
(:riceCropTypeId, 'Lúa von', 'Bakanae', 'BAKANAE', 'Bệnh truyền qua hạt giống và tàn dư cây bệnh, làm cây mạ cao bất thường hoặc biến dạng sinh trưởng.', 'Cây mạ cao gấp đôi bình thường, xanh vàng nhạt, cứng giòn; có thể lùn hoặc không đổi chiều cao.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Lem lép hạt', 'Grain discoloration complex', 'GRAIN_DISCOLORATION', 'Hội chứng hạt lúa bị biến màu, lép/lửng, giảm năng suất và chất lượng gạo.', 'Vỏ trấu sậm màu từ nâu đến đen, đốm hoặc đen toàn bộ; hạt lép, lửng, chất lượng giảm.', 'TRUNG_BINH', false, now()),
(:riceCropTypeId, 'Vàng lùn/lúa cỏ', 'Rice grassy stunt', 'GRASSY_STUNT', 'Bệnh virus làm lúa lùn, vàng, dạng bụi cỏ; quản lý qua rầy nâu và vệ sinh đồng ruộng.', 'Lá xanh nhạt sang vàng/cam, cây lùn, chồi giảm hoặc mọc nhiều dạng bụi cỏ, lá ngắn hẹp.', 'NANG', false, now()),
(:riceCropTypeId, 'Lùn xoắn lá', 'Rice ragged stunt', 'RAGGED_STUNT', 'Bệnh virus làm cây lúa lùn, lá xanh đậm, xoắn/rách mép, bông trổ kém.', 'Cây lùn, lá xanh đậm, rìa lá rách hoặc gợn sóng, gân/bẹ có bướu, bông không trổ thoát, hạt lép.', 'NANG', false, now()),
(:riceCropTypeId, 'Tungro', 'Rice tungro', 'TUNGRO', 'Bệnh virus làm cây lùn, vàng/cam, giảm số nhánh, bông ngắn và nhiều hạt lép.', 'Cây lùn, lá vàng hoặc vàng da cam, có thể có vết gỉ sắt, số nhánh giảm, bông ngắn, hạt lép.', 'NANG', false, now());
```
