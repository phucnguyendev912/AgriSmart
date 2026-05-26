# Khắc phục lỗi luồng cấp quyền vị trí (Location Permission Flow)

## Mục tiêu
Điều tra và khắc phục triệt để lỗi người dùng từ chối quyền vị trí ban đầu, sau đó cấp quyền lại ("chấp nhận lại") nhưng hệ thống vẫn không ghi nhận được tọa độ khi ấn Chẩn đoán.

## Phân tích luồng lỗi (Từ đầu đến cuối)

1. **Người dùng truy cập lần đầu:**
   - Hệ thống (thông qua `InitialLocationPrompt`) tự động gọi `requestLocation()`.
   - Trình duyệt hiển thị popup hỏi quyền vị trí.

2. **Người dùng ấn "Từ chối" (Deny):**
   - Trình duyệt chặn quyền truy cập vị trí.
   - Hàm `getCurrentPosition` trả về lỗi.
   - Ứng dụng ghi nhận `gpsStatus = 'denied'` và `coords = null`.
   - Lúc này người dùng bấm Chẩn đoán, tọa độ sẽ là `null` và hệ thống hiện cảnh báo màu cam.

3. **Người dùng vào cài đặt trình duyệt để cấp lại quyền ("chấp nhận lại"):**
   - Sự kiện `navigator.permissions.onchange` đáng lẽ phải được kích hoạt để đổi `gpsStatus` sang `'granted'` và tự động lấy lại vị trí.
   - **LỖI (Đã sửa):** Trên nhiều trình duyệt (đặc biệt là mobile hoặc Safari), sự kiện `onchange` của quyền có thể **không hoạt động ổn định** hoặc không kích hoạt ngay lập tức nếu tab đang bị ẩn. Do đó, biến `gpsStatus` trong state của React vẫn bị kẹt ở `'denied'`.
   
4. **Người dùng quay lại tab ứng dụng và bấm "Chẩn đoán":**
   - **LỖI (Đã sửa):** Trước đây, vì `gpsStatus` vẫn bị kẹt ở giá trị `'denied'` (do `onchange` không chạy), câu lệnh điều kiện chặn quyền sẽ `false`. Hệ thống **không thèm gọi** `requestLocation()` nữa. Do đó, vị trí không được cập nhật dù trình duyệt đã cho phép.

## Giải pháp đã triển khai (Khớp với Code hiện tại)

### 1. Sửa `LocationPermissionContext.js` (Sửa lỗi kẹt tọa độ)
Đảm bảo ngay khi trình duyệt báo trạng thái quyền là "Cho phép" (kể cả khi khởi chạy lại component hay qua sự kiện `onchange`), ứng dụng sẽ tự động ngầm lấy vị trí:
- Gọi `requestLocation()` trực tiếp khi `result.state === 'granted'` bên trong `useEffect`.

### 2. Thêm kiểm tra quyền khi Load trang (`DiagnosisPage.jsx`)
Khi người dùng vừa vào trang Chẩn đoán, hệ thống chạy một `useEffect`:
- Dùng `navigator.permissions.query({ name: 'geolocation' })` để lấy trạng thái thật của trình duyệt (vượt qua state bị kẹt).
- Nếu trạng thái là `granted` (đã cho phép) hoặc `prompt` (chưa hỏi/bị reset), hệ thống tự động gọi `requestLocation()` để cập nhật tọa độ hoặc mở popup hỏi quyền lại.

### 3. Chủ động kiểm tra lại khi ấn "Chẩn đoán ngay" (`DiagnosisPage.jsx`)
Khi người dùng bấm nút Chẩn đoán:
- Dùng `navigator.permissions.query` một lần nữa để xác nhận trạng thái quyền hiện tại thay vì tin vào biến `gpsStatus` lưu trong React Context.
- Nếu trạng thái thật **không bị khóa (not denied)**, hệ thống lập tức lấy vị trí (try `requestLocation`) và đưa tọa độ tươi nhất vào FormData trước khi gửi API.

## Checklist kiểm tra (Verification)
- [x] Truy cập ứng dụng -> Từ chối quyền vị trí.
- [x] Bấm Chẩn đoán -> Không có vị trí được gửi (Có cảnh báo màu cam dưới nút).
- [x] Vào Cài đặt trang (Site Settings) -> Đổi quyền vị trí thành "Cho phép" (Allow).
- [x] KHÔNG REFRESH TRANG -> Bấm Chẩn đoán lần 2 hoặc thoát ra vào lại màn hình Chẩn đoán.
- [x] Ứng dụng tự động lấy vị trí -> Cảnh báo màu cam biến mất.
- [x] Kiểm tra API Request -> Tọa độ đã được gửi đi thành công lên Backend.
