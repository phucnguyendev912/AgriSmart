# 1. Xác thực người dùng

## 1. Luồng chạy tổng quan

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

## 2. Vai trò từng file

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

## 3. Phân tích từng hàm

### `AuthController.register()`

- Nhận request đăng ký và gọi service.
- Được gọi từ: frontend `RegisterPage.jsx`.
- Gọi đến: `authService.register(request)`.
- Logic: validate DTO bằng `@Valid`, trả `ResponseEntity.ok(...)`.

### `AuthController.login()`

- Nhận email/password, gọi service login, set cookie access và refresh token.
- Được gọi từ: `LoginPage.jsx`.
- Gọi đến: `authService.login(request)`.
- Logic: service trả `LoginResponse`, controller nhét token vào cookie rồi trả JSON.

### `AuthController.refresh()`

- Đọc `refreshToken` từ cookie, xin access token mới.
- Gọi đến: `authService.refreshToken(refreshToken)`.
- Logic: nếu thiếu cookie thì 401, nếu có thì refresh và set lại access cookie.

### `AuthController.logout()`

- Xóa cookie bằng cách set `MaxAge=0`.

### `AuthService.register()`

- Đăng ký user mới.
- Được gọi từ: `AuthController.register()`.
- Gọi đến: `userRepository.existsByEmail`, `roleRepository.findByRoleName`, `userRepository.save`.
- Logic:
  1. normalize email
  2. kiểm tra email trùng
  3. kiểm tra password confirm
  4. lấy role `USER`
  5. bcrypt password
  6. save user
  7. map sang `UserResponse`

### `AuthService.login()`

- Xác thực đăng nhập và sinh token.
- Được gọi từ: `AuthController.login()`.
- Gọi đến: `authenticationManager.authenticate`, `userRepository.findByEmail`, `jwtService.generateToken`, `jwtService.generateRefreshToken`.
- Logic:
  1. normalize email
  2. authenticate với Spring Security
  3. đọc user từ DB
  4. map sang `UserDetails`
  5. sinh token
  6. build `LoginResponse`

### `AuthService.refreshToken()`

- Xác minh refresh token và cấp access token mới.
- Logic: extract username -> tìm user -> validate token -> build response mới.
- Lưu ý: backend hiện chỉ trả token mới và refreshToken cũ, không trả lại `user`.

### `JwtAuthenticationFilter.doFilterInternal()`

- Lấy JWT từ Authorization header hoặc cookie `accessToken`.
- Được gọi từ: chuỗi filter của Spring Security.
- Gọi đến: `jwtService.extractUsername`, `userDetailsService.loadUserByUsername`, `jwtService.isTokenValid`.
- Logic: nếu token hợp lệ thì set `Authentication` vào `SecurityContextHolder`.

### `CustomUserDetailsService.loadUserByUsername()`

- Nạp user cho Spring Security.
- Logic: tìm user theo email, check `isActive`, map quyền thành `ROLE_*`.

## 4. API endpoint

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

## 5. DTO / Request / Response

### `RegisterRequest`

- File: [RegisterRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/RegisterRequest.java)
- Fields:
  - `fullName: String`
  - `email: String`
  - `phoneNumber: String`
  - `password: String`
  - `passwordConfirm: String`

### `LoginRequest`

- File: [LoginRequest.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/request/LoginRequest.java)
- Fields:
  - `email: String`
  - `password: String`

### `LoginResponse`

- File: [LoginResponse.java](/D:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/LoginResponse.java)
- Fields:
  - `token: String`
  - `refreshToken: String`
  - `user: UserResponse`

### `UserResponse`

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

## 6. Tương tác với Database

Khi lưu:

- Bảng `users`
- Field:
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

- Chủ yếu qua JPA relation `User -> Role`

Index:

- Chỉ chắc chắn `users.email` có unique
- Không thấy khai báo `@Index` riêng

Map response:

- `User` -> `UserResponse`
