# Khắc phục luồng truy cập vị trí và Bản đồ dịch bệnh

## Mục tiêu
Sửa lỗi luồng truy cập vị trí để tọa độ được cập nhật khi người dùng cấp quyền, đồng thời đảm bảo lịch sử chẩn đoán được liên kết đúng với thông tin khu vực (tỉnh/thành) để Bản đồ dịch bệnh hiển thị chính xác thay vì để trống (`null`).

## Đợi xác nhận từ người dùng
Vui lòng xem qua các thay đổi bên dưới. Nguyên nhân gốc rễ đã được xác định:
1. **Frontend lưu đệm (cache) vị trí:** Frontend lưu tọa độ GPS mãi mãi và không bao giờ làm mới. Hơn nữa, nếu quyền vị trí bị từ chối hoặc chưa được hỏi, `latitude` và `longitude` sẽ là `null`. Khi đó, Database ở Backend sẽ bỏ qua bản ghi này khi truy vấn Bản đồ (`WHERE h.latitude IS NOT NULL`). Đây chính là lý do **các ca vừa chẩn đoán của bạn không hiện lên bản đồ**.
2. **Backend thiếu liên kết Khu vực:** Sau khi chẩn đoán, Backend tạo một `AreaInfor` mới nhưng lại quên không gán (link) nó ngược lại vào `DiagnoseHistory`, khiến bản đồ dịch bệnh bị thiếu dữ liệu tỉnh/thành (ngay cả khi ca bệnh có hiển thị).

## Câu hỏi mở
- Ngoài việc tự động hỏi vị trí khi ấn "Chẩn đoán", bạn có muốn thêm một nút "Cập nhật vị trí" thủ công trên giao diện Frontend không? Hiện tại, việc tự động làm mới ngầm khi quyền được cấp và khi ấn chẩn đoán đã đủ để giải quyết vấn đề.

## Đề xuất thay đổi

---

### Các file Backend

#### [SỬA] [AreaInforRepository.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AreaInforRepository.java)
- Thêm method để lấy `AreaInfor` đã có sẵn:
  ```java
  Optional<AreaInfor> findFirstByUserIdAndAddressAndIsDeleteFalse(Integer userId, String address);
  ```

#### [SỬA] [GeocodingService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java)
- Cập nhật `processGeocoding` để nhận thêm tham số `Integer historyId`.
- Thay vì `return` sớm nếu `AreaInfor` đã tồn tại, ta sẽ lấy nó ra bằng `findFirstByUserIdAndAddressAndIsDeleteFalse`.
- Inject `DiagnoseHistoryRepository` và cập nhật `DiagnoseHistory` bằng cách gán `AreaInfor` vừa tìm/tạo vào. Điều này giúp `h.areaInfor` có dữ liệu cho truy vấn của Bản đồ.

#### [SỬA] [DiagnoseService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java)
- Truyền `history.getId()` vào hàm `runGeocodingInBackground`:
  ```java
  runGeocodingInBackground(context, request, history.getId());
  ```
- Cập nhật signature của `runGeocodingInBackground` để truyền `historyId` xuống cho `geocodingService.processGeocoding`.

---

### Các file Frontend

#### [SỬA] [LocationPermissionContext.js](file:///d:/AgriAI/agriai_frontend/src/context/LocationPermissionContext.js)
- Sửa lỗi tọa độ cũ bị kẹt. Trong `useEffect` lắng nghe thay đổi quyền (`navigator.permissions`), nếu quyền là `granted`, gọi ngầm `requestLocation()` để làm mới tọa độ.

#### [SỬA] [DiagnosisPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- Cập nhật hàm `submitDiagnose` để tự động yêu cầu lấy vị trí (nếu chưa có) trước khi gọi API. Điều này đảm bảo nếu người dùng chưa cấp quyền, họ sẽ được hỏi ngay lúc đó, và tọa độ sẽ được gửi thành công xuống Backend giúp ca bệnh hiện lên bản đồ.
  ```javascript
  let currentCoords = coords;
  if (!hasCoords && gpsStatus !== 'denied') {
      const locResult = await requestLocation();
      if (locResult.ok) {
          currentCoords = locResult.coords;
      }
  }
  // Sau đó dùng currentCoords để đưa vào formData
  ```

## Kế hoạch kiểm tra (Verification Plan)

### Kiểm tra thủ công
- **Frontend**: Kiểm tra local storage. Thu hồi và cấp lại quyền vị trí trong cài đặt trình duyệt. Xác minh `agriai_last_location` tự động cập nhật tọa độ mới.
- **Backend/Map**: Gửi một chẩn đoán mới kèm dữ liệu GPS. Sau khi hoàn tất, kiểm tra bản đồ dịch bệnh (`/warning-map`) để đảm bảo ca vừa chẩn đoán hiển thị lên bản đồ và có thông tin Tỉnh/Khu vực thay vì `null`.
