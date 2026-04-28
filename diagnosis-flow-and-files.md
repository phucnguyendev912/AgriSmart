# Luong va cac file cua chuc nang chan doan benh

Tai lieu nay tong hop luong nghiep vu va cac file lien quan cua chuc nang chan doan benh dua tren codebase hien tai.

## 1. Mo trang chan doan

Nguoi dung vao route `/diagnosis`, frontend mount trang chan doan va khoi tao state cho man hinh.

File lien quan:
- `agriai_frontend/src/App.js`
- `agriai_frontend/src/pages/DiagnosisPage.jsx`

## 2. Tai danh sach loai cay trong

Khi trang mo, frontend goi API lay danh sach loai cay trong de hien thi trong dropdown.

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/CropTypeController.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CropTypeService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/CropTypeRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/CropType.java`

## 3. Xin quyen GPS

Frontend xin vi tri tu trinh duyet. Neu nguoi dung dong y, he thong se gui `latitude` va `longitude` khi chan doan.

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`

## 4. Chon loai cay va tai anh

Nguoi dung chon loai cay, tai anh len. Frontend tao preview va xoa ket qua cu.

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseUploadPanel.jsx`

## 5. Gui yeu cau chan doan

Nguoi dung nhan nut `Chan doan`. Frontend kiem tra:
- da chon anh hay chua
- da chon loai cay hay chua

Sau do frontend tao `FormData` va gui `POST /api/diagnosis` gom:
- `image`
- `cropTypeId`
- `latitude`
- `longitude`

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`

## 6. Backend nhan request

Controller nhan request multipart form-data va chuyen sang service xu ly chinh.

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseRequest.java`

## 7. Kiem tra du lieu dau vao

Backend kiem tra:
- anh ton tai va khong rong
- file la dinh dang anh
- `cropTypeId` hop le
- loai cay dang hoat dong

Dong thoi he thong:
- tim `AIModel` phu hop theo loai cay
- fallback model active dau tien neu khong co model rieng
- resolve user neu request co dang nhap

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/UserRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/CropTypeRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AIModelRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AIModel.java`

## 8. Tao lich su chan doan trang thai PENDING

Ngay sau khi validate thanh cong, he thong tao `DiagnoseHistory` de luu vet tien trinh.

Thong tin luu gom:
- user
- crop type
- latitude
- longitude
- status = `PENDING`

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistory.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java`

## 9. Upload anh len Cloudinary

He thong upload anh len storage va nhan ve `imageUrl`.

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAttachmentService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/ImageStoragePort.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CloudinaryService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/config/CloudinaryConfig.java`

## 10. Goi song song Vision AI va Weather API

Backend tao 2 tac vu async:
- goi Vision AI de nhan dien benh
- goi Weather API neu co GPS

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/VisionDetectionPort.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/WeatherPort.java`

## 11. Vision AI nhan dien benh

`VisionAIService`:
- tai anh tu `imageUrl`
- gui anh sang service ngoai `http://localhost:8010/predict`
- doc `detections`
- lay `class_name`
- lay `confidence`
- tao `VisionResultDTO`

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/VisionResultDTO.java`

Luu y:
- code hien tai khong thay su dung bounding box trong response cuoi
- `annotatedImageUrl` co trong DTO nhung chua duoc set trong luong chinh

## 12. Lay du lieu thoi tiet

Neu co GPS va co API key, he thong lay:
- nhiet do
- do am
- luong mua

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherApiService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherDTO.java`

## 13. Hau xu ly ket qua Vision

Backend:
- chong null
- nhan dien nhom label healthy
- loc confidence thap
- gom label trung nhau va giu confidence cao nhat
- map label AI sang `Disease`
- xac dinh:
  - `HEALTHY`
  - `UNKNOWN`
  - `DISEASE_DETECTED`

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAnalysis.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DetectedDiseaseMatch.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapper.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Disease.java`

## 14. Chay rule engine tim phuong an xu ly

Neu co benh, backend tiep tuc:
- truy van `TreatmentPlan`
- chon plan chinh cho tung benh
- kiem tra tuong tac thuoc
- kiem tra dieu kien thoi tiet
- gom hoac tach thanh cac dot phun

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentSelector.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DrugInteractionChecker.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherAlertEvaluator.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/SprayProgramBuilder.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentPlanRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentPlan.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DrugInteraction.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentWeatherCondition.java`

## 15. Dung response chan doan

He thong tong hop:
- `imageUrl`
- weather
- disease results
- treatments
- spray programs
- interaction warnings
- weather alerts
- diagnosis type

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiseaseResultDTO.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentDTO.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentProgramDTO.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/InteractionWarningDTO.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherAlertDTO.java`

## 16. Sinh huong dan de hieu bang LLM

Backend gui `DiagnoseResponse` sang `LLMService` de tao `userGuidance`.

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/GuidancePort.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/LLMService.java`

Luu y:
- LLM chi dien giai ket qua
- LLM khong phai thanh phan quyet dinh benh hay phac do chinh

## 17. Cap nhat va luu lich su chan doan

Sau khi co ket qua cuoi, he thong:
- cap nhat `DiagnoseHistory` thanh `COMPLETED`
- luu `weatherData`
- luu snapshot chi tiet vao `DiagnoseHistoryDetail`

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistoryDetail.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryDetailRepository.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiagnosisDetailSnapshotDTO.java`

## 18. Geocoding chay nen neu co GPS

Neu co GPS, backend goi geocoding async. Buoc nay khong nam tren critical path va loi geocoding khong lam fail chan doan.

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/NominatimPort.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java`

## 19. Tra ket qua ve frontend

Backend tra `DiagnoseResponse`, frontend nhan ket qua va cap nhat state `result`.

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`

## 20. Hien thi ket qua tren giao dien

Frontend render cac panel:
- weather
- ket qua benh
- phac do phun
- canh bao tuong tac thuoc
- canh bao thoi tiet
- bien phap canh tac
- AI guidance

File lien quan:
- `agriai_frontend/src/pages/DiagnosisPage.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseWeatherCards.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseResultPanel.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseSprayProgramsPanel.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseInteractionWarnings.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseWeatherAlertsPanel.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseCultivationMeasures.jsx`
- `agriai_frontend/src/components/diagnosis/DiagnoseAIGuidance.jsx`

## 21. Xem lai lich su chan doan

Neu user da dang nhap, frontend co the xem danh sach lich su va mo chi tiet tung lan chan doan. Backend doc snapshot da luu de reconstruct lai ket qua.

File lien quan:
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java`
- `agriai_frontend/src/pages/DiagnosisHistoryPage.jsx`
- `agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx`

## 22. Danh gia ket qua chan doan

Sau khi co ket qua, user dang nhap co the gui review ve do chinh xac cua lan chan doan.

File lien quan:
- `agriai_frontend/src/components/DiagnosisRatingModal.jsx`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseReviewController.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java`

## Tom tat flow ngan

`Mo trang chan doan -> tai crop types -> chon crop va upload anh -> gui /api/diagnosis -> validate -> tao history PENDING -> upload Cloudinary -> goi Vision AI + Weather -> map label sang Disease -> chay rule engine -> build response -> sinh AI guidance -> luu history -> tra ket qua -> hien thi frontend`

