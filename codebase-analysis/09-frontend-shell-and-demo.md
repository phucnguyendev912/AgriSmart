# 9. Khối frontend shell, trang marketing và chatbot demo

## 1. Luồng chạy tổng quan

1. [index.js](/D:/AgriAI/agriai_frontend/src/index.js) mount React app và bọc trong `AuthProvider`.
2. [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js) nạp trạng thái đăng nhập từ localStorage, cố refresh token khi app start.
3. [App.js](/D:/AgriAI/agriai_frontend/src/App.js) khai báo router và layout chung.
4. `Navbar`, `Footer`, `ChatBotWidget`, `GlobalNotificationListener` được gắn ở cấp app.
5. Các page marketing như `LandingPage`, `HomePage`, `Hero`, `Features` chủ yếu render nội dung tĩnh.
6. `ChatBotWidget` hiện chỉ dùng mock response trong frontend, không gọi backend.

## 2. Vai trò từng file

- [index.js](/D:/AgriAI/agriai_frontend/src/index.js)
- [App.js](/D:/AgriAI/agriai_frontend/src/App.js)
- [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js)
- [Navbar.jsx](/D:/AgriAI/agriai_frontend/src/components/Navbar.jsx)
- [Footer.jsx](/D:/AgriAI/agriai_frontend/src/components/Footer.jsx)
- [SEO.jsx](/D:/AgriAI/agriai_frontend/src/components/SEO.jsx)
- [LandingPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/LandingPage.jsx)
- [HomePage.jsx](/D:/AgriAI/agriai_frontend/src/pages/HomePage.jsx)
- [Hero.jsx](/D:/AgriAI/agriai_frontend/src/components/Hero.jsx)
- [Features.jsx](/D:/AgriAI/agriai_frontend/src/components/Features.jsx)
- [ChatBotWidget.jsx](/D:/AgriAI/agriai_frontend/src/components/ChatBotWidget.jsx)

## 3. Phân tích từng hàm

### `AuthProvider.refreshAuthToken()`

- Khi app load, gọi `/api/auth/refresh-token` để lấy token mới.
- Logic:
  1. gửi POST với `withCredentials=true`
  2. đọc `response.data.token`
  3. cố đọc `response.data.user`
  4. nếu có cả token và user thì update localStorage
  5. nếu 401 thì clear auth

Lưu ý:

- Backend refresh hiện không trả `user`, nên flow này đang lệch contract.

### `AuthProvider.loginContext()`

- Lưu access token và user vào state + localStorage.

### `AuthProvider.logoutContext()`

- Gọi `/api/auth/logout`, rồi clear local state.

### `Navbar.handleLogout()`

- Gọi `logoutContext()` rồi điều hướng `/login`.

### `ChatBotWidget.handleSend()`

- Thêm tin nhắn user vào state rồi giả lập AI trả lời sau timeout.

### `ChatBotWidget.getMockResponse()`

- Trả text hardcode theo keyword query.
- Đây chưa phải chatbot backend thật.

## 4. API endpoint

Frontend shell dùng:

- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`

Chatbot demo:

- Không gọi endpoint nào.

## 5. DTO / Request / Response

- Không có DTO backend riêng cho shell UI.
- Frontend dùng trực tiếp JSON response của auth API.

## 6. Tương tác với Database

- Không tương tác DB trực tiếp từ frontend shell.
- Chỉ lưu tạm vào `localStorage`:
  - `accessToken`
  - `user`

## Ghi chú

Các điểm lệch đáng chú ý:

1. `AuthContext.refreshAuthToken()` mong response có cả `token` và `user`, nhưng backend refresh hiện chỉ trả token mới + refreshToken cũ.
2. `ChatBotWidget` là mock local, chưa có backend.
