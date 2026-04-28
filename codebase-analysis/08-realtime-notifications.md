# 8. Thông báo realtime và trạng thái notification

## 1. Luồng chạy tổng quan

Thông báo thực sự đang chạy trong code là thông báo realtime gợi ý xác nhận vị trí.

1. Sau chẩn đoán có GPS, `DiagnoseService` gọi nền `GeocodingService.processGeocoding`.
2. `GeocodingService` lưu `AreaInfor` mới nếu chưa tồn tại.
3. `GeocodingService` dùng `SimpMessagingTemplate.convertAndSendToUser(...)` gửi message lên queue `/queue/location-confirm`.
4. [WebsocketConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/websocket/WebsocketConfig.java) cấu hình endpoint `/ws`, broker `/topic` và `/queue`, đồng thời auth STOMP bằng JWT.
5. Frontend [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx) connect SockJS/STOMP tới `/ws`.
6. Frontend subscribe `/user/queue/location-confirm`.
7. Khi nhận payload, frontend hiện toast có nút điều hướng sang `/farming-areas`.

## 2. Vai trò từng file

- [WebsocketConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/websocket/WebsocketConfig.java)
- [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java)
- [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx)
- [NotificationsPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/NotificationsPage.jsx)
- [Notification.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Notification.java)
- [NotificationRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/NotificationRepository.java)
- [NotificationDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/NotificationDTO.java)
- [FirebaseConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/firebase/FirebaseConfig.java)

Lưu ý:

- `NotificationRepository.java` và `NotificationDTO.java` hiện đang comment toàn bộ.
- `NotificationsPage.jsx` hiện dùng mock data.

## 3. Phân tích từng hàm

### `WebsocketConfig.configureMessageBroker()`

- Bật simple broker cho `/topic` và `/queue`.

### `WebsocketConfig.registerStompEndpoints()`

- Expose endpoint `/ws` với SockJS.

### `WebsocketConfig.configureClientInboundChannel()`

- Intercept frame STOMP `CONNECT`, lấy JWT từ header `Authorization`, validate token, set user vào accessor.

### `GlobalNotificationListener.useEffect()`

- Lấy `accessToken` từ localStorage
- Tạo STOMP client
- Connect `/ws`
- Subscribe `/user/queue/location-confirm`
- Parse payload
- Hiện toast

## 4. API endpoint

- WebSocket endpoint: `/ws`
  - Không phải REST endpoint
  - Kết nối qua SockJS/STOMP
  - Auth bằng JWT trong STOMP header `Authorization`

REST notification:

- Hiện chưa có endpoint notification thực sự hoạt động.

## 5. DTO / Request / Response

### `LocationConfirmPayload`

- File: [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- Fields:
  - `areaId: Integer`
  - `displayName: String`
  - `message: String`
  - `redirectPath: String`

### `NotificationDTO`

- Có tồn tại nhưng đang bị comment, chưa active.

## 6. Tương tác với Database

Luồng realtime đang chạy:

- Có lưu `AreaInfor` trước khi gửi notification
- Nhưng không lưu record `Notification`

Entity notification:

- `Notification(userId,title,content,notificationType,isRead,readAt)` có tồn tại
- Tuy nhiên chưa có luồng CRUD thật

Kết luận:

- Notification bền vững trong DB chưa hoàn chỉnh
- Phần đang hoạt động thật chỉ là WebSocket realtime toast

## 5. Hướng dẫn chỉnh sửa (Modification Guide)

**Khi cần thay đổi tính năng, bạn cần mở các file sau:**

1. **Gắn thêm một Trigger sinh thông báo (Nhắc nhở tự động):**
   - **Backend:** Inject `NotificationService.java` và gọi `createNotification()`. Khai báo Cron job (@Scheduled).
   - **Enum:** Thêm `NotificationType`.
