Chức năng chẩn đoán bệnh.
toi có các bảng sau:

1. `diagnose_history`
   - `diagnosehistoryId`
   - `userId`
   - `croptypeId`
   - `areainfoId`
   - `originalimageURL`
   - `weatherData`
   - `status`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu thông tin tổng quát của mỗi lần chẩn đoán bệnh.
   - Lưu người thực hiện chẩn đoán qua `userId`.
   - Lưu loại cây trồng được chẩn đoán qua `croptypeId`.
   - Nếu có khu vực canh tác thì lưu qua `areainfoId`.
   - Lưu URL ảnh gốc sau khi upload Cloudinary vào `originalimageURL`.
   - Lưu dữ liệu thời tiết dạng JSON vào `weatherData`.
   - Lưu trạng thái xử lý vào `status` như `pending`, `completed`, `failed`.

2. `diagnose_history_detail`
   - `detailId`
   - `diagnosehistoryId`
   - `diseaseId`
   - `confidenceScore`
   - `severityLevel`
   - `riskWarning`
   - `treatmentData`
   - `cultivationData`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu chi tiết từng kết quả bệnh trong một lần chẩn đoán.
   - Mỗi bản ghi gắn với một lần chẩn đoán qua `diagnosehistoryId`.
   - Lưu bệnh được phát hiện qua `diseaseId`.
   - Lưu độ tin cậy của AI vào `confidenceScore`.
   - Lưu mức độ bệnh vào `severityLevel`.
   - Lưu cảnh báo rủi ro vào `riskWarning`.
   - Lưu phác đồ điều trị tổng hợp sau khi áp dụng rule engine vào `treatmentData` dưới dạng JSON.
   - Lưu hướng dẫn canh tác hoặc hướng dẫn diễn giải từ AI/LLM vào `cultivationData`.

3. `disease`
   - `diseaseId`
   - `croptypeId`
   - `diseaseName`
   - `diseasenameEn`
   - `diseaseCode`
   - `description`
   - `symptoms`
   - `severityLevel`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu danh mục bệnh theo từng loại cây trồng.
   - Kết quả từ Vision AI sẽ được mapping sang bảng này qua `diseaseCode`, `diseasenameEn` hoặc `diseaseName`.
   - `croptypeId` dùng để đảm bảo bệnh đúng với loại cây đang chẩn đoán.
   - `severityLevel` là mức độ mặc định của bệnh trong hệ thống.

4. `treatment_plan`
   - `treatmentId`
   - `diseaseId`
   - `treatmentName`
   - `ingredientId`
   - `drugName`
   - `dosage`
   - `applicationMethod`
   - `applicationTime`
   - `frequency`
   - `safetyNotes`
   - `isRequired`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu phác đồ điều trị gốc theo từng bệnh.
   - Mỗi phác đồ liên kết với một bệnh qua `diseaseId`.
   - `ingredientId` xác định hoạt chất chính của phác đồ.
   - `drugName`, `dosage`, `applicationMethod`, `applicationTime`, `frequency`, `safetyNotes` là thông tin điều trị gốc.
   - Dữ liệu trong bảng này chỉ là dữ liệu nguồn tham chiếu.
   - Phác đồ sau khi xử lý đa bệnh và áp dụng rule engine sẽ không lưu ngược lại vào bảng này mà lưu vào `diagnose_history_detail.treatmentData`.

5. `treatment_weather_condition`
   - `conditionId`
   - `treatmentId`
   - `weatherFactor`
   - `operator`
   - `minValue`
   - `maxValue`
   - `recommendationNote`
   - `unit`
   - `isRequired`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu điều kiện thời tiết áp dụng cho từng phác đồ điều trị.
   - Liên kết với `treatment_plan` qua `treatmentId`.
   - `weatherFactor` là yếu tố thời tiết cần kiểm tra như nhiệt độ, độ ẩm, lượng mưa.
   - `operator`, `minValue`, `maxValue` dùng để so sánh với dữ liệu thời tiết thực tế.
   - `recommendationNote` là nội dung cảnh báo hoặc khuyến nghị.
   - `isRequired` xác định điều kiện bắt buộc hay chỉ khuyến nghị.

6. `ingredient`
   - `ingredientId`
   - `ingredientName`
   - `description`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu danh mục hoạt chất.
   - Bảng `treatment_plan` tham chiếu tới bảng này qua `ingredientId`.
   - Được dùng để kiểm tra tương tác hoạt chất khi có nhiều bệnh.

7. `drug_interaction`
   - `interactionId`
   - `ingredientA_Id`
   - `ingredientB_Id`
   - `interactionType`
   - `severity`
   - `warningMessage`
   - `actionRule`
   - `createdAt`
   - `updatedAt`
   - `deletedAt`
   - `createdBy`
   - `updatedBy`
   - `deletedBy`
   - `isDelete`

   Dùng để lưu quy tắc tương tác giữa các hoạt chất.
   - `ingredientA_Id` và `ingredientB_Id` là hai hoạt chất cần kiểm tra tương tác.
   - `interactionType` cho biết loại tương tác như xung đột hoặc hỗ trợ.
   - `severity` cho biết mức độ nghiêm trọng của tương tác.
   - `warningMessage` là nội dung cảnh báo cần hiển thị.
   - `actionRule` là quy tắc xử lý, ví dụ: cho phép pha chung, không được pha chung, cần tách lịch phun.

# các controller và action cần có cho chức năng chẩn đoán bệnh

    1. Post /api/diagnosis

# Các controller và action cần có cho chức năng lịch sử chẩn đoán bệnh

    1. Get /api/diagnosis/history
    2. Get /api/diagnosis/{id}

# Giờ bạn hãy làm cho tôi chức năng chẩn đoán bệnh

1. Người dùng truy cập chức năng chẩn đoán bệnh, hệ thống yêu cầu quyền truy cập vị trí (GPS).

2. Nếu người dùng đồng ý, hệ thống lấy tọa độ latitude và longitude để phục vụ việc gọi Weather API. Nếu người dùng từ chối, hệ thống vẫn cho phép tiếp tục chẩn đoán nhưng không có dữ liệu thời tiết và cảnh báo thời tiết.

3. Người dùng chọn loại cây trồng cần chẩn đoán. Dữ liệu này ánh xạ tới Croptype.croptypeId. Hệ thống chỉ hiển thị các loại cây có isActive = true.

4. Người dùng tải ảnh lên từ thư viện hoặc chụp ảnh trực tiếp.

5. Người dùng nhấn nút "Chẩn đoán".

6. Hệ thống kiểm tra dữ liệu đầu vào:

- Ảnh có tồn tại hay không.
- Định dạng ảnh có hợp lệ hay không.
- croptypeId có tồn tại trong bảng Croptype hay không.
- Bản ghi Croptype có isActive = true hay không.
- Mô hình AI tương ứng có tồn tại trong bảng AImodel hay không.
- Bản ghi AImodel có isActive = true hay không.

7. Hệ thống tải ảnh lên Cloudinary và nhận về URL ảnh. Sau đó, hệ thống tạo bản ghi trong bảng Attachment với các thông tin cần thiết như referenceType, referenceId, fileUrl, fileName, mimeType, category = 'diagnosis'.

8. Hệ thống gọi song song:

- Vision AI để nhận diện bệnh từ ảnh, sử dụng mô hình tương ứng từ AImodel.modelFilePath theo croptypeId.
- Weather API để lấy dữ liệu thời tiết hiện tại nếu có GPS.

9. Hệ thống nhận kết quả từ Vision AI:

- Nếu Vision AI trả về nhãn cây khỏe, hệ thống vẫn tạo bản ghi trong DiagnoseHistory và DiagnoseHistoryDetail, sau đó kết thúc luồng.
- Nếu không phát hiện bệnh nào hoặc tất cả kết quả đều có độ tin cậy dưới ngưỡng tối thiểu, hệ thống vẫn tạo bản ghi trong DiagnoseHistory và DiagnoseHistoryDetail, sau đó kết thúc luồng.
- Nếu phát hiện bệnh, hệ thống tiếp tục xử lý với danh sách bệnh gồm tên bệnh, độ tin cậy và mức độ nghiêm trọng.

10. Với mỗi kết quả trả về từ Vision AI, hệ thống thực hiện mapping sang Disease.diseaseId thông qua diseaseCode, diseasenameEn hoặc diseaseName.

11. Hệ thống truy vấn cơ sở dữ liệu để lấy thông tin chi tiết:

- Nếu có 1 bệnh, hệ thống truy vấn các bảng Disease, Treatmentplan và TreatmentWeatherCondition.
- Nếu có nhiều bệnh, hệ thống truy vấn các bảng Disease, Treatmentplan, Ingredient, Druginteraction và TreatmentWeatherCondition.

12. Hệ thống áp dụng Rule Engine:

- Với mỗi bệnh, hệ thống lấy ingredientId từ bảng Treatmentplan.
- Nếu có nhiều bệnh, hệ thống kiểm tra tương tác theo từng cặp hoạt chất bằng cách đối chiếu ingredientId với bảng Druginteraction qua hai cột ingredientA_Id và ingredientB_Id.
- Dựa trên interactionType, severity và actionRule, hệ thống quyết định phác đồ phù hợp: gộp và phun chung hoặc tách lịch phun riêng.

13. Hệ thống áp dụng điều kiện thời tiết:

- So sánh dữ liệu thời tiết thực tế với bảng TreatmentWeatherCondition thông qua các cột weatherFactor, operator, minValue, maxValue.
- Dựa trên isRequired, hệ thống phân biệt điều kiện bắt buộc và điều kiện khuyến nghị.
- Từ đó sinh cảnh báo phù hợp.

14. Hệ thống tổng hợp dữ liệu chẩn đoán gồm:

- Danh sách bệnh
- Phác đồ điều trị
- Cảnh báo
- Thông tin thời tiết

15. Hệ thống lưu dữ liệu vào bảng DiagnoseHistory với các cột:

- userId
- croptypeId
- areainfoId nếu có
- originalimageURL
- weatherData
- status

16. Hệ thống đồng thời lưu dữ liệu vào bảng DiagnoseHistoryDetail:

- Nếu là trường hợp cây khỏe hoặc không xác định được bệnh, hệ thống vẫn tạo ít nhất 1 bản ghi detail để lưu kết quả trả về tương ứng.
- Nếu phát hiện nhiều bệnh, mỗi bệnh được lưu thành 1 dòng riêng.
- Mỗi bản ghi detail lưu vào các cột: diagnosehistoryId, diseaseId, confidenceScore, severityLevel, riskWarning, treatmentData, cultivationData.

17. Phác đồ điều trị tổng hợp sau khi áp dụng Rule Engine sẽ được lưu vào DiagnoseHistoryDetail.treatmentData dưới dạng JSON. Dữ liệu này là kết quả xử lý tại thời điểm chẩn đoán, không ghi ngược vào bảng Treatmentplan.

18. Nếu sử dụng LLM, nội dung hướng dẫn dễ hiểu có thể được lưu vào DiagnoseHistoryDetail.cultivationData hoặc trả thẳng về frontend.

19. Sau khi chẩn đoán hoàn tất, hệ thống có thể tạo thêm bản ghi trong bảng Notification với các thông tin như userId, title, content, notificationType, isRead = false.

20. Cuối cùng, hệ thống trả kết quả chẩn đoán về cho người dùng để hiển thị trên giao diện.
    Chức năng chẩn đoán bệnh.  
    Tôi có các bảng sau:
