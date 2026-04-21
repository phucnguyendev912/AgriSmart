# Phân tích codebase AgriAI theo từng chức năng

Tài liệu này được tổng hợp từ việc đọc source chính của backend `D:\AgriAI\agriai_backend\agriai\src\main` và frontend `D:\AgriAI\agriai_frontend\src`.

Codebase hiện chia thành 9 chức năng chính. Backend đi theo lớp `Controller -> Service -> Repository -> Entity/DB`, còn các tích hợp ngoài được tách thêm `Port -> Adapter/Service` để giảm phụ thuộc trực tiếp vào Cloudinary, YOLO, OpenWeather, Nominatim, Gemini.

## 1. Xác thực người dùng

### 1. Luồng chạy tổng quan

Luồng chạy:

1. Frontend [LoginPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/LoginPage.jsx) hoặc [RegisterPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/RegisterPage.jsx) gửi request tới `POST /api/auth/*`.
2. Request vào [AuthController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AuthController.java).
3. Controller gọi [AuthService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AuthService.java).
4. Service thao tác với `UserRepository`, `RoleRepository`, `PasswordEncoder`, `AuthenticationManager`, `JwtService`.
5. Dữ liệu được đọc/ghi ở bảng `users`, `roles`.
6. Controller set cookie `accessToken` và `refreshToken`, đồng thời trả JSON response cho frontend.

Lý do tách tầng:

- Controller chỉ xử lý HTTP, request body, cookie, response.
- Service giữ logic nghiệp vụ như kiểm tra trùng email, mã hóa mật khẩu, sinh JWT.
- Repository chỉ phụ trách truy vấn DB.
- Security tách riêng để xác thực JWT cho toàn hệ thống, tránh nhét logic auth vào từng controller.

### 2. Vai trò từng file

Các file liên quan:

- [AuthController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AuthController.java): định nghĩa endpoint auth.
- [AuthService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AuthService.java): xử lý nghiệp vụ đăng ký, đăng nhập, refresh token.
- [SecurityConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/SecurityConfig.java): cấu hình security, CORS, permitAll.
- [JwtAuthenticationFilter.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/JwtAuthenticationFilter.java): lấy JWT từ header hoặc cookie và gắn user vào SecurityContext.
- [JwtService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/JwtService.java): sinh và validate token.
- [CustomUserDetailsService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/CustomUserDetailsService.java): nạp user cho Spring Security.
- [UserRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/UserRepository.java): truy vấn bảng users.
- [RoleRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/RoleRepository.java): truy vấn bảng roles.
- [User.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/User.java): entity người dùng.
- [Role.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Role.java): entity quyền.
- [RegisterRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/RegisterRequest.java): DTO request đăng ký.
- [LoginRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/LoginRequest.java): DTO request đăng nhập.
- [LoginResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/LoginResponse.java): DTO response đăng nhập.
- [UserResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/UserResponse.java): DTO user trả về frontend.
- [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js): giữ trạng thái đăng nhập phía frontend.
- [LoginPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/LoginPage.jsx): form login.
- [RegisterPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/RegisterPage.jsx): form register.

Thứ tự nên làm nếu xây lại:

1. `Role`, `User`
2. `RoleRepository`, `UserRepository`
3. `JwtService`, `CustomUserDetailsService`, `SecurityConfig`
4. DTO request/response
5. `AuthService`
6. `AuthController`
7. `AuthContext`, `LoginPage`, `RegisterPage`

Có thể bỏ bớt service không:

- Về mặt kỹ thuật có thể nhét logic vào controller.
- Nhưng làm vậy controller sẽ quá nặng, khó test, khó tái sử dụng.

### 3. Phân tích từng hàm

#### `AuthController.register()`

- Làm gì: nhận request đăng ký và gọi service.
- Được gọi từ đâu: từ frontend `RegisterPage.jsx`.
- Gọi đến đâu: `authService.register(request)`.
- Logic: validate DTO bằng `@Valid`, trả về `ResponseEntity.ok(...)`.
- Tại sao viết vậy: controller giữ mỏng, để validation chuẩn của Spring chạy trước.

#### `AuthController.login()`

- Làm gì: nhận email/password, gọi service login, set cookie access và refresh token.
- Được gọi từ đâu: `LoginPage.jsx`.
- Gọi đến đâu: `authService.login(request)`.
- Logic: service trả `LoginResponse`, controller nhét token vào cookie rồi trả JSON.
- Tại sao viết vậy: token vừa được frontend cầm để gọi API, vừa có cookie để refresh.

#### `AuthController.refresh()`

- Làm gì: đọc `refreshToken` từ cookie, xin access token mới.
- Gọi đến đâu: `authService.refreshToken(refreshToken)`.
- Logic: nếu thiếu cookie thì 401, nếu có thì refresh và set lại access cookie.
- Cách khác: có thể gửi refresh token qua body hoặc Authorization header.

#### `AuthController.logout()`

- Làm gì: xóa cookie bằng cách set `MaxAge=0`.
- Tại sao viết vậy: logout phía server đang theo hướng stateless, chỉ cần làm token ở client biến mất.

#### `AuthService.register()`

- Làm gì: đăng ký user mới.
- Được gọi từ đâu: `AuthController.register()`.
- Gọi đến đâu: `userRepository.existsByEmail`, `roleRepository.findByRoleName`, `userRepository.save`.
- Logic:
  1. normalize email
  2. kiểm tra email trùng
  3. kiểm tra password confirm
  4. lấy role `USER`
  5. bcrypt password
  6. save user
  7. map sang `UserResponse`
- Tại sao viết vậy: business rule tập trung một chỗ.

#### `AuthService.login()`

- Làm gì: xác thực đăng nhập và sinh token.
- Được gọi từ đâu: `AuthController.login()`.
- Gọi đến đâu: `authenticationManager.authenticate`, `userRepository.findByEmail`, `jwtService.generateToken`, `jwtService.generateRefreshToken`.
- Logic:
  1. normalize email
  2. authenticate với Spring Security
  3. đọc user từ DB
  4. map sang `UserDetails`
  5. sinh token
  6. build `LoginResponse`
- Tại sao dùng `AuthenticationManager`: tận dụng cơ chế auth chuẩn của Spring.

#### `AuthService.refreshToken()`

- Làm gì: xác minh refresh token và cấp access token mới.
- Logic: extract username -> tìm user -> validate token -> build response mới.
- Điểm lưu ý: backend hiện chỉ trả token mới và refreshToken cũ, không trả lại `user`.

#### `JwtAuthenticationFilter.doFilterInternal()`

- Làm gì: lấy JWT từ Authorization header hoặc cookie `accessToken`.
- Được gọi từ đâu: chuỗi filter của Spring Security.
- Gọi đến đâu: `jwtService.extractUsername`, `userDetailsService.loadUserByUsername`, `jwtService.isTokenValid`.
- Logic: nếu token hợp lệ thì set `Authentication` vào `SecurityContextHolder`.
- Tại sao viết vậy: mọi controller sau đó chỉ cần đọc `Principal`.

#### `CustomUserDetailsService.loadUserByUsername()`

- Làm gì: nạp user cho Spring Security.
- Logic: tìm user theo email, check `isActive`, map quyền thành `ROLE_*`.
- Tại sao viết vậy: Spring Security yêu cầu `UserDetailsService`.

### 4. API endpoint

- `POST /api/auth/register`
  - Middleware/guard: đi qua CORS, filter chain, nhưng `SecurityConfig` permitAll.
  - Hàm xử lý: `AuthController.register()`
  - Vì sao dùng POST: tạo user mới, có side effect ghi DB.

- `POST /api/auth/login`
  - Middleware/guard: filter chain, permitAll.
  - Hàm xử lý: `AuthController.login()`
  - Vì sao dùng POST: có side effect sinh token, set cookie.

- `POST /api/auth/refresh-token`
  - Middleware/guard: filter chain, permitAll.
  - Hàm xử lý: `AuthController.refresh()`
  - Vì sao dùng POST: có side effect cấp access token mới.

- `POST /api/auth/logout`
  - Middleware/guard: filter chain, permitAll.
  - Hàm xử lý: `AuthController.logout()`
  - Vì sao dùng POST: thay đổi trạng thái xác thực phía client.

### 5. DTO / Request / Response

#### `RegisterRequest`

- File: [RegisterRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/RegisterRequest.java)
- Dùng cho: request đăng ký.
- Fields:
  - `fullName: String`
  - `email: String`
  - `phoneNumber: String`
  - `password: String`
  - `passwordConfirm: String`

#### `LoginRequest`

- File: [LoginRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/LoginRequest.java)
- Dùng cho: request đăng nhập.
- Fields:
  - `email: String`
  - `password: String`

#### `LoginResponse`

- File: [LoginResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/LoginResponse.java)
- Dùng cho: response login/refresh.
- Fields:
  - `token: String`
  - `refreshToken: String`
  - `user: UserResponse`

#### `UserResponse`

- File: [UserResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/UserResponse.java)
- Fields:
  - `id: Integer`
  - `fullName: String`
  - `email: String`
  - `phoneNumber: String`
  - `role: String`

Tại sao cần DTO riêng:

- Không để lộ `passwordHash`
- Không để lộ quan hệ entity và audit field
- Giữ contract API ổn định

### 6. Tương tác với Database

Khi lưu:

- Lưu vào bảng `users`
- Các field lưu:
  - `fullName`: từ request
  - `email`: từ request, normalize lowercase
  - `phoneNumber`: từ request
  - `passwordHash`: do hệ thống encode từ password
  - `isActive`: hệ thống set `true`
  - `roleId`: lấy từ bảng `roles`

Khi lấy ra:

- `existsByEmail(email)`
- `findByEmail(email)`
- `findByRoleName("USER")`

JOIN:

- Về mặt entity có quan hệ `User -> Role`
- Query hiện tại chủ yếu qua JPA relation, không viết JPQL join tay

Index:

- Chỉ nhìn từ code thì chắc chắn `users.email` có unique
- Không thấy khai báo `@Index` riêng

Map response:

- Entity `User` được map thủ công sang `UserResponse`
- Không trả thẳng entity vì entity chứa nhiều field nội bộ

## 2. Danh mục loại cây trồng

### 1. Luồng chạy tổng quan

1. Frontend [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx) gọi `GET /api/crop-types`.
2. Request vào [CropTypeController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/CropTypeController.java).
3. Controller gọi [CropTypeService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CropTypeService.java).
4. Service gọi `CropTypeRepository`.
5. Repository query bảng `CropType`.
6. Service map entity sang `CropTypeResponse` rồi trả về.

Thiết kế này đơn giản vì đây là chức năng đọc danh mục tĩnh.

### 2. Vai trò từng file

- [CropTypeController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/CropTypeController.java): endpoint lấy danh sách loại cây.
- [CropTypeService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CropTypeService.java): gọi repository và map response.
- [CropTypeRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/CropTypeRepository.java): truy vấn DB.
- [CropType.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/CropType.java): entity bảng cây trồng.
- [CropTypeResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/CropTypeResponse.java): DTO trả về frontend.
- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx): nơi dùng API này.

Thứ tự nên làm:

1. `CropType`
2. `CropTypeRepository`
3. `CropTypeResponse`
4. `CropTypeService`
5. `CropTypeController`
6. frontend gọi API

### 3. Phân tích từng hàm

#### `CropTypeController.getAvailableCropTypes()`

- Làm gì: trả danh sách crop type đang hoạt động.
- Gọi đến đâu: `cropTypeService.getAvailableCropTypes()`
- Tại sao viết vậy: controller mỏng.

#### `CropTypeService.getAvailableCropTypes()`

- Làm gì: lấy cây trồng `isActive=true` và `isDelete=false`.
- Gọi từ đâu: controller và logic chẩn đoán phía frontend.
- Gọi đến đâu: `cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse()`.
- Logic: query -> stream -> `toResponse()`.

#### `CropTypeService.toResponse()`

- Làm gì: map entity sang DTO.
- Tại sao không trả entity: entity còn `isActive`, `isDelete`, audit field.

### 4. API endpoint

- `GET /api/crop-types`
  - Middleware/guard: đi qua filter chung nhưng `permitAll`.
  - Hàm xử lý: `CropTypeController.getAvailableCropTypes()`
  - Vì sao dùng GET: chỉ đọc dữ liệu.

### 5. DTO / Request / Response

#### `CropTypeResponse`

- File: [CropTypeResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/CropTypeResponse.java)
- Fields:
  - `id: Integer`
  - `cropName: String`
  - `description: String`

### 6. Tương tác với Database

Khi lấy ra:

- Bảng: `CropType`
- Query: `findByIsActiveTrueAndIsDeleteFalse()`
- Filter:
  - `isActive = true`
  - `isDelete = false`

Map:

- `CropType` -> `CropTypeResponse`

JOIN:

- Không có JOIN trong chức năng này.

## 3. Quản lý khu vực canh tác + gợi ý xác nhận GPS

### 1. Luồng chạy tổng quan

#### Luồng tạo thủ công

1. Frontend [AddFarmingAreaModal.jsx](/D:/AgriAI/agriai_frontend/src/components/AddFarmingAreaModal.jsx) gửi `POST /api/areas`.
2. Request đi qua security, phải có JWT hợp lệ.
3. [AreaInforController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AreaInforController.java) lấy `Principal`.
4. Controller gọi [AreaInforService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AreaInforService.java).
5. Service tìm user theo email.
6. Service tạo `AreaInfor` và lưu qua `AreaInforRepository`.
7. Response trả về `AreaInforResponse`.

#### Luồng lấy danh sách

1. Frontend [FarmingAreaPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx) gọi `GET /api/areas`.
2. Controller lấy email từ `Principal`.
3. Service tìm user, rồi query `AreaInforRepository.findByUserIdAndIsDeleteFalse`.
4. Map sang list `AreaInforResponse`.

#### Luồng confirm gợi ý GPS

1. Sau một lần chẩn đoán có GPS, [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java) chạy nền `GeocodingService.processGeocoding(...)`.
2. [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java) gọi `NominatimPort`.
3. [NominatimAdapter.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java) gọi API Nominatim reverse geocode.
4. Nếu địa chỉ chưa tồn tại thì lưu `AreaInfor` mới với `confirmed=false`.
5. Service đẩy WebSocket message về user qua `/user/queue/location-confirm`.
6. Frontend [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx) nhận message và hiện toast.
7. User vào trang khu vực canh tác để confirm qua `PUT /api/areas/{id}/confirm`.

Lý do thiết kế:

- CRUD tay và geocoding tự động là hai luồng khác nhau nên được tách service.
- Geocoding chạy nền để request chẩn đoán không bị chậm.
- WebSocket dùng để báo realtime thay vì bắt frontend phải poll.

### 2. Vai trò từng file

- [AreaInforController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AreaInforController.java): endpoint khu vực canh tác.
- [AreaInforService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AreaInforService.java): nghiệp vụ tạo, lấy list, confirm.
- [AreaInforRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AreaInforRepository.java): query DB.
- [AreaInfor.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AreaInfor.java): entity khu vực.
- [AreaInforRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforRequest.java): request tạo mới.
- [AreaInforConfirmRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforConfirmRequest.java): request confirm.
- [AreaInforResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/AreaInforResponse.java): response.
- [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java): geocode và push thông báo.
- [NominatimAdapter.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java): adapter gọi API ngoài.
- [NominatimPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/NominatimPort.java): interface.
- [NominatimResult.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/NominatimResult.java): kết quả geocode.
- [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java): payload websocket.
- [FarmingAreaPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx): trang list khu vực.
- [AddFarmingAreaModal.jsx](/D:/AgriAI/agriai_frontend/src/components/AddFarmingAreaModal.jsx): form thêm khu vực.
- [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx): nghe thông báo realtime.

Thứ tự nên làm:

1. `AreaInfor`
2. `AreaInforRepository`
3. DTO request/response
4. `AreaInforService`
5. `AreaInforController`
6. `NominatimPort` -> `NominatimAdapter` -> `GeocodingService`
7. WebSocket listener frontend
8. page/modal frontend

### 3. Phân tích từng hàm

#### `AreaInforController.create()`

- Làm gì: tạo khu vực canh tác thủ công.
- Được gọi từ đâu: `AddFarmingAreaModal.jsx`.
- Gọi đến đâu: `areaInforService.create(principal.getName(), request)`.

#### `AreaInforController.getByUser()`

- Làm gì: lấy danh sách khu vực của user hiện tại.
- Gọi đến đâu: `areaInforService.getByUser(principal.getName())`.

#### `AreaInforController.confirm()`

- Làm gì: xác nhận khu vực được hệ thống gợi ý.
- Gọi đến đâu: `areaInforService.confirm(...)`.

#### `AreaInforService.create()`

- Làm gì: tìm user, tạo entity `AreaInfor`, lưu DB.
- Gọi từ đâu: `create()` controller.
- Gọi đến đâu: `userRepository.findByEmail`, `areaInforRepository.save`.
- Logic:
  1. tìm user theo email
  2. build `AreaInfor`
  3. save
  4. map response

#### `AreaInforService.getByUser()`

- Làm gì: lấy list khu vực theo user.
- Gọi đến đâu: `findByUserIdAndIsDeleteFalse`.
- Tại sao query theo `userId`: đây là ownership filter chính.

#### `AreaInforService.confirm()`

- Làm gì: confirm khu vực gợi ý.
- Logic:
  1. tìm `AreaInfor` theo id
  2. kiểm tra user hiện tại có phải chủ sở hữu không
  3. set `confirmed=true`
  4. nếu request có address thì cập nhật address
  5. save lại

#### `GeocodingService.processGeocoding()`

- Làm gì: reverse geocode từ lat/lon sau chẩn đoán.
- Được gọi từ đâu: `DiagnoseService` bằng `CompletableFuture.runAsync`.
- Gọi đến đâu: `nominatimPort.reverseGeocode`, `areaInforRepository.existsByUserIdAndAddress`, `areaInforRepository.save`, `simpMessagingTemplate.convertAndSendToUser`.
- Logic:
  1. gọi Nominatim
  2. nếu fail thì dừng
  3. nếu địa chỉ đã tồn tại thì dừng
  4. lưu `AreaInfor` mới với `confirmed=false`
  5. gửi notification realtime
- Tại sao viết vậy: tránh tạo trùng và tránh block request chẩn đoán chính.

#### `NominatimAdapter.reverseGeocode()`

- Làm gì: gọi API OpenStreetMap Nominatim.
- Logic:
  1. build GET request có `User-Agent`
  2. parse JSON
  3. ghép `shortAddress`
  4. trả `NominatimResult`
- Có thể viết cách khác: dùng WebClient reactive, nhưng với codebase hiện tại `RestTemplate` là đủ.

### 4. API endpoint

- `POST /api/areas`
  - Middleware/guard: JWT filter, endpoint yêu cầu authenticated.
  - Hàm xử lý: `AreaInforController.create()`
  - Vì sao dùng POST: tạo mới dữ liệu.

- `GET /api/areas`
  - Middleware/guard: authenticated.
  - Hàm xử lý: `AreaInforController.getByUser()`
  - Vì sao dùng GET: chỉ đọc dữ liệu.

- `PUT /api/areas/{id}/confirm`
  - Middleware/guard: authenticated.
  - Hàm xử lý: `AreaInforController.confirm()`
  - Vì sao dùng PUT: update trạng thái xác nhận của resource.

Ngoài ra có endpoint WebSocket:

- `/ws`
  - Dùng cho STOMP/SockJS realtime notification
  - Auth bằng JWT trong `WebsocketConfig`

### 5. DTO / Request / Response

#### `AreaInforRequest`

- File: [AreaInforRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforRequest.java)
- Fields:
  - `areaName: String`
  - `province: String`
  - `address: String`
  - `area: Double`
  - `description: String`

#### `AreaInforConfirmRequest`

- File: [AreaInforConfirmRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforConfirmRequest.java)
- Fields:
  - `address: String`

#### `AreaInforResponse`

- File: [AreaInforResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/AreaInforResponse.java)
- Fields:
  - `id: Integer`
  - `areaName: String`
  - `province: String`
  - `address: String`
  - `area: Double`
  - `description: String`

#### `LocationConfirmPayload`

- File: [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- Fields:
  - `areaId: Integer`
  - `displayName: String`
  - `message: String`
  - `redirectPath: String`

Tại sao không dùng entity:

- Entity có `user`, `latitude`, `longitude`, `confirmed`, audit field.
- Payload websocket là dữ liệu tổng hợp, không phải một row DB thuần.

### 6. Tương tác với Database

Khi lưu thủ công:

- Bảng: `AreaInfor`
- Field:
  - `userId`: lấy từ user hiện tại
  - `areaName`: từ request
  - `province`: từ request
  - `address`: từ request
  - `area`: từ request
  - `description`: từ request

Khi lưu tự động qua geocoding:

- Bảng: `AreaInfor`
- Field:
  - `userId`: từ user của lần chẩn đoán
  - `areaName`: hệ thống set `"Khu vực canh tác mới"`
  - `latitude`, `longitude`: từ GPS request
  - `address`: từ Nominatim
  - `province`: từ Nominatim
  - `confirmed`: `false`

Khi lấy ra:

- Query: `findByUserIdAndIsDeleteFalse(userId)`
- Không có JOIN explicit
- Có dùng relation `area.getUser()` khi check quyền confirm

Chống trùng:

- `existsByUserIdAndAddress(userId, address)`

Map:

- `AreaInfor` -> `AreaInforResponse`

Lưu ý quan trọng:

- Frontend hiện gửi field `areaSize`, nhưng backend DTO đang cần `area`.
- UI có hiển thị `areaCode` nhưng response backend không trả field này.

## 4. Chẩn đoán AI bệnh cây

### 1. Luồng chạy tổng quan

Đây là chức năng lõi của hệ thống.

Luồng đầy đủ:

1. Frontend [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx) chọn ảnh, loại cây, GPS rồi gửi `POST /api/diagnosis` với `multipart/form-data`.
2. Request vào [DiagnoseController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java).
3. Controller lấy `Principal` nếu có, convert thành email, gọi [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java).
4. `DiagnoseService` gọi [DiagnosisValidationService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java) để validate ảnh, crop type, AI model.
5. Service tạo trước một row `DiagnoseHistory` với trạng thái `PENDING`.
6. Gọi [DiagnosisAttachmentService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAttachmentService.java) để upload ảnh lên Cloudinary qua `ImageStoragePort`/[CloudinaryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CloudinaryService.java), đồng thời lưu bảng `Attachment`.
7. Sau khi có URL ảnh:
   - Gọi `VisionDetectionPort`/[VisionAIService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java) để gửi ảnh sang YOLO FastAPI.
   - Nếu có GPS thì gọi `WeatherPort`/[WeatherApiService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherApiService.java) lấy thời tiết hiện tại.
   - Hai việc này chạy song song bằng `CompletableFuture`.
8. Kết quả vision được phân tích trong `analyzeVisionResults()`:
   - lọc healthy label
   - lọc confidence thấp
   - group nhãn trùng bằng max confidence
   - map label AI sang bệnh DB bằng [DiseaseMapper.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapper.java)
9. Nếu có bệnh:
   - [RuleEngineService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java) lấy phác đồ điều trị
   - [TreatmentSelector.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentSelector.java) chọn phác đồ chính cho từng bệnh
   - [DrugInteractionChecker.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DrugInteractionChecker.java) kiểm tra xung đột hoạt chất
   - [WeatherAlertEvaluator.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherAlertEvaluator.java) so thời tiết thực tế với điều kiện phun
   - [SprayProgramBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/SprayProgramBuilder.java) dựng chương trình phun
10. [DiagnoseResponseBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java) dựng `DiagnoseResponse`.
11. [LLMService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/LLMService.java) sinh `userGuidance` bằng Gemini hoặc fallback text.
12. [DiagnoseHistoryPersistenceService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java):
   - update `DiagnoseHistory` thành `COMPLETED`
   - lưu chi tiết snapshot vào `DiagnoseHistoryDetail`
13. Nếu có GPS:
   - chạy nền [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java)
   - reverse geocode lat/lon
   - gợi ý vùng canh tác mới qua WebSocket
14. Controller trả `DiagnoseResponse` về frontend.

Lý do thiết kế:

- Chức năng chẩn đoán có rất nhiều bước độc lập.
- Tách nhỏ service giúp test dễ, thay đổi tích hợp ngoài ít ảnh hưởng.
- Dùng port cho Cloudinary, vision AI, weather, LLM để giảm coupling.
- Lưu snapshot vào DB để lần sau xem lịch sử không bị thay đổi theo master data mới.

### 2. Vai trò từng file

#### Controller / DTO chính

- [DiagnoseController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseController.java)
- [DiagnoseRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseRequest.java)
- [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java)

#### Điều phối / validate / response build

- [DiagnoseService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java)
- [DiagnosisValidationService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisValidationService.java)
- [DiagnoseResponseBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseResponseBuilder.java)
- [DiagnosisAnalysis.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAnalysis.java)
- [DetectedDiseaseMatch.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DetectedDiseaseMatch.java)

#### Upload ảnh

- [DiagnosisAttachmentService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnosisAttachmentService.java)
- [CloudinaryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/CloudinaryService.java)
- [CloudinaryConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/config/CloudinaryConfig.java)
- [ImageStoragePort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/ImageStoragePort.java)

#### Vision AI / Weather / Guidance

- [VisionAIService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/VisionAIService.java)
- [VisionDetectionPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/VisionDetectionPort.java)
- [WeatherApiService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherApiService.java)
- [WeatherPort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/WeatherPort.java)
- [LLMService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/LLMService.java)
- [GuidancePort.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/port/GuidancePort.java)

#### Map bệnh / rule engine

- [DiseaseMapper.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapper.java)
- [RuleEngineService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/RuleEngineService.java)
- [TreatmentSelector.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentSelector.java)
- [DrugInteractionChecker.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DrugInteractionChecker.java)
- [WeatherAlertEvaluator.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherAlertEvaluator.java)
- [SprayProgramBuilder.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/SprayProgramBuilder.java)

#### Persistence lịch sử

- [DiagnoseHistoryPersistenceService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java)
- [DiagnosisDetailSnapshotDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiagnosisDetailSnapshotDTO.java)

#### DTO con

- [VisionResultDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/VisionResultDTO.java)
- [DiseaseResultDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiseaseResultDTO.java)
- [TreatmentDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentDTO.java)
- [TreatmentProgramDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentProgramDTO.java)
- [InteractionWarningDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/InteractionWarningDTO.java)
- [WeatherDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherDTO.java)
- [WeatherAlertDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/WeatherAlertDTO.java)

#### Entity / Repository liên quan

- [DiagnoseHistory.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistory.java)
- [DiagnoseHistoryDetail.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseHistoryDetail.java)
- [Disease.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Disease.java)
- [TreatmentPlan.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentPlan.java)
- [TreatmentWeatherCondition.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/TreatmentWeatherCondition.java)
- [DrugInteraction.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DrugInteraction.java)
- [Ingredient.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Ingredient.java)
- [AIModel.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/AIModel.java)
- [Attachment.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Attachment.java)
- [DiagnoseHistoryRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java)
- [DiagnoseHistoryDetailRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryDetailRepository.java)
- [DiseaseRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseRepository.java)
- [TreatmentPlanRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentPlanRepository.java)
- [TreatmentWeatherConditionRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/TreatmentWeatherConditionRepository.java)
- [DrugInteractionRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DrugInteractionRepository.java)
- [AIModelRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AIModelRepository.java)
- [AttachmentRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/AttachmentRepository.java)

#### Frontend hiển thị

- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- [DiagnoseUploadPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseUploadPanel.jsx)
- [DiagnoseWeatherCards.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseWeatherCards.jsx)
- [DiagnoseResultPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseResultPanel.jsx)
- [DiagnoseSprayProgramsPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseSprayProgramsPanel.jsx)
- [DiagnoseInteractionWarnings.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseInteractionWarnings.jsx)
- [DiagnoseWeatherAlertsPanel.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseWeatherAlertsPanel.jsx)
- [DiagnoseCultivationMeasures.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseCultivationMeasures.jsx)
- [DiagnoseAIGuidance.jsx](/D:/AgriAI/agriai_frontend/src/components/diagnosis/DiagnoseAIGuidance.jsx)

Thứ tự nên làm nếu tự build chức năng này từ đầu:

1. Entity nền: `CropType`, `Disease`, `TreatmentPlan`, `Ingredient`, `DrugInteraction`, `TreatmentWeatherCondition`, `AIModel`, `DiagnoseHistory`, `DiagnoseHistoryDetail`, `Attachment`
2. Repository
3. DTO request/response
4. Port interface
5. Adapter/service tích hợp ngoài
6. Service helper: validation, attachment, mapper, selector, checker, evaluator, builder
7. Orchestrator `DiagnoseService`
8. Controller
9. Frontend page và component

### 3. Phân tích từng hàm

#### `DiagnoseController.diagnose()`

- Làm gì: nhận multipart request chẩn đoán.
- Được gọi từ đâu: `DiagnosisPage.jsx`.
- Gọi đến đâu: `diagnoseService.diagnose(email, request)`.
- Tại sao dùng `@ModelAttribute`: vì request là `multipart/form-data`, không phải JSON body.

#### `DiagnoseService.diagnose()`

- Làm gì: điều phối toàn bộ luồng chẩn đoán.
- Được gọi từ đâu: controller.
- Gọi đến đâu:
  - `diagnosisValidationService.validate`
  - `diagnoseHistoryRepository.save`
  - `diagnosisAttachmentService.uploadAndSave`
  - `visionDetectionPort.detect`
  - `weatherPort.getCurrentWeather`
  - `ruleEngineService.process`
  - `diagnoseResponseBuilder.buildResponse`
  - `guidancePort.generateGuidance`
  - `historyPersistenceService.updateHistory`
  - `historyPersistenceService.saveDetails`
  - `geocodingService.processGeocoding`
- Logic:
  1. validate request
  2. tạo `DiagnoseHistory` trạng thái `PENDING`
  3. upload ảnh và lưu attachment
  4. chạy vision AI và weather song song
  5. phân tích vision result
  6. nếu có bệnh thì chạy rule engine
  7. build response
  8. sinh guidance text
  9. cập nhật lịch sử thành `COMPLETED`
  10. lưu snapshot chi tiết
  11. nếu có GPS thì chạy geocoding nền
  12. return response
- Tại sao viết vậy: đây là orchestrator, không nên nhét logic kỹ thuật chi tiết vào controller.

#### `DiagnoseService.analyzeVisionResults()`

- Làm gì: chuyển danh sách detection thô thành `DiagnosisAnalysis`.
- Logic:
  1. chuẩn hóa label
  2. check có nhãn healthy không
  3. bỏ nhãn healthy khỏi flow bệnh
  4. bỏ detection confidence thấp hơn `0.4`
  5. group nhãn trùng bằng max confidence
  6. map từng label sang `Disease`
  7. kết luận `healthy`, `unknown`, hoặc có bệnh
- Tại sao viết vậy:
  - tránh một bệnh bị lặp nhiều lần
  - tách cây khỏe ra khỏi trường hợp unknown

#### `DiagnoseService.toDetectedDiseaseMatch()`

- Làm gì: map 1 `VisionResultDTO` sang `Disease` trong DB.
- Gọi đến đâu: `diseaseMapper.findDisease`.

#### `DiagnosisValidationService.validate()`

- Làm gì: validate ảnh, crop type, AI model, user.
- Được gọi từ đâu: `DiagnoseService`.
- Logic:
  1. check ảnh tồn tại và đúng content type
  2. check `cropTypeId`
  3. tìm `CropType`
  4. check cây đang active
  5. tìm `AIModel` active theo crop type, nếu không có thì fallback model active đầu tiên
  6. nếu có email thì tìm user
  7. return `DiagnosisContext`
- Cách khác: có thể nhét vào `DiagnoseService`, nhưng tách ra giúp test riêng.

#### `DiagnosisValidationService.validateImage()`

- Làm gì: check file upload có hợp lệ hay không.
- Vì sao cần riêng: ảnh là điều kiện đầu vào quan trọng nhất.

#### `DiagnosisAttachmentService.uploadAndSave()`

- Làm gì: upload file lên cloud rồi lưu metadata attachment vào DB.
- Gọi đến đâu: `imageStoragePort.upload`, `attachmentRepository.save`.
- Tại sao viết vậy: tách upload file khỏi orchestrator.

#### `CloudinaryService.upload()`

- Làm gì: upload bytes ảnh lên Cloudinary.
- Gọi từ đâu: `DiagnosisAttachmentService`.
- Trả gì: URL ảnh public.

#### `VisionAIService.detect()`

- Làm gì: tải lại ảnh từ Cloudinary URL, gửi sang YOLO FastAPI, parse danh sách detection.
- Gọi từ đâu: `DiagnoseService`.
- Logic:
  1. download ảnh từ URL
  2. build multipart request
  3. call `predictUrl`
  4. parse JSON `detections`
  5. map sang list `VisionResultDTO`
- Tại sao làm vòng qua URL:
  - backend đang upload ảnh lên Cloudinary trước
  - vision service hiện nhận file, không nhận URL

#### `WeatherApiService.getCurrentWeather()`

- Làm gì: gọi OpenWeatherMap bằng lat/lon.
- Logic:
  1. check lat/lon và API key
  2. gọi API
  3. lấy `temp`, `humidity`, `rain.1h`
  4. build `WeatherDTO`
- Tại sao viết vậy: gói gọn weather integration trong 1 port.

#### `DiseaseMapper.findDisease()`

- Làm gì: map label AI sang disease DB.
- Logic fallback 3 mức:
  1. `diseaseCode`
  2. `diseaseNameEn`
  3. `diseaseName`
- Có cả biến thể khoảng trắng và underscore.
- Tại sao viết vậy: output của model có thể khác nhau về format label.

#### `DiseaseMapper.groupByMaxConfidence()`

- Làm gì: nếu nhiều detection cùng label thì giữ detection confidence cao nhất.

#### `RuleEngineService.process()`

- Làm gì: entry point của rule engine.
- Gọi đến đâu:
  - `treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse`
  - `treatmentSelector.selectPrimaryPlan`
  - `drugInteractionChecker.buildInteractionWarnings`
  - `weatherAlertEvaluator.buildWeatherAlerts`
  - `sprayProgramBuilder.buildPrograms`
  - `sprayProgramBuilder.deriveStrategy`
- Logic:
  1. load plan theo từng bệnh
  2. chọn 1 plan chính cho mỗi bệnh
  3. build interaction warning
  4. build weather alert
  5. build spray program
  6. flatten treatment
  7. return `RuleEngineResult`
- Tại sao viết vậy: một lớp điều phối ở tầng rule engine, giống `DiagnoseService` nhưng chỉ cho nghiệp vụ điều trị.

#### `TreatmentSelector.selectPrimaryPlan()`

- Làm gì: chọn phác đồ tốt nhất cho một bệnh.
- Luật ưu tiên:
  1. `isRequired=true`
  2. plan có ingredient
  3. `id` nhỏ hơn
- Tại sao viết vậy: đảm bảo rule chọn plan ổn định và deterministic.

#### `DrugInteractionChecker.buildInteractionWarnings()`

- Làm gì: lấy tất cả hoạt chất của các plan đã chọn và tìm xung đột.
- Logic:
  1. gom `ingredientIds`
  2. nếu ít hơn 2 thì return rỗng
  3. query DB `findInteractionsBetweenIngredients`
  4. map sang `InteractionWarningDTO`
- Tại sao viết vậy: chỉ cần check khi có từ 2 hoạt chất trở lên.

#### `DrugInteractionChecker.canBeGrouped()`

- Làm gì: kiểm tra plan ứng viên có thể phun chung với group hiện tại không.
- Dùng trong: `SprayProgramBuilder`.

#### `WeatherAlertEvaluator.buildWeatherAlerts()`

- Làm gì: so thời tiết thực tế với điều kiện phun của từng treatment plan.
- Logic:
  1. load conditions theo danh sách plan
  2. lấy giá trị weather thực tế theo `WeatherFactor`
  3. check vi phạm bằng operator
  4. build `WeatherAlertDTO`
- Tại sao viết vậy: rule thời tiết không nên nằm lẫn trong builder hay service lớn.

#### `SprayProgramBuilder.buildPrograms()`

- Làm gì: nhóm plan thành các đợt phun.
- Logic:
  1. duyệt từng plan
  2. cố add vào group hiện có nếu không xung đột
  3. nếu không add được thì tạo group mới
  4. với từng group, build `TreatmentDTO`
  5. tính `mixAllowed`, `blocked`, `intervalDays`, `reasons`, `status`
  6. build `TreatmentProgramDTO`
- Tại sao viết vậy: xử lý conflict tách khỏi database và UI, giữ ở layer nghiệp vụ.

#### `SprayProgramBuilder.deriveStrategy()`

- Làm gì: chốt chiến lược tổng thể:
  - `NO_TREATMENT`
  - `SINGLE_DISEASE_OR_SAFE_MIX`
  - `MIX_WITH_WARNING`
  - `SEPARATE_SPRAY`

#### `DiagnoseResponseBuilder.buildResponse()`

- Làm gì: dựng `DiagnoseResponse` cuối cùng.
- Logic:
  1. xác định `diagnosisType`
  2. convert detected disease sang `DiseaseResultDTO`
  3. nhét weather, treatments, sprayPrograms, warnings, flags vào response
- Tại sao viết riêng: để `DiagnoseService` không ôm logic map DTO.

#### `DiagnoseResponseBuilder.toDiseaseResult()`

- Làm gì: map `DetectedDiseaseMatch` sang `DiseaseResultDTO`.
- Điểm đáng chú ý: nếu có `diseaseNameEn` thì trả dạng `English (Vietnamese)`.

#### `LLMService.generateGuidance()`

- Làm gì: tạo hướng dẫn canh tác.
- Logic:
  1. nếu không có API key thì fallback
  2. build prompt từ response
  3. gọi Gemini
  4. nếu lỗi thì fallback
- Tại sao viết vậy: hệ thống không chết nếu LLM fail.

#### `LLMService.buildPrompt()`

- Làm gì: ghép prompt chi tiết từ diseases, treatments, interaction, weather.
- Tại sao không gửi raw object: LLM cần prompt văn bản có cấu trúc.

#### `DiagnoseHistoryPersistenceService.updateHistory()`

- Làm gì: cập nhật `DiagnoseHistory` sau khi chẩn đoán xong.
- Field update:
  - `originalImageUrl`
  - `weatherData`
  - `status`

#### `DiagnoseHistoryPersistenceService.saveDetails()`

- Làm gì: lưu snapshot chi tiết kết quả vào `DiagnoseHistoryDetail`.
- Logic:
  - nếu không có bệnh:
    - lưu 1 row detail không gắn disease
  - nếu có bệnh:
    - mỗi disease một row detail
    - mỗi row giữ treatment/program liên quan disease đó
- Tại sao viết vậy:
  - giúp lịch sử có thể replay lại đúng snapshot lúc đó
  - không phụ thuộc dữ liệu master có đổi sau này hay không

### 4. API endpoint

- `POST /api/diagnosis`
  - Method: POST
  - Content-Type: `multipart/form-data`
  - Middleware/guard:
    - CORS
    - `JwtAuthenticationFilter`
    - endpoint này `permitAll`
  - Hàm xử lý: `DiagnoseController.diagnose()`
  - Vì sao dùng POST:
    - có upload file
    - có side effect lưu lịch sử, attachment
    - gọi AI và dịch vụ ngoài

### 5. DTO / Request / Response

#### `DiagnoseRequest`

- File: [DiagnoseRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseRequest.java)
- Fields:
  - `image: MultipartFile`
  - `cropTypeId: Integer`
  - `latitude: Double`
  - `longitude: Double`

#### `DiagnoseResponse`

- File: [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java)
- Fields:
  - `id: Integer`
  - `originalImageUrl: String`
  - `annotatedImageUrl: String`
  - `weather: WeatherDTO`
  - `diseases: List<DiseaseResultDTO>`
  - `warnings: List<String>`
  - `treatments: List<TreatmentDTO>`
  - `sprayPrograms: List<TreatmentProgramDTO>`
  - `interactionWarnings: List<InteractionWarningDTO>`
  - `weatherAlerts: List<WeatherAlertDTO>`
  - `userGuidance: String`
  - `isHealthy: Boolean`
  - `gpsUsed: Boolean`
  - `diagnosisType: String`

#### DTO con

- `VisionResultDTO(label, confidence, severity)`
- `DiseaseResultDTO(diseaseId, diseaseCode, diseaseName, confidence, severity, boxX, boxY, boxWidth, boxHeight)`
- `TreatmentDTO(...)`
- `TreatmentProgramDTO(...)`
- `InteractionWarningDTO(...)`
- `WeatherDTO(temperature, humidity, rainfall)`
- `WeatherAlertDTO(...)`
- `DiagnosisDetailSnapshotDTO(diagnosisType, treatments, sprayPrograms, interactionWarnings, weatherAlerts, warnings)`

Tại sao cần DTO riêng:

- Response chẩn đoán là dữ liệu tổng hợp từ nhiều bảng + AI + thời tiết + rule engine.
- Không có một entity đơn lẻ nào đại diện được response này.
- Tránh trả raw JPA entity có lazy relation.

### 6. Tương tác với Database

#### Khi lưu

1. Bảng `DiagnoseHistory`
   - `userId`: từ user hiện tại nếu có
   - `croptypeId`: từ request
   - `latitude`, `longitude`: từ request
   - `status`: hệ thống set `PENDING`, sau đó `COMPLETED` hoặc `FAILED`
   - `originalimageURL`: từ Cloudinary
   - `weatherData`: hệ thống serialize từ `WeatherDTO`

2. Bảng `Attachment`
   - `referenceType = "DiagnoseHistory"`
   - `referenceId = historyId`
   - `fileName`: tên file upload
   - `fileUrl`: URL Cloudinary
   - `fileType`, `mimeType`, `fileSize`, `category`

3. Bảng `DiagnoseHistoryDetail`
   - `diagnosehistoryId`: từ history
   - `diseaseId`: từ disease match, hoặc null nếu healthy/unknown
   - `confidenceScore`: từ vision result
   - `severityLevel`: từ severity
   - `riskWarning`: warning đầu tiên nếu có
   - `treatmentData`: JSON snapshot
   - `cultivationData`: guidance text

4. Có thể phát sinh bảng `AreaInfor` từ geocoding nền nếu có GPS.

#### Khi lấy dữ liệu để chẩn đoán

- `CropTypeRepository.findById(cropTypeId)`
- `AIModelRepository.findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(cropTypeId)`
- fallback `AIModelRepository.findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc()`
- `DiseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(...)`
- `DiseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(...)`
- `DiseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse(...)`
- `TreatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(diseaseId)`
- `TreatmentWeatherConditionRepository.findByTreatmentplanIdInAndIsDeleteFalse(planIds)`
- `DrugInteractionRepository.findInteractionsBetweenIngredients(ingredientIds)`

#### Query / filter / sort

- Disease map AI:
  - query nhiều lần theo label fallback
- Treatment:
  - filter theo `diseaseId`, `isDelete=false`
- Weather condition:
  - filter theo `treatmentId in (...)`, `isDelete=false`
- Drug interaction:
  - query giữa các ingredient trong list

#### JOIN

- `DrugInteraction` join `ingredientA`, `ingredientB`
- `TreatmentPlan` join `Disease`, `Ingredient`
- `DiagnoseHistoryDetail` join `Disease`
- Nhiều chỗ rely vào JPA relation hơn là viết explicit join JPQL

#### Index

- Từ code chỉ chắc chắn có PK mặc định.
- Không thấy migration hay `@Index` để khẳng định index cho `userId`, `diseaseId`, `croptypeId`, `treatmentId`.
- Các query này nên có index ở DB, nhưng từ code hiện tại không xác nhận được chắc chắn.

#### Map database -> response

- `DiagnoseHistory` + `DiagnoseHistoryDetail` không map trực tiếp sang response tại thời điểm chẩn đoán.
- Response được build từ:
  - vision results
  - weather API
  - disease master
  - treatment master
  - drug interaction
  - weather condition
  - guidance text

Lưu ý:

- `annotatedImageUrl` có trong DTO nhưng hiện chưa được set ở flow backend.

## 5. Lịch sử chẩn đoán

### 1. Luồng chạy tổng quan

#### Luồng list lịch sử

1. Frontend [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx) gọi `GET /api/diagnosis/history?page=&size=`.
2. Request vào [DiagnoseHistoryController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java).
3. Controller lấy email từ `Principal`.
4. Controller gọi [DiagnoseHistoryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java).
5. Service tìm userId theo email.
6. Query `DiagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc`.
7. Với mỗi history, service query `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse`.
8. Service rút ra bệnh đầu tiên, severity, confidence, diagnosisType và build `DiagnoseHistoryResponse`.

#### Luồng xem chi tiết 1 lần chẩn đoán

1. Frontend [DiagnosisHistoryDetailPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx) gọi `GET /api/diagnosis/{id}`.
2. Controller gọi `diagnoseHistoryService.getDetail(email, id)`.
3. Service kiểm tra ownership bằng `findByIdAndUserIdAndIsDeleteFalse`.
4. Service load toàn bộ `DiagnoseHistoryDetail`.
5. Service parse JSON snapshot trong `treatmentData`.
6. Service rebuild lại `DiagnoseResponse` gần giống response lúc chẩn đoán xong.
7. Trả về frontend để render chi tiết.

Lý do thiết kế:

- List page chỉ cần summary nên query nhẹ hơn.
- Detail page cần replay snapshot cũ, nên lấy từ JSON snapshot thay vì phụ thuộc hoàn toàn vào dữ liệu master hiện tại.

### 2. Vai trò từng file

- [DiagnoseHistoryController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseHistoryController.java): endpoint list/detail lịch sử.
- [DiagnoseHistoryService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java): nghiệp vụ đọc và rebuild lịch sử.
- [DiagnoseHistoryRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java): query bảng history.
- [DiagnoseHistoryDetailRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryDetailRepository.java): query bảng detail.
- [DiagnoseHistoryResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseHistoryResponse.java): DTO summary list.
- [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java): DTO dùng lại cho detail page.
- [DiagnosisDetailSnapshotDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/DiagnosisDetailSnapshotDTO.java): dữ liệu snapshot được parse từ JSON.
- [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx): trang list lịch sử.
- [DiagnosisHistoryDetailPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx): trang detail lịch sử.

### 3. Phân tích từng hàm

#### `DiagnoseHistoryController.getHistory()`

- Làm gì: trả page lịch sử chẩn đoán của user.
- Gọi đến đâu: `diagnoseHistoryService.getHistory(email, pageable)`.

#### `DiagnoseHistoryController.getDetail()`

- Làm gì: trả detail một lần chẩn đoán.
- Gọi đến đâu: `diagnoseHistoryService.getDetail(email, id)`.

#### `DiagnoseHistoryService.getHistory()`

- Làm gì: dựng danh sách summary cho page lịch sử.
- Logic:
  1. tìm `userId`
  2. query page `DiagnoseHistory`
  3. với từng history:
     - load detail
     - parse snapshot
     - xác định diseaseName, confidence, severity, diagnosisType
  4. build `DiagnoseHistoryResponse`
- Tại sao không trả thẳng `DiagnoseHistory`:
  - list page cần diseaseName, confidence, severity, diagnosisType, cropName đã flatten

#### `DiagnoseHistoryService.getDetail()`

- Làm gì: rebuild full detail response từ dữ liệu lưu DB.
- Logic:
  1. check email hợp lệ
  2. tìm `userId`
  3. query history theo `id + userId`
  4. load all details
  5. duyệt từng detail:
     - build `DiseaseResultDTO`
     - parse snapshot JSON
     - add treatments, programs, interactionWarnings, weatherAlerts, warnings
     - lấy guidance
  6. deduplicate warning/program/interaction/weather alert
  7. build `DiagnoseResponse`
- Tại sao viết vậy:
  - response detail cần gần giống response realtime ban đầu
  - dữ liệu treatment/program đã được snapshot hóa để chống drift

#### `DiagnoseHistoryService.parseSnapshot()`

- Làm gì: parse JSON `treatmentData` thành `DiagnosisDetailSnapshotDTO`.

#### `DiagnoseHistoryService.parseWeatherJson()`

- Làm gì: parse `weatherData` JSON trong `DiagnoseHistory`.

#### `interactionWarningKey()` và `weatherAlertKey()`

- Làm gì: tạo key để khử trùng lặp khi merge nhiều row detail.

### 4. API endpoint

- `GET /api/diagnosis/history`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseHistoryController.getHistory()`
  - Vì sao dùng GET: truy vấn danh sách lịch sử.

- `GET /api/diagnosis/{id}`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseHistoryController.getDetail()`
  - Vì sao dùng GET: truy vấn chi tiết.

### 5. DTO / Request / Response

#### `DiagnoseHistoryResponse`

- File: [DiagnoseHistoryResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseHistoryResponse.java)
- Fields:
  - `id: Integer`
  - `createdAt: LocalDateTime`
  - `originalImageUrl: String`
  - `cropName: String`
  - `diseaseName: String`
  - `confidence: Double`
  - `severity: String`
  - `status: String`
  - `diagnosisType: String`
  - `latitude: Double`
  - `longitude: Double`

#### `DiagnoseResponse`

- Reuse lại DTO của chức năng chẩn đoán cho page detail.

Tại sao cần DTO riêng:

- `DiagnoseHistory` không chứa sẵn diseaseName, confidence, severity ở cấp summary.
- Data phải được tổng hợp từ `DiagnoseHistoryDetail` và JSON snapshot.

### 6. Tương tác với Database

Khi lấy list:

- `UserRepository.findByEmail(email)`
- `DiagnoseHistoryRepository.findByUserIdAndIsDeleteFalseOrderByCreatedAtDesc(userId, pageable)`
- `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse(historyId)`

Khi lấy detail:

- `DiagnoseHistoryRepository.findByIdAndUserIdAndIsDeleteFalse(id, userId)`
- `DiagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse(id)`

JOIN / relation:

- `DiagnoseHistory` quan hệ với `CropType`
- `DiagnoseHistoryDetail` quan hệ với `Disease`
- Nhưng nhiều dữ liệu được restore từ JSON snapshot, không query join trực tiếp hết

Sort:

- order by `createdAt desc`

Map:

- row history + list detail + snapshot JSON -> DTO summary/detail

## 6. Đánh giá kết quả chẩn đoán

### 1. Luồng chạy tổng quan

1. Frontend [DiagnosisRatingModal.jsx](/D:/AgriAI/agriai_frontend/src/components/DiagnosisRatingModal.jsx) gửi `POST /api/reviews`.
2. Request vào [DiagnoseReviewController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseReviewController.java).
3. Controller lấy email từ `Principal`.
4. Gọi [DiagnoseReviewService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java).
5. Service:
   - check đăng nhập
   - load `DiagnoseHistory`
   - kiểm tra ownership
   - check đã review chưa
   - load `User`
   - save `DiagnoseReview`
6. Trả `DiagnoseReviewResponse`.

Luồng đọc review:

1. Frontend có thể gọi `GET /api/reviews/{historyId}`.
2. Controller gọi service `getByHistoryId`.
3. Repository `findByHistoryId`.
4. Trả `DiagnoseReviewResponse` hoặc 404.

Thiết kế này chọn chiến lược create-once, không cho sửa review.

### 2. Vai trò từng file

- [DiagnoseReviewController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiagnoseReviewController.java)
- [DiagnoseReviewService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseReviewService.java)
- [DiagnoseReviewRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseReviewRequest.java)
- [DiagnoseReviewResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseReviewResponse.java)
- [DiagnoseReview.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseReview.java)
- [DiagnoseReviewRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseReviewRepository.java)
- [DiagnosisRatingModal.jsx](/D:/AgriAI/agriai_frontend/src/components/DiagnosisRatingModal.jsx)
- [DiagnosisPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
- [DiagnosisHistoryPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx)

### 3. Phân tích từng hàm

#### `DiagnoseReviewController.submitReview()`

- Làm gì: nhận review mới.
- Gọi đến đâu: `reviewService.submitReview(email, request)`.

#### `DiagnoseReviewController.getReview()`

- Làm gì: lấy review theo historyId.
- Gọi đến đâu: `reviewService.getByHistoryId(historyId)`.

#### `DiagnoseReviewService.submitReview()`

- Làm gì: lưu đánh giá.
- Logic:
  1. check đã đăng nhập chưa
  2. load history
  3. nếu history có user thì check email trùng user sở hữu
  4. check `existsByHistoryId`
  5. load user hiện tại
  6. build `DiagnoseReview`
  7. save
  8. map response
- Tại sao viết vậy:
  - chặn người khác review lịch sử không phải của họ
  - chặn review lần 2

#### `DiagnoseReviewService.getByHistoryId()`

- Làm gì: query review của một lần chẩn đoán.

#### `DiagnoseReviewService.toResponse()`

- Làm gì: map entity sang DTO.

### 4. API endpoint

- `POST /api/reviews`
  - Middleware/guard: authenticated
  - Hàm xử lý: `DiagnoseReviewController.submitReview()`
  - Vì sao dùng POST: tạo bản ghi review mới.

- `GET /api/reviews/{historyId}`
  - Middleware/guard: endpoint thực tế cũng nằm sau security do không permitAll riêng
  - Hàm xử lý: `DiagnoseReviewController.getReview()`
  - Vì sao dùng GET: truy vấn trạng thái review.

### 5. DTO / Request / Response

#### `DiagnoseReviewRequest`

- File: [DiagnoseReviewRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/DiagnoseReviewRequest.java)
- Fields:
  - `historyId: Integer`
  - `isAccurate: Boolean`
  - `rating: Integer`
  - `feedback: String`

#### `DiagnoseReviewResponse`

- File: [DiagnoseReviewResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseReviewResponse.java)
- Fields:
  - `id: Integer`
  - `historyId: Integer`
  - `isAccurate: Boolean`
  - `rating: Integer`
  - `feedback: String`
  - `createdAt: LocalDateTime`

Tại sao cần DTO:

- Không trả thẳng entity vì entity có relation `history`, `user`
- Contract frontend chỉ cần dữ liệu review thuần

### 6. Tương tác với Database

Khi lưu:

- Bảng: `DiagnoseReview`
- Fields:
  - `historyId`: từ request
  - `userId`: từ user hiện tại
  - `isAccurate`: từ request
  - `rating`: từ request
  - `feedback`: từ request

Khi lấy ra:

- `historyRepository.findById(historyId)`
- `reviewRepository.existsByHistoryId(historyId)`
- `reviewRepository.findByHistoryId(historyId)`
- `userRepository.findByEmail(email)`

Ràng buộc:

- `historyId` là `unique=true` ở entity, tức mỗi history tối đa 1 review

## 7. Bản đồ dịch bệnh

### 1. Luồng chạy tổng quan

1. Frontend [DiseaseMapPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx) gọi `GET /api/map/markers?days=&diseaseId=`.
2. Request vào [DiseaseMapController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiseaseMapController.java).
3. Controller gọi [DiseaseMapService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapService.java).
4. Service tính mốc thời gian `since = now - days`.
5. Service gọi [DiseaseMapRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseMapRepository.java).
6. Repository chạy JPQL:
   - join `DiagnoseHistory`
   - join `DiagnoseHistoryDetail`
   - join `Disease`
   - left join `AreaInfor`
7. Query trả projection `MapMarkerResponse`.
8. Frontend render marker lên Leaflet map.

Lý do thiết kế:

- Dữ liệu bản đồ là dữ liệu tổng hợp từ nhiều bảng.
- Dùng projection DTO ngay từ repository để không load cả object graph JPA không cần thiết.

### 2. Vai trò từng file

- [DiseaseMapController.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiseaseMapController.java)
- [DiseaseMapService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseMapService.java)
- [DiseaseMapRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseMapRepository.java)
- [MapMarkerResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/MapMarkerResponse.java)
- [DiseaseMapPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx)
- Entity dùng gián tiếp:
  - `DiagnoseHistory`
  - `DiagnoseHistoryDetail`
  - `Disease`
  - `AreaInfor`

### 3. Phân tích từng hàm

#### `DiseaseMapController.getMarkers()`

- Làm gì: nhận filter `days`, `diseaseId` và trả danh sách marker.
- Gọi đến đâu: `diseaseMapService.getMarkers(days, diseaseId)`.

#### `DiseaseMapService.getMarkers()`

- Làm gì: tính `since` rồi đẩy filter xuống repository.
- Tại sao tách service: giữ logic thời gian khỏi controller.

#### `DiseaseMapRepository.findMarkers()`

- Làm gì: query marker cho bản đồ.
- Logic:
  1. select trực tiếp `new MapMarkerResponse(...)`
  2. join `DiagnoseHistory h`
  3. join `DiagnoseHistoryDetail det`
  4. join `det.disease d`
  5. left join `h.areaInfor ai`
  6. lọc lat/lon khác null
  7. lọc trong khoảng thời gian
  8. lọc theo disease nếu có
  9. lọc `isDelete=false`
  10. sort `createdAt desc`
- Tại sao query kiểu projection:
  - giảm lượng dữ liệu
  - tránh trả cả entity nested

### 4. API endpoint

- `GET /api/map/markers`
  - Query params:
    - `days: int` mặc định `30`
    - `diseaseId: Integer` optional
  - Middleware/guard: permitAll
  - Hàm xử lý: `DiseaseMapController.getMarkers()`
  - Vì sao dùng GET: đọc dữ liệu map với filter.

### 5. DTO / Request / Response

#### `MapMarkerResponse`

- File: [MapMarkerResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/MapMarkerResponse.java)
- Fields:
  - `detailId: Integer`
  - `historyId: Integer`
  - `latitude: Double`
  - `longitude: Double`
  - `diseaseId: Integer`
  - `diseaseName: String`
  - `diagnosedAt: LocalDateTime`
  - `province: String`

Tại sao cần DTO:

- Dữ liệu map là projection từ nhiều bảng, không nên trả raw entity.

### 6. Tương tác với Database

Query chính:

- Từ `DiagnoseHistory`
- Join `DiagnoseHistoryDetail`
- Join `Disease`
- Left join `AreaInfor`

Filter:

- `h.latitude IS NOT NULL`
- `h.longitude IS NOT NULL`
- `h.createdAt >= :since`
- `(:diseaseId IS NULL OR d.id = :diseaseId)`
- `h.isDelete = false` hoặc null

Sort:

- `ORDER BY h.createdAt DESC`

Map:

- JPQL projection trực tiếp sang `MapMarkerResponse`

Lưu ý:

- `DiagnoseHistory.areaInfor` hiện không được gán ở flow chẩn đoán chính.
- Vì vậy `province` trên bản đồ có thể thường xuyên `null`.

## 8. Thông báo realtime và trạng thái notification

### 1. Luồng chạy tổng quan

Thông báo thực sự đang chạy trong code là thông báo realtime gợi ý xác nhận vị trí.

Luồng:

1. Sau chẩn đoán có GPS, `DiagnoseService` gọi nền `GeocodingService.processGeocoding`.
2. `GeocodingService` lưu `AreaInfor` mới nếu chưa tồn tại.
3. `GeocodingService` dùng `SimpMessagingTemplate.convertAndSendToUser(...)` gửi message lên queue `/queue/location-confirm`.
4. [WebsocketConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/websocket/WebsocketConfig.java) cấu hình endpoint `/ws`, broker `/topic` và `/queue`, đồng thời auth STOMP bằng JWT.
5. Frontend [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx) connect SockJS/STOMP tới `/ws`.
6. Frontend subscribe `/user/queue/location-confirm`.
7. Khi nhận payload, frontend hiện toast có nút điều hướng sang `/farming-areas`.

Lý do thiết kế:

- Thông báo này là realtime, không phù hợp với polling.
- Tách WebSocket ra khỏi REST giúp user nhận được gợi ý ngay sau khi geocoding chạy xong.

### 2. Vai trò từng file

- [WebsocketConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/websocket/WebsocketConfig.java): cấu hình WebSocket/STOMP.
- [GeocodingService.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java): phát message.
- [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java): payload thông báo.
- [GlobalNotificationListener.jsx](/D:/AgriAI/agriai_frontend/src/components/GlobalNotificationListener.jsx): nhận và hiển thị thông báo.
- [NotificationsPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/NotificationsPage.jsx): giao diện thông báo, nhưng hiện dùng mock data.
- [Notification.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/Notification.java): entity notification.
- [NotificationRepository.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/NotificationRepository.java): đang comment toàn bộ.
- [NotificationDTO.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/NotificationDTO.java): đang comment toàn bộ.
- [FirebaseConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/firebase/FirebaseConfig.java): hiện trống.

### 3. Phân tích từng hàm

#### `WebsocketConfig.configureMessageBroker()`

- Làm gì: bật simple broker cho `/topic` và `/queue`.

#### `WebsocketConfig.registerStompEndpoints()`

- Làm gì: expose endpoint `/ws` với SockJS.

#### `WebsocketConfig.configureClientInboundChannel()`

- Làm gì: intercept frame STOMP `CONNECT`, lấy JWT từ header `Authorization`, validate token, set user vào accessor.
- Tại sao viết vậy: WebSocket không đi qua cùng flow auth với REST controller.

#### `GlobalNotificationListener.useEffect()`

- Làm gì:
  1. lấy `accessToken` từ localStorage
  2. tạo STOMP client
  3. connect tới `/ws`
  4. subscribe `/user/queue/location-confirm`
  5. parse payload
  6. hiện toast
- Tại sao viết vậy: listener toàn cục để trang nào cũng nhận được notification.

### 4. API endpoint

- WebSocket endpoint: `/ws`
  - Không phải REST endpoint
  - Kết nối qua SockJS/STOMP
  - Auth bằng JWT trong STOMP header `Authorization`

REST notification:

- Hiện chưa có endpoint notification thực sự hoạt động

### 5. DTO / Request / Response

#### `LocationConfirmPayload`

- File: [LocationConfirmPayload.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/LocationConfirmPayload.java)
- Fields:
  - `areaId: Integer`
  - `displayName: String`
  - `message: String`
  - `redirectPath: String`

#### `NotificationDTO`

- File có tồn tại nhưng đang bị comment, chưa active.

### 6. Tương tác với Database

Luồng realtime đang chạy:

- Có lưu `AreaInfor` trước khi gửi notification
- Nhưng không lưu record `Notification`

Entity notification:

- `Notification(userId,title,content,notificationType,isRead,readAt)` có tồn tại
- Tuy nhiên không có repository active, service, controller hay flow save/read đang dùng thực sự

Kết luận:

- Chức năng notification bền vững trong DB hiện chưa hoàn chỉnh
- Chức năng đang hoạt động thật chỉ là WebSocket realtime toast

## 9. Khối frontend shell, trang marketing và chatbot demo

### 1. Luồng chạy tổng quan

1. [index.js](/D:/AgriAI/agriai_frontend/src/index.js) mount React app và bọc trong `AuthProvider`.
2. [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js) nạp trạng thái đăng nhập từ localStorage, cố refresh token khi app start.
3. [App.js](/D:/AgriAI/agriai_frontend/src/App.js) khai báo router và layout chung.
4. `Navbar`, `Footer`, `ChatBotWidget`, `GlobalNotificationListener` được gắn ở cấp app.
5. Các page marketing như `LandingPage`, `HomePage`, `Hero`, `Features` chủ yếu render nội dung tĩnh.
6. `ChatBotWidget` hiện chỉ dùng mock response trong frontend, không gọi backend.

Thiết kế như vậy để:

- Có một app shell chung cho mọi trang
- Auth state dùng chung toàn ứng dụng
- Thông báo realtime nghe ở cấp global

### 2. Vai trò từng file

- [index.js](/D:/AgriAI/agriai_frontend/src/index.js): entrypoint React.
- [App.js](/D:/AgriAI/agriai_frontend/src/App.js): router và layout app.
- [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js): context auth toàn cục.
- [Navbar.jsx](/D:/AgriAI/agriai_frontend/src/components/Navbar.jsx): top navigation.
- [Footer.jsx](/D:/AgriAI/agriai_frontend/src/components/Footer.jsx): footer.
- [SEO.jsx](/D:/AgriAI/agriai_frontend/src/components/SEO.jsx): meta tag động.
- [LandingPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/LandingPage.jsx): landing page.
- [HomePage.jsx](/D:/AgriAI/agriai_frontend/src/pages/HomePage.jsx): home page.
- [Hero.jsx](/D:/AgriAI/agriai_frontend/src/components/Hero.jsx): hero section.
- [Features.jsx](/D:/AgriAI/agriai_frontend/src/components/Features.jsx): feature section.
- [ChatBotWidget.jsx](/D:/AgriAI/agriai_frontend/src/components/ChatBotWidget.jsx): chatbot demo.

### 3. Phân tích từng hàm

#### `AuthProvider.refreshAuthToken()`

- Làm gì: khi app load, gọi `/api/auth/refresh-token` để lấy token mới.
- Logic:
  1. gửi POST với `withCredentials=true`
  2. đọc `response.data.token`
  3. cố đọc `response.data.user`
  4. nếu có cả token và user thì update localStorage
  5. nếu 401 thì clear auth
- Lưu ý: backend refresh hiện không trả `user`, nên flow này đang lệch contract.

#### `AuthProvider.loginContext()`

- Làm gì: lưu access token và user vào state + localStorage.

#### `AuthProvider.logoutContext()`

- Làm gì: gọi `/api/auth/logout`, rồi clear local state.

#### `Navbar.handleLogout()`

- Làm gì: gọi `logoutContext()` rồi điều hướng `/login`.

#### `ChatBotWidget.handleSend()`

- Làm gì: thêm tin nhắn user vào state rồi giả lập AI trả lời sau timeout.

#### `ChatBotWidget.getMockResponse()`

- Làm gì: trả text hardcode theo keyword query.
- Kết luận: đây chưa phải chatbot backend thật, chỉ là UI demo local.

### 4. API endpoint

Chức năng shell/frontend dùng các endpoint:

- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`

Chatbot demo:

- Không gọi endpoint nào

### 5. DTO / Request / Response

- Không có DTO backend riêng cho shell UI.
- Frontend dùng trực tiếp JSON response của auth API.

### 6. Tương tác với Database

- Không tương tác DB trực tiếp từ frontend shell.
- Chỉ lưu local state vào `localStorage`:
  - `accessToken`
  - `user`

## Nhận xét quan trọng sau khi đọc code

### Các điểm lệch giữa frontend và backend

1. [AddFarmingAreaModal.jsx](/D:/AgriAI/agriai_frontend/src/components/AddFarmingAreaModal.jsx) gửi `areaSize`, nhưng backend [AreaInforRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/AreaInforRequest.java) nhận `area`.
2. [FarmingAreaPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx) hiển thị `area.areaCode`, nhưng [AreaInforResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/AreaInforResponse.java) không trả field này.
3. [AuthContext.js](/D:/AgriAI/agriai_frontend/src/context/AuthContext.js) mong `refresh-token` trả cả `token` và `user`, nhưng backend `AuthService.refreshToken()` chỉ trả token mới và refreshToken cũ.
4. [DiagnoseResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/DiagnoseResponse.java) có `annotatedImageUrl`, nhưng backend chưa set ở đâu.

### Các chức năng chưa hoàn chỉnh

1. `Notification` entity tồn tại nhưng repository/dto đang bị comment, chưa có luồng CRUD thật.
2. [NotificationsPage.jsx](/D:/AgriAI/agriai_frontend/src/pages/NotificationsPage.jsx) hiện là dữ liệu mock.
3. [FirebaseConfig.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/firebase/FirebaseConfig.java) đang để trống.
4. `ChatBotWidget` hiện chỉ là mock chat cục bộ, không nối backend.

### Các điểm thiết kế tốt

1. Chức năng chẩn đoán được tách service rất rõ.
2. Dùng `Port` cho external integration là hợp lý.
3. Có snapshot JSON để giữ lịch sử bất biến theo thời điểm chẩn đoán.
4. Rule engine được chia thành các bước nhỏ có test riêng.

### Kết luận tổng thể

Codebase có kiến trúc backend khá rõ ràng ở các chức năng nghiệp vụ chính, đặc biệt là module chẩn đoán. Phần frontend bám theo các API này tương đối tốt ở login, diagnosis, history, map. Tuy nhiên vẫn còn một số chỗ lệch contract giữa frontend và backend, và một vài module mới dừng ở mức UI hoặc entity skeleton, chưa thành chức năng hoàn chỉnh.
