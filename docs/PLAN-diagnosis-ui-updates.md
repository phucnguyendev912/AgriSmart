# PLAN-diagnosis-ui-updates

## Mục tiêu
Cập nhật UI kết quả chẩn đoán bệnh cây trồng và tái cấu trúc luồng dữ liệu (Backend - Frontend) để đảm bảo tính đúng đắn về trách nhiệm (Frontend lo hiển thị, Backend lo dữ liệu).

1. Thay đổi Backend để trả về riêng biệt tên Tiếng Việt và Tiếng Anh thay vì nối chuỗi sẵn.
2. Frontend tự format hiển thị tên bệnh theo chuẩn: Tiếng Việt (Tiếng Anh) (VD: Đạo ôn (Magnaporthe oryzae)).
3. Đưa các phác đồ điều trị được gắn mác "Khuyến nghị" lên đầu danh sách.
4. Làm nổi bật và rõ ràng hơn tên bệnh ở cả phần kết quả chẩn đoán và phác đồ điều trị.
5. Tăng kích thước chữ của phần "Tư vấn chuyên gia AI" (Guidance).

## User Review Required
> [!IMPORTANT]
> - Yêu cầu này sẽ sửa đổi Backend DTO (`DiseaseResultDTO`, `TreatmentDTO`) để thêm trường `diseaseNameEn`.
> - Việc xử lý logic nối chuỗi sẽ bị loại bỏ khỏi `DiagnoseResponseBuilder` ở Backend và chuyển việc format sang Frontend.
> - Kích thước chữ của Guidance sẽ được tăng từ `13px` lên `14px` hoặc `15px`.
> - Vui lòng xem xét các thay đổi Backend dưới đây xem đã đúng ý bạn chưa.

## Proposed Changes

### 1. Backend

#### [MODIFY] [DiseaseResultDTO.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiseaseResultDTO.java)
- Thêm thuộc tính: `private String diseaseNameEn;`

#### [MODIFY] [TreatmentDTO.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentDTO.java)
- Thêm thuộc tính: `private String diseaseNameEn;`

#### [MODIFY] [DiagnoseResponseBuilder.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java)
- Xóa bỏ logic gộp chuỗi `getDiseaseNameEn() + " (" + getDiseaseName() + ")"`.
- Trả về `diseaseName` (Tiếng Việt) và `diseaseNameEn` nguyên bản.

#### [MODIFY] [TreatmentMapper.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/mapper/TreatmentMapper.java)
- Bổ sung việc map thuộc tính `.diseaseNameEn(plan.getDisease() != null ? plan.getDisease().getDiseaseNameEn() : null)` cho `TreatmentDTO`.

---

### 2. Frontend

#### [MODIFY] [DiagnoseResultPanel.jsx](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/components/DiagnoseResultPanel.jsx)
- **UI Update**: Hiển thị tên bệnh dưới dạng `{disease.diseaseName} {disease.diseaseNameEn ? \`(${disease.diseaseNameEn})\` : ''}` thay vì chuỗi gộp sẵn.
- **UI Update**: Tăng kích thước chữ của tên bệnh (từ `text-sm` lên `text-base` hoặc `text-lg`), đổi style/màu sắc để làm nổi bật tên bệnh hơn.

#### [MODIFY] [DiagnoseSprayProgramsPanel.jsx](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/components/DiagnoseSprayProgramsPanel.jsx)
- **Cập nhật logic sắp xếp**: Trước khi hiển thị mảng `program.treatments`, thực hiện sort để đưa các treatment có `recommended === true` lên đầu tiên.
- **UI Update**: Làm rõ tên bệnh trong phác đồ điều trị. Tăng size/weight của tên bệnh, đổi format thành Tiếng Việt (Tiếng Anh) bằng dữ liệu mới từ backend. Thay vì một thẻ badge nhỏ `text-[10px]`, có thể chuyển thành một header hoặc badge to/rõ ràng hơn.

#### [MODIFY] [DiagnoseAIGuidance.jsx](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/components/DiagnoseAIGuidance.jsx)
- **UI Update**: Thay đổi `text-[13px]` thành `text-sm` (14px) hoặc `text-[15px]` trong nội dung tư vấn để dễ đọc hơn.

## Verification Plan
### Automated Tests
- Chạy thử backend để đảm bảo API chẩn đoán vẫn trả về đủ kết quả, đúng format mới.
- Khớp frontend với response JSON mới, run `npm run test` nếu cần.

### Manual Verification
- Chụp một bức ảnh lúa bị Đạo ôn.
- Kiểm tra kết quả hiển thị "Đạo ôn (Magnaporthe oryzae)".
- Kiểm tra phần phác đồ điều trị đã hiển thị phác đồ "Khuyến nghị" lên đầu.
- Xem phần Guidance có chữ to và dễ đọc hơn không.
