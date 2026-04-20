# Tài liệu Kiến trúc: Chức năng Bản đồ Cảnh báo Dịch bệnh (Disease Warning Map)

Tài liệu này mô tả chi tiết luồng hoạt động, cấu trúc mã nguồn và cách thức xây dựng chức năng hiển thị bản đồ dịch bệnh thời gian thực trong hệ thống AgriSmart.

## 1. Luồng hoạt động (System Workflow)

1. **Yêu cầu (Request):** Khi người dùng truy cập trang "Bản đồ dịch bệnh", Frontend tự động gọi API `GET /api/map/markers` với các tham số mặc định (ví dụ: `days=30`).
2. **Xử lý dữ liệu (Processing):**
   - Backend nhận yêu cầu, tính toán mốc thời gian bắt đầu (`LocalDateTime.now() - days`).
   - Sử dụng một Repository chuyên biệt để thực hiện truy vấn phức tạp (Join 3-4 bảng).
3. **Phản hồi (Response):** Trả về danh sách `MapMarkerResponse` chứa tọa độ, tên bệnh, ngày phát hiện và tỉnh thành.
4. **Hiển thị (Rendering):**
   - Frontend sử dụng **Leaflet.js** để vẽ các chấm tròn (`CircleMarker`).
   - Màu sắc của chấm được quyết định dựa trên ID của loại bệnh (Đỏ: Đạo ôn, Cam: Khô vằn, Xanh: Rầy nâu).
   - Khi click vào marker, một Popup hiện ra hiển thị chi tiết thông tin.

---

## 2. Chi tiết các thành phần (Backend)

### 1. `MapMarkerResponse.java` (DTO)

- **Vị trí:** `com.phucnguyen.agriai.dto`
- **Chức năng:** Là một Java Record dùng để vận chuyển dữ liệu tối giản từ DB ra API.
- **Các trường:** `historyId`, `latitude`, `longitude`, `diseaseId`, `diseaseName`, `diagnosedAt`, `province`.

### 2. `DiseaseMapRepository.java` (Repository)

- **Vị trí:** `com.phucnguyen.agriai.repository`
- **Cách xây dựng:** Kế thừa `JpaRepository<DiagnoseHistory, Integer>`.
- **Hàm `findMarkers`:** Sử dụng **JPQL** với từ khóa `new com.phucnguyen.agriai.dto.MapMarkerResponse(...)` để map trực tiếp kết quả truy vấn vào DTO.
- **Logic truy vấn:**
  - Join `DiagnoseHistory` với `DiagnoseHistoryDetail`.
  - Join tiếp với `Disease` để lấy tên bệnh.
  - Left Join với `AreaInfor` để lấy tên tỉnh (`province`).
  - Lọc theo `latitude NOT NULL`, `isDelete = false`, và thời gian (`since`).

### 3. `DiseaseMapService.java` (Service)

- **Vị trí:** `com.phucnguyen.agriai.service`
- **Chức năng:** Tiếp nhận tham số `days` từ Controller, chuyển đổi thành đối tượng `LocalDateTime` và gọi Repository.

### 4. `DiseaseMapController.java` (Controller)

- **Vị trí:** `com.phucnguyen.agriai.controller`
- **Chức năng:** Expose endpoint `/api/map/markers`. Hỗ trợ 2 tham số query: `days` (mặc định 30) và `diseaseId` (tùy chọn).

---

## 3. Chi tiết các thành phần (Frontend)

### 1. `DiseaseMapPage.jsx`

- **Vị trí:** `src/pages/`
- **Công nghệ:** `react-leaflet`, `leaflet`.
- **Hàm chính:**
  - `fetchMarkers()`: Gọi API với header `Authorization` (Sử dụng key `accessToken` từ localStorage).
  - `getColor(diseaseId)`: Mapping ID bệnh sang mã màu Hex.
  - `MapContainer`: Thành phần gốc của bản đồ, đặt tâm mặc định tại Việt Nam (Đà Nẵng).
  - `CircleMarker`: Từng điểm bệnh được vẽ dưới dạng hình tròn với bán kính cố định, giúp bản đồ trông thoáng hơn so với Marker hình giọt nước mặc định.

---

## 4. Đặc điểm xây dựng và tối ưu

- **Tách biệt Repository:** Không nhét chung vào `DiagnoseHistoryRepository` để giữ mã nguồn gọn gàng (`Clean Code`).
- **Native DTO Projection:** Truy vấn chỉ lấy đúng những trường cần thiết, giảm tải cho bộ nhớ và băng thông.
- **Leaflet Lightweight:** Sử dụng `CircleMarker` thay vì icon hình ảnh để tối ưu hiệu năng khi có hàng ngàn điểm bệnh trên bản đồ.
