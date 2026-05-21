# Workflow: Area & Cultivation Management (Quản lý Khu vực Canh tác Nông nghiệp)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** thiết kế và vận hành tính năng Quản lý khu vực canh tác nông nghiệp, từ cấu trúc CRUD API phân quyền nghiêm ngặt ở backend, giải pháp Xóa mềm (Soft Delete) an toàn, đến giao diện quản lý dữ liệu trực quan bằng các Modal tương tác phía React frontend.

---

## 1. Tổng quan chức năng

Quản lý khu vực canh tác (vườn ruộng) giúp người nông dân thiết lập các ô ruộng thực tế của mình để hệ thống có thể theo dõi dịch bệnh địa phương, đồng bộ dự báo rủi ro thời tiết riêng biệt cho từng khu vực, và đồng bộ dữ liệu chẩn đoán cây trồng trong suốt vụ mùa.

### Các mảnh ghép cấu thành tính năng:
1. **CRUD Khu vực canh tác:** Cho phép thêm mới, liệt kê, chỉnh sửa thông tin chi tiết (tên vườn, địa chỉ, tỉnh thành, diện tích, mô tả) và xóa bỏ vùng canh tác.
2. **Xác nhận vùng gợi ý chẩn đoán (Location Confirmation Integration):** Đồng bộ hóa với luồng địa lý ngược (Geocoding) bất đồng bộ của ảnh chẩn đoán bệnh để chính thức hóa và lưu trữ lâu dài vùng nông nghiệp mới.
3. **Phân quyền truy cập tài nguyên (Resource-level Access Control):** Đảm bảo nông dân chỉ có quyền xem, sửa, xóa các vùng vườn thuộc sở hữu của chính tài khoản của mình.
4. **Soft Delete (Xóa mềm bảo toàn lịch sử):** Xóa khu vực mà không thực sự xóa vật lý bản ghi trong DB để tránh phá vỡ tính toàn vẹn tham chiếu của các ca bệnh lịch sử đã xảy ra ở khu vực đó.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả luồng thêm mới và cập nhật khu vực canh tác:

### 2.5. Luồng Thêm mới Vùng canh tác (Create Farming Area Workflow)

```
[ Nông dân nhấn "Thêm khu vực canh tác" ]
        │ (1) React mở AddFarmingAreaModal
        ▼
[ React (AddFarmingAreaModal.jsx) ]
        │ (2) Điền Form (Tên vùng, Tỉnh, Địa chỉ, Diện tích, Mô tả) -> Gửi
        ▼
[ React (FarmingAreaPage.jsx) ]
        │ (3) Gọi API POST /api/areas kèm theo Cookie chứa JWT xác thực.
        ▼
[ Backend (AreaInforController.java) ]
        │ (4) Controller nhận `@Valid AreaInforRequest request`.
        │     Gọi areaInforService.create(principal.getName(), request)
        ▼
[ AreaInforService.java ]
        │
        ├─(5) Xác thực người dùng bằng cách tìm email trong UserRepository.
        │     - Nếu không khớp: Quăng lỗi NOT_FOUND (404).
        │
        ├─(6) Xây dựng thực thể [AreaInfor] mới thông qua Lombok Builder:
        │     - user = user
        │     - areaName = request.getAreaName()
        │     - province = request.getProvince()
        │     - address = request.getAddress()
        │     - area = request.getArea() (diện tích)
        │
        ├─(7) Gọi areaInforRepository.save(area) để lưu vào Database.
        │
        ├─(8) Ánh xạ thực thể vừa lưu sang [AreaInforResponse] DTO mỏng để che giấu thông tin nhạy cảm của User.
        ▼
[ React (FarmingAreaPage.jsx) ]
        │ (9) Nhận Response 200 OK
        ▼
[ Cập nhật state areas bằng cách chèn phần tử mới vào đầu mảng: setAreas((prev) => [newArea, ...prev]) ]
```

### 2.6. Luồng Xóa mềm Vùng canh tác (Soft Delete Workflow)

```
[ Nông dân click biểu tượng thùng rác xóa vùng ]
        │ (1) Hiển thị hộp thoại xác nhận gốc trình duyệt (window.confirm)
        ▼
[ React (FarmingAreaPage.jsx) ]
        │ (2) Gọi API DELETE /api/areas/{id}
        ▼
[ Backend (AreaInforController.java) ]
        │ (3) Controller gọi areaInforService.delete(principal.getName(), id)
        ▼
[ AreaInforService.java ]
        │
        ├─(4) Tìm kiếm vùng canh tác theo ID.
        │     - Nếu không tìm thấy: Quăng lỗi NOT_FOUND (404).
        │
        ├─(5) Kiểm tra chủ sở hữu: area.getUser().getEmail().equals(email)
        │     - Nếu không khớp: Quăng lỗi FORBIDDEN (403) lập tức!
        │
        ├─(6) Đánh dấu xóa mềm thay vì delete vật lý:
        │     - area.setIsDelete(true)
        │     - area.setDeletedAt(LocalDateTime.now())
        │     - area.setDeletedBy(currentUser.getId())
        │
        ├─(7) Gọi areaInforRepository.save(area) để cập nhật DB.
        ▼
[ React (FarmingAreaPage.jsx) ]
        │ (8) Nhận Response 204 No Content
        ▼
[ Loại bỏ vùng có ID tương ứng ra khỏi UI: setAreas((prev) => prev.filter((a) => a.id !== areaId)) ]
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [AreaInforController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AreaInforController.java)
* **Vai trò:** Cung cấp REST endpoints cho hoạt động quản lý khu vực: POST (Tạo), GET (Lấy danh sách theo User), PUT (Cập nhật và Xác nhận), DELETE (Xóa).

#### B. [AreaInforService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AreaInforService.java)
* **Vai trò:** Chứa business logic cho quản lý khu vực canh tác.
* **Đặc điểm thiết kế:**
  * Triển khai xác thực quyền sở hữu tài nguyên nghiêm ngặt (Resource Ownership Check) trước khi thực hiện chỉnh sửa hoặc xóa để tránh lỗ hổng bảo mật IDOR (Insecure Direct Object Reference).

#### C. [AreaInfor.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AreaInfor.java)
* **Vai trò:** Lớp thực thể ORM ánh xạ bảng `AreaInfor` trong cơ sở dữ liệu.
* **Đặc điểm thiết kế:** Kế thừa từ `BaseEntity` để tự động tích hợp các trường audit (`createdAt`, `updatedAt`, `createdBy`, `isDelete`).

---

### 3.2. Các Component quan trọng phía Frontend

#### A. [FarmingAreaPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx)
* **Vai trò:** Trang danh sách khu vực canh tác, chứa bảng hiển thị thông tin và điều phối các Modal.
* **Đặc điểm thiết kế:** Sử dụng hook `useCallback` để ghi nhớ hàm gọi API, tránh việc re-render tạo lại hàm làm lãng phí tài nguyên CPU của trình duyệt.

#### B. [AddFarmingAreaModal.jsx](file:///d:/AgriAI/agriai_frontend/src/features/farmingArea/components/AddFarmingAreaModal.jsx) & [EditFarmingAreaModal.jsx](file:///d:/AgriAI/agriai_frontend/src/features/farmingArea/components/EditFarmingAreaModal.jsx)
* **Vai trò:** Các component modal bọc form điền dữ liệu để thêm và chỉnh sửa thông tin khu vực.

---

## 4. Giải thích kỹ thuật sử dụng trong code

### 4.1. Giải pháp Xóa mềm (Soft Delete) bảo vệ dữ liệu liên kết
* **Tại sao cần thiết?** Khi nông dân xóa một khu vực canh tác, nếu chúng ta chạy câu lệnh `DELETE FROM area_infor WHERE id = X`, cơ sở dữ liệu sẽ gặp lỗi vi phạm ràng buộc khóa ngoại (Foreign Key Constraint Violation) nếu vùng canh tác này đang được tham chiếu bởi các bản ghi chẩn đoán lịch sử (`DiagnoseHistory`). Nếu tắt ràng buộc khóa ngoại để ép buộc xóa (Cascade Delete), toàn bộ các ca bệnh lịch sử chẩn đoán tại vùng đó cũng bị xóa sạch theo. Điều này phá hủy nghiêm trọng kho dữ liệu lớn phục vụ phân tích dịch tễ của vùng.
* **Giải pháp:** Sử dụng cờ `isDelete` để ẩn đi thực thể khi truy vấn, đồng thời ghi nhận audit dữ liệu (`deletedAt`, `deletedBy`) giúp hệ thống bảo toàn nguyên vẹn lịch sử dịch tễ nông nghiệp mà không ảnh hưởng tới trải nghiệm quản lý của nông dân.

### 4.2. Ngăn ngừa Lỗ hổng Bảo mật IDOR (Insecure Direct Object Reference)
Trong `AreaInforService.java` (dòng 60-62):
```java
if (!area.getUser().getEmail().equals(email)) {
    throw new AppException(HttpStatus.FORBIDDEN, "Không có quyền chỉnh sửa khu vực này.");
}
```
* **Giải thích:** Lỗ hổng IDOR xảy ra khi một kẻ tấn công thay đổi ID khu vực trong tham số đường dẫn API thành ID của một người dùng khác (ví dụ: gửi request sửa `PUT /api/areas/999` trong khi họ chỉ sở hữu area ID = 1). Nếu backend chỉ tìm kiếm area ID và cập nhật trực tiếp mà không kiểm tra xem area đó có thuộc về user đang đăng nhập (lấy từ JWT Principal) hay không, kẻ tấn công sẽ dễ dàng phá hủy hay đọc trộm dữ liệu toàn hệ thống. Đoạn check trên bảo vệ hệ thống tuyệt đối khỏi nguy cơ này.

---

## 5. Database & Query Analysis

### 5.1. Phân tích thực thể BaseEntity (Common Audit Columns)
Bảng `AreaInfor` kế thừa `BaseEntity` để lưu trữ các cột audit dùng chung cho mọi bảng:
* `createdAt` / `updatedAt`: Thời gian tạo và cập nhật.
* `createdBy` / `updatedBy`: ID người tạo và cập nhật.
* `isDelete`: Cờ đánh dấu xóa mềm (`false` là bình thường, `true` là đã xóa).
* `deletedAt` / `deletedBy`: Thời điểm xóa và ID người thực hiện xóa.

---

## 6. Kiến trúc & Design Pattern

### 6.1. Layered Architecture (Kiến trúc phân tầng)
* Module được tổ chức theo cấu trúc 3 tầng chuẩn mực của Spring Boot:
  1. **Presentation Layer (Controller):** Nhận request, xử lý HTTP, chuyển đổi kiểu dữ liệu DTO.
  2. **Business Logic Layer (Service):** Xử lý nghiệp vụ, kiểm tra phân quyền sở hữu IDOR, thiết lập dữ liệu thực thể.
  3. **Data Access Layer (Repository):** Giao tiếp với cơ sở dữ liệu Postgres qua Spring Data JPA.
* Sự phân tầng rõ ràng giúp code có tính độc lập cao, dễ viết unit test độc lập cho từng lớp và cực kỳ bảo trì trong tương lai.

---

## 7. Điểm chưa tối ưu (Technical Debt)

### 7.1. Trùng lặp mã Mapping thực thể sang Response DTO
* **Giải thích:** Trong `AreaInforService.java` (dòng 88-92), hàm `toResponse` đang thực hiện gán trường thủ công bằng tay (Manual mapping):
  ```java
  private AreaInforResponse toResponse(AreaInfor a) {
      return AreaInforResponse.builder().id(a.getId()).areaName(a.getAreaName())...build();
  }
  ```
  Nếu thực thể có thêm 10 trường mới, nhà phát triển phải bổ sung thủ công bằng tay tại tất cả các phương thức mapper tương tự.
* **Tác hại:** Dễ xảy ra thiếu sót khi sửa đổi cấu trúc dữ liệu, tăng boilerplate code vô ích.

---

## 8. Hướng tối ưu (Refactoring Code)

### 8.1. Tích hợp Thư viện MapStruct để tạo Mapper tự động
**Giải pháp:** Sử dụng thư viện **MapStruct** để tự động sinh mã bytecode cho các lớp Mapper khi build dự án, đảm bảo hiệu năng tối đa (chạy bằng các lệnh gọi Getter/Setter trực tiếp) và loại bỏ hoàn toàn boilerplate code thủ công.

#### [TRƯỚC] Ánh xạ thủ công bằng builder
```java
private AreaInforResponse toResponse(AreaInfor a) {
    return AreaInforResponse.builder()
        .id(a.getId())
        .areaName(a.getAreaName())
        .province(a.getProvince())
        .address(a.getAddress())
        .area(a.getArea())
        .description(a.getDescription())
        .build();
}
```

#### [SAU] Sử dụng MapStruct interface
```java
@Mapper(componentModel = "spring")
public interface AreaInforMapper {
    AreaInforResponse toResponse(AreaInfor area);
    AreaInfor toEntity(AreaInforRequest request);
}
```
* **Lợi ích:** Không cần viết mã triển khai cụ thể, MapStruct tự động sinh code tối ưu và chính xác 100% trong quá trình biên dịch.

---

## 9. Mindset của Senior Developer

1. **Tư duy Kiến trúc Bền vững (Data Integrity Mindset):** Việc kiên quyết áp dụng cơ chế Xóa mềm (Soft Delete) đối với thực thể vùng địa lý cho thấy tầm nhìn xa về mặt dữ liệu lớn. Dữ liệu địa lý dịch tễ của vùng canh tác là tài sản vô giá để hệ thống phân tích xu hướng dịch bệnh theo mùa ở các năm tiếp theo, không thể để sự thao tác xóa của người dùng làm mất vết thông tin.

---

## 10. Kết luận cho feature

Quản lý khu vực canh tác nông nghiệp là một module nền tảng được tổ chức rất quy chuẩn, áp dụng các best practices về bảo mật tài nguyên IDOR, an toàn dữ liệu lịch sử thông qua Soft Delete và phân tách tầng rõ ràng, đảm bảo khả năng vận hành lâu dài và mở rộng dễ dàng của AgriSmart.
