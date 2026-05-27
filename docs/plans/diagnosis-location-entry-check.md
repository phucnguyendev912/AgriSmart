# Kế hoạch: Fix Diagnosis Lấy Sai Vị Trí

## Mô tả yêu cầu
Nguyên nhân hiện tại đã xác nhận: `DiagnosisPage` đang dùng `coords` từ `LocationPermissionContext`; context này đọc cache global `agriai_last_location`, nên `hasCoords = true` làm trang chẩn đoán bỏ qua việc lấy GPS mới. Khi submit, code gửi luôn `currentCoords = coords`, nên có thể gửi tọa độ cũ. Ngoài ra `requestLocation` hiện cho browser dùng cache 5 phút qua `maximumAge: 300000`.

## Đề xuất thay đổi

### 1. [LocationPermissionContext.js](file:///d:/AgriAI/agriai_frontend/src/context/LocationPermissionContext.js)
- Bỏ cache global `agriai_last_location`: không đọc, không ghi, không xóa localStorage key này nữa. Xóa hoàn toàn hằng số `LAST_LOCATION_KEY` và hàm `readSavedCoords`.
- Khởi tạo `coords` state dạng runtime: `{ latitude: null, longitude: null, accuracy: null, timestamp: null }`.
- Cập nhật `requestLocation(options)` để nhận override options, với mặc định là:
  - `enableHighAccuracy: true`
  - `maximumAge: 0`
  - `timeout: 15000`
- Khi định vị thành công, lưu vào `coords` state (không lưu localStorage) và trả về đối tượng `coords` chứa cả `accuracy` và `timestamp`:
  ```javascript
  {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp
  }
  ```
- Dọn dẹp `useEffect` đồng bộ quyền (bỏ các dòng xóa/gọi `LAST_LOCATION_KEY`).

### 2. [DiagnosisPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- Khai báo các state cục bộ:
  - `diagnosisCoords` (mặc định `{ latitude: null, longitude: null, accuracy: null, timestamp: null }`)
  - `checkingLocation` (mặc định `false`)
  - `locationError` (mặc định `null`)
- Khai báo `locationPromiseRef` bằng `useRef(null)` để theo dõi tiến trình của Promise GPS.
- Khi component mount:
  - Gọi ngay `requestLocation({ enableHighAccuracy: true, maximumAge: 0, timeout: 15000 })` và lưu promise vào `locationPromiseRef`.
  - Cập nhật `checkingLocation = true`.
  - Khi promise giải quyết, cập nhật `diagnosisCoords` và thiết lập `checkingLocation = false`. Nếu thất bại, ghi nhận `locationError`.
- Trong hàm `submitDiagnose`:
  - Nếu `checkingLocation` đang là `true`, thực hiện `await locationPromiseRef.current` để chờ việc định vị hoàn tất trước khi tiến hành gửi API.
  - Sử dụng `diagnosisCoords` (không dùng context `coords` hoặc bất kỳ cache nào) để đính kèm `latitude`/`longitude` vào `FormData` gửi đi.
  - Vẫn cho phép gửi chẩn đoán khi GPS thất bại hoặc bị từ chối/timeout (không kèm `latitude`/`longitude`).

### 3. [DiagnoseUploadPanel.jsx](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/components/DiagnoseUploadPanel.jsx)
- Cập nhật props nhận vào: thay thế `gpsStatus` bằng `checkingLocation`, `hasLocation` và `locationError`.
- Thay thế khối hiển thị cảnh báo GPS cũ bằng UI động hiển thị 3 trạng thái rõ ràng dưới nút chẩn đoán:
  - **Đang kiểm tra:** "Đang kiểm tra vị trí hiện tại..." (màu xám/xanh nhạt, kèm spinner).
  - **Thành công:** "Đã cập nhật vị trí hiện tại" (màu xanh lá, icon location).
  - **Thất bại/Từ chối:** "Không lấy được vị trí hiện tại, chẩn đoán vẫn tiếp tục nhưng thiếu dữ liệu thời tiết/khu vực" (màu vàng cam, icon location_off).

## Kế hoạch kiểm thử (Verification Plan)

### Kiểm thử thủ công
1. **Kiểm tra hoạt động GPS mới khi vào trang:**
   - Xóa cache localStorage, vào trang `/diagnosis`.
   - Xác minh browser hiển thị hộp thoại yêu cầu vị trí mới ngay lập tức. UI hiển thị trạng thái "Đang kiểm tra vị trí hiện tại...".
2. **Kiểm tra chẩn đoán chờ GPS:**
   - Chọn loại cây trồng, tải ảnh, bấm ngay "Chẩn đoán ngay" khi GPS vẫn đang quét. Xác nhận request API `/api/diagnosis` không gửi đi ngay mà đợi cho đến khi GPS resolve hoặc timeout.
3. **Kiểm tra khi từ chối quyền định vị:**
   - Từ chối quyền GPS, xác nhận UI hiển thị: "Không lấy được vị trí hiện tại...". Bấm chẩn đoán, xác nhận request gửi đi thành công và không chứa `latitude`/`longitude` trong Payload.
4. **Kiểm tra tính độc lập của cache:**
   - Kiểm tra localStorage sau khi lấy GPS thành công tại trang chẩn đoán, đảm bảo không có khóa `agriai_last_location` được tạo hoặc cập nhật.
   - Cache của trang chủ (`agriai_last_gps_location`) vẫn giữ nguyên giá trị cũ.

### Kiểm thử tự động
- Chạy lại toàn bộ test suites frontend để đảm bảo không lỗi:
  ```bash
  npm run test
  ```
