# Workflow: Authentication & Authorization (Xác thực & Phân quyền)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** xử lý xác thực (Authentication) và phân quyền (Authorization) từ client (React) đến server (Spring Boot).

---

## 1. Tổng quan chức năng

Tính năng Xác thực và Phân quyền là xương sống bảo mật của hệ thống AgriSmart, đảm bảo rằng:
1. **Người dùng thông thường (USER)** có thể đăng ký tài khoản, đăng nhập an toàn, quản lý thông tin cá nhân và truy cập các dịch vụ cốt lõi (chẩn đoán bệnh cây trồng, chat AI, xem bản đồ dịch bệnh).
2. **Quản trị viên (ADMIN)** có quyền truy cập vào các API quản trị (`/api/admin/**`) để quản lý người dùng, quản lý dữ liệu dịch bệnh và xem dashboard tổng quan.
3. **Khách truy cập (GUEST)** có thể xem một số thông tin công khai mà không cần đăng nhập (như danh sách loại cây trồng, bản đồ dịch bệnh công cộng, thời tiết).

### Business Flow thực tế
* **Đăng ký (Register):** Người dùng nhập Họ tên, Email, Số điện thoại và Mật khẩu. Hệ thống kiểm tra tính hợp lệ, mã hóa mật khẩu, gán quyền mặc định (`ROLE_USER`) và lưu thông tin.
* **Đăng nhập (Login):** Người dùng cung cấp Email và Mật khẩu. Server xác thực thông tin, tạo ra cặp mã thông báo **Access Token** (ngắn hạn) và **Refresh Token** (dài hạn). Cả hai token này được lưu trữ trong **HttpOnly Cookie** ở trình duyệt để ngăn chặn các cuộc tấn công XSS đánh cắp token.
* **Silent Refresh Token:** Khi Access Token hết hạn (ví dụ sau 60 phút), Axios Interceptor ở phía React tự động bắt lỗi `401 Unauthorized` và gọi API refresh token ở background mà người dùng không hề hay biết (Silent Refresh), giúp duy trì phiên làm việc mượt mà.
* **Đăng xuất (Logout):** Client gọi API logout, Server sẽ xóa các HttpOnly cookies bằng cách set thời gian sống (MaxAge) về 0.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ Sequence Diagram mô tả chi tiết luồng đăng nhập và cơ chế tự động refresh token khi gặp lỗi 401:

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả chi tiết quá trình Đăng nhập (Login) và cơ chế tự động nạp lại Token (Silent Refresh):

### 2.1. Sơ đồ Luồng Đăng nhập (Login)

```
[ User (Nông dân / Admin) ]
            │ (1) Nhập Email & Password -> Submit Form
            ▼
   [ React (LoginPage) ]
            │ (2) POST /api/auth/login
            ▼
    [ AuthController ]
            │ (3) Gọi authService.login()
            ▼
     [ AuthService ]  ──(4) Truy vấn User theo Email ──> [ Database (PostgreSQL) ]
            │                                                       │
            │ <───(5) Trả về User & Mật khẩu đã mã hóa (BCrypt) ────┘
            ▼
     [ AuthService ]
            │ (6) Kiểm tra Password. Tạo Access Token (1h) & Refresh Token (7 ngày)
            ▼
    [ AuthController ]
            │ (7) Set 2 Token vào HttpOnly Cookies (accessToken & refreshToken)
            ▼
   [ React (LoginPage) ]
            │ (8) Nhận Response 200 OK (Chỉ chứa thông tin User ở Body)
            ▼
[ Chuyển hướng sang /home ]
```

---

### 2.2. Sơ đồ Luồng Tự động làm mới Token (Silent Refresh)

Khi Access Token hết hạn, bất kỳ request nào yêu cầu xác thực gửi lên (ví dụ lấy lịch sử chẩn đoán) sẽ kích hoạt luồng tự động hồi phục phiên như sau:

```
[ React (Axios Request) ] ──(1) Kèm Cookie accessToken (Hết hạn)──> [ JwtAuthenticationFilter ]
                                                                             │
                                                                 (2) Trả về 401 Unauthorized
                                                                             ▼
[ React (Axios Response Interceptor) ]
            │
            │ (3) Tự động bắt lỗi 401, đóng băng request gốc
            ▼
[ React (Gọi Refresh API) ] ──(4) POST /api/auth/refresh-token (Kèm Cookie refreshToken) ──> [ AuthController ]
                                                                                                    │
                                                                                         (5) Xác thực Refresh Token
                                                                                                    ▼
                                                                                             [ AuthService ]
                                                                                                    │
                                                                                         (6) Tạo Access Token mới
                                                                                                    ▼
[ React (Axios nhận 200 OK) ] <──(7) Trả về Cookie accessToken mới ─────────────────────── [ AuthController ]
            │
            │ (8) Axios tự động gọi lại request gốc bằng accessToken mới
            ▼
[ Giao diện cập nhật dữ liệu lịch sử mượt mà cho người dùng ]
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [SecurityConfig.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/SecurityConfig.java)
* **Vai trò:** Cấu hình toàn bộ hệ thống bảo mật của Spring Security. Thiết lập các endpoint công khai (PermitAll), các endpoint yêu cầu quyền ADMIN (`/api/admin/**`), tắt cấu hình CSRF mặc định (vì dùng REST API stateless) và thiết lập Session Policy thành `STATELESS`.
* **Dependencies:**
  * `JwtAuthenticationFilter`: Bộ lọc JWT tự tùy chỉnh được chèn vào trước `UsernamePasswordAuthenticationFilter`.
  * `CustomUserDetailsService`: Dùng để nạp thông tin user từ database cho Spring Security.
* **Hàm cốt lõi:**
  * `securityFilterChain(HttpSecurity http)`: Thiết lập chuỗi lọc bảo mật. Phân quyền truy cập các URL: `/api/auth/**` (PermitAll), `/api/crop-types` (PermitAll), `/api/diagnosis` (PermitAll), `/api/admin/**` (Chỉ cho vai trò ADMIN), các URL khác yêu cầu đăng nhập.
  * `corsConfigurationSource()`: Cấu hình CORS để cho phép Client React (chạy trên port 3000/3001) gửi request kèm thông tin định danh (Credentials/Cookies) qua `configuration.setAllowCredentials(true)`.

#### B. [JwtAuthenticationFilter.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/JwtAuthenticationFilter.java)
* **Vai trò:** Bộ lọc chạy một lần cho mỗi request (`OncePerRequestFilter`). Nhiệm vụ của nó là chặn request gửi đến, trích xuất JWT từ HTTP Header `Authorization` hoặc từ HttpOnly Cookie `accessToken`, kiểm tra tính hợp lệ và thiết lập ngữ cảnh bảo mật (`SecurityContextHolder`).
* **Hàm cốt lõi:**
  * `doFilterInternal(...)`: 
    * Kiểm tra Header `Authorization` bắt đầu bằng `Bearer `.
    * Nếu không có, duyệt qua Cookies để tìm Cookie có tên `accessToken`.
    * Nếu tìm thấy JWT, trích xuất email của user thông qua `jwtService.extractUsername(jwt)`.
    * Nạp thông tin User từ DB thông qua `userDetailsService.loadUserByUsername()`.
    * Nếu token hợp lệ, tạo `UsernamePasswordAuthenticationToken` và gán vào `SecurityContextHolder`.

#### C. [JwtService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/JwtService.java)
* **Vai trò:** Lớp tiện ích chịu trách nhiệm tạo, phân tích cú pháp (parse) và xác thực JSON Web Token (JWT).
* **Hàm cốt lõi:**
  * `generateToken(UserDetails)` / `generateRefreshToken(UserDetails)`: Sử dụng thư viện JJWT để xây dựng các claims, đặt chủ đề (subject) là email người dùng, thời gian phát hành, thời gian hết hạn và ký số bằng thuật toán `HS256` kết hợp khóa bí mật.
  * `extractAllClaims(String token)`: Giải mã token bằng khóa bí mật để lấy toàn bộ thông tin (claims) bên trong.
  * `isTokenValid(String token, UserDetails)`: Kiểm tra xem username trong token có khớp với Database không và token đã hết hạn chưa.

#### D. [CustomUserDetailsService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/security/CustomUserDetailsService.java)
* **Vai trò:** Implement interface `UserDetailsService` của Spring Security để nạp thông tin định danh của người dùng từ cơ sở dữ liệu.
* **Hàm cốt lõi:**
  * `loadUserByUsername(String email)`: Truy vấn người dùng từ `UserRepository` bằng email. Kiểm tra xem người dùng có bị vô hiệu hóa (`isActive = false`) không. Trả về đối tượng `org.springframework.security.core.userdetails.User` chuẩn chứa Email, Mật khẩu đã mã hóa và danh sách quyền hạn (GrantedAuthorities) có tiền tố `ROLE_` (ví dụ: `ROLE_USER`, `ROLE_ADMIN`).

#### E. [AuthController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/AuthController.java)
* **Vai trò:** REST Controller cung cấp các API endpoint phục vụ việc đăng nhập, đăng ký, refresh token và logout.
* **Hàm cốt lõi:**
  * `login(@Valid LoginRequest, HttpServletResponse)`: Gọi `authService.login()`. Lấy Access Token và Refresh Token từ kết quả trả về, gói chúng vào hai đối tượng `Cookie` khác nhau: `accessToken` (MaxAge = 1 giờ) và `refreshToken` (MaxAge = 7 ngày). Cả hai đều được thiết lập `setHttpOnly(true)` và `setPath("/")`. Trả về JSON chứa thông tin user (đã lược bỏ token khỏi body để đảm bảo an toàn).
  * `refresh(...)`: Đọc Cookie `refreshToken` từ request. Xác thực và cấp phát `accessToken` mới, ghi đè cookie cũ và trả về thông tin user.
  * `logout(HttpServletResponse)`: Tạo lại các cookie `accessToken` và `refreshToken` với giá trị `null` và `MaxAge = 0` để trình duyệt tự động xóa chúng ngay lập tức.

#### F. [AuthService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/AuthService.java)
* **Vai trò:** Thực hiện business logic cho xác thực.
* **Hàm cốt lõi:**
  * `register(RegisterRequest)`: Chuẩn hóa email (trim, toLowerCase), kiểm tra email trùng trong DB, kiểm tra mật khẩu xác nhận, tìm quyền `USER` trong bảng `roles`, mã hóa mật khẩu bằng `PasswordEncoder (BCrypt)` và lưu người dùng mới.
  * `login(LoginRequest)`: Gọi `authenticationManager.authenticate` để xác thực email & mật khẩu. Nếu thành công, tìm User trong DB và sinh cặp Access/Refresh Token.
  * `refreshToken(String token)`: Trích xuất email từ token, load User lên và xác thực tính hợp lệ của token. Nếu hợp lệ, sinh Access Token mới.

---

### 3.2. Cấu trúc phía Frontend (React)

#### A. [AuthContext.js](file:///d:/AgriAI/agriai_frontend/src/context/AuthContext.js)
* **Vai trò:** React Context đóng vai trò như một kho lưu trữ trạng thái đăng nhập toàn cục (Global Auth State). Nó cung cấp thông tin `user` hiện tại, trạng thái `loading`, và các hàm `loginContext`, `logoutContext`, `refreshAuthToken` cho toàn bộ các component con.
* **Logic cốt lõi:**
  * Thiết lập cấu hình mặc định: `axios.defaults.withCredentials = true;` để đảm bảo trình duyệt luôn tự động gửi cookies đi kèm mọi request API lên backend.
  * **Axios Response Interceptor:** Khi bất kỳ request nào gọi lên backend bị trả về mã lỗi `401 Unauthorized`, interceptor này sẽ chặn lại, đánh dấu cờ đang thử lại (`_retry = true`), gọi API `/api/auth/refresh-token` để backend cấp lại cookie access token mới. Nếu thành công, nó thực hiện lại request ban đầu với cookie mới. Nếu thất bại (Refresh Token cũng hết hạn), nó sẽ thực hiện logout và đẩy người dùng ra trang chủ.

#### B. [LoginPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/LoginPage.jsx) & [RegisterPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/RegisterPage.jsx)
* **Vai trò:** Cung cấp giao diện biểu mẫu (Form) để thu thập thông tin đăng nhập/đăng ký của người dùng, thực hiện validate cơ bản ở client và gọi các endpoint tương ứng ở backend.
* **LoginPage Logic:** Gọi `axios.post('/api/auth/login', { email, password })`. Khi thành công, toast thông báo thành công, gọi `loginContext(userData)` để lưu user vào State & LocalStorage, và dùng `navigate('/home')` để chuyển hướng mà không reload lại trang.

---

## 4. Giải thích kỹ thuật sử dụng trong code

Dưới đây là các khái niệm và kỹ thuật được sử dụng, giải thích chi tiết cho Intern/Junior:

### 4.1. Spring Security & Architecture
Spring Security hoạt động dựa trên một chuỗi các bộ lọc Servlet (được gọi là **Security Filter Chain**). Khi một request đi vào ứng dụng, nó phải đi qua một loạt các Filter trước khi đến được Rest Controller.
* **OncePerRequestFilter:** Là một lớp cơ sở đảm bảo filter chỉ thực thi duy nhất **một lần** cho mỗi request đi vào. Điều này rất quan trọng vì trong các kiến trúc Servlet phức tạp, một request có thể được chuyển tiếp (forward) nội bộ nhiều lần, tránh việc xác thực lại nhiều lần gây suy giảm hiệu năng.
* **SecurityContextHolder:** Là nơi lưu trữ thông tin chi tiết về ngữ cảnh bảo mật hiện tại của ứng dụng (ai đang đăng nhập, họ có những quyền gì). Thông tin này mặc định được lưu trữ trong một `ThreadLocal`, nghĩa là mỗi luồng (thread) xử lý request sẽ có một không gian lưu trữ bảo mật riêng biệt.

### 4.2. JSON Web Token (JWT)
JWT là một phương thức truyền tin an toàn giữa các bên dưới dạng đối tượng JSON. Cấu trúc JWT gồm 3 phần phân tách bằng dấu chấm (`.`): `Header.Payload.Signature`.
* **Header:** Chứa thông tin về kiểu token và thuật toán ký (ở đây là HS256).
* **Payload:** Chứa các claims (lời khẳng định), thường là thông tin người dùng (`sub` - Subject là email) và thời hạn hết hạn (`exp`).
* **Signature:** Chữ ký số dùng để xác minh token không bị chỉnh sửa trên đường truyền. Nó được tạo bằng cách băm (hash) phần `Header` và `Payload` kết hợp với một khóa bí mật (`jwt.secret`) ở server.
* **Cơ chế hoạt động:** Server không lưu trữ JWT trong bộ nhớ (Stateless). Khi nhận request, server chỉ cần dùng khóa bí mật để giải mã và kiểm tra chữ ký của token. Nếu chữ ký trùng khớp và token chưa hết hạn, server tin tưởng tuyệt đối vào thông tin nằm ở phần Payload.

### 4.3. Bảo mật Cookie HttpOnly
Thay vì lưu JWT trong `localStorage` (rất dễ bị đánh cắp bởi mã độc JavaScript thông qua tấn công **XSS - Cross-Site Scripting**), hệ thống AgriSmart lưu token vào Cookie được thiết lập cờ **HttpOnly**.
* **HttpOnly:** Khi cờ này được set, trình duyệt sẽ cấm mã JavaScript (`document.cookie`) truy cập vào cookie này. Do đó, dù hacker có chèn được mã độc XSS vào trang web, họ cũng không thể đọc trộm được token của người dùng.
* **Cơ chế tự động:** Mỗi khi Axios gửi request lên backend, trình duyệt sẽ tự động đính kèm cookie này vào header của request một cách an toàn mà lập trình viên frontend không cần can thiệp thủ công.

### 4.4. BCrypt Password Hashing
BCrypt là một hàm băm mật khẩu được thiết kế dựa trên thuật toán mã hóa Blowfish. Nó tích hợp sẵn cơ chế **Salt (muối)** ngẫu nhiên cho mỗi lần băm.
* **Salt:** Nghĩa là hai người dùng dùng chung mật khẩu `123456` thì khi băm ra, hai chuỗi hash thu được cũng hoàn toàn khác nhau. Điều này chống lại các cuộc tấn công tra cứu bảng băm sẵn (**Rainbow Table**).
* **Work Factor (Độ phức tạp):** BCrypt có một tham số kiểm soát tốc độ băm mật khẩu (mặc định là 10). Nó cố tình làm chậm quá trình băm lại để ngăn chặn việc hacker sử dụng siêu máy tính để dò mật khẩu bằng phương pháp thử sai liên tiếp (**Brute-force attack**).

### 4.5. React Context API & Axios Interceptors
* **Context API:** Cho phép truyền dữ liệu (state) xuyên suốt cây component của React mà không cần phải truyền props thủ công qua quá nhiều cấp (gặp hiện tượng *Props Drilling*).
* **Axios Interceptors:** Giống như một Filter ở phía Client. Nó có thể can thiệp vào giai đoạn trước khi gửi request đi (Request Interceptor) hoặc sau khi nhận response về (Response Interceptor). Ở đây, Response Interceptor được dùng như một máy lắng nghe lỗi toàn cục: hễ thấy mã lỗi 401 thì dừng lại để refresh token rồi mới chạy tiếp.

---

## 5. Database & Query Analysis

### 5.1. Thiết kế cơ sở dữ liệu

Bảng `users` liên kết với bảng `roles` qua quan hệ **Many-to-One** (Nhiều người dùng thuộc về một vai trò).

```
   [Bảng roles]                          [Bảng users]
+-----------------+                 +---------------------+
| id (PK)         | <-------------- | id (PK)             |
| roleName        |   1:N Relation  | email (Unique)      |
| description     |                 | passwordHash        |
| ... (BaseEntity)|                 | roleId (FK) -> roles|
+-----------------+                 +---------------------+
```

* **Quy tắc thiết kế:** Sử dụng một bảng `roles` riêng biệt giúp hệ thống dễ dàng mở rộng và định nghĩa thêm các vai trò mới trong tương lai (ví dụ: `COOPERATIVE_LEADER`, `AGRICULTURAL_EXPERT`) mà không cần thay đổi cấu trúc bảng `users`.
* **Khóa ngoại (Foreign Key):** Cột `roleId` trong bảng `users` tham chiếu đến cột `id` trong bảng `roles`.

### 5.2. Phân tích Query SQL phát sinh

Khi một người dùng đăng nhập hoặc bộ lọc JWT xác thực request, Spring Data JPA sẽ sinh các câu lệnh SQL dưới dạng:

```sql
-- 1. Tìm User bằng email
SELECT u.id, u.email, u.password_hash, u.is_active, u.role_id, u.is_delete 
FROM users u 
WHERE u.email = ? AND u.is_delete = false;

-- 2. Tìm Role tương ứng (Do Lazy Loading kích hoạt)
SELECT r.id, r.role_name, r.description 
FROM roles r 
WHERE r.id = ?;
```

#### Đánh giá hiệu năng:
1. **Index:** Cột `email` trong bảng `users` đã được đánh dấu là `unique = true`, do đó PostgreSQL sẽ tự động tạo một Unique Index trên cột này. Việc tìm kiếm User bằng email sẽ thực thi cực kỳ nhanh với độ phức tạp $O(\log N)$ thông qua B-Tree Index.
2. **Vấn đề N+1 Query & Lazy Loading:**
   Mối quan hệ `role` trong entity `User` được cấu hình là `FetchType.LAZY`:
   ```java
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "roleId")
   private Role role;
   ```
   Do đó, khi `CustomUserDetailsService` gọi `user.getRole().getRoleName()`, Hibernate nhận thấy dữ liệu Role chưa được nạp, nó buộc phải thực thi thêm một câu query phụ thứ hai (Query 2 ở trên) để lấy thông tin role. Điều này làm tăng số lượng connection truy cập DB (sinh ra 2 query thay vì 1 query join duy nhất).

---

## 6. Kiến trúc & Design Pattern

### 6.1. Kiến trúc phân tầng (Layered Architecture)
Dự án được tổ chức theo kiến trúc phân tầng truyền thống nhưng có sự kết hợp định hướng **Hexagonal** (có các package `port` và `adapter`). Riêng module Auth tuân thủ chặt chẽ 3 tầng:
1. **Controller Layer (`AuthController`):** Điểm tiếp nhận request từ client, thực hiện validate dữ liệu đầu vào thông qua các annotation như `@Valid`, `@Email`, `@NotBlank` và chuyển đổi DTO sang format API.
2. **Service Layer (`AuthService`):** Nơi chứa toàn bộ nghiệp vụ logic của hệ thống (Business Logic). Nó điều phối các tương tác dữ liệu, thực hiện mã hóa và giao tiếp với bảo mật.
3. **Repository Layer (`UserRepository`, `RoleRepository`):** Tầng giao tiếp trực tiếp với cơ sở dữ liệu PostgreSQL thông qua Spring Data JPA.

### 6.2. Các Design Pattern được áp dụng
* **Builder Pattern:** Được tạo ra tự động bởi thư viện Lombok thông qua `@Builder` và `@SuperBuilder` trên các Entity và DTO. Pattern này giúp tạo ra các đối tượng phức tạp một cách rõ ràng, dễ đọc, tránh việc tạo ra các constructor quá dài (Constructor Overloading) và đảm bảo tính bất biến (Immutability) của dữ liệu.
* **Data Transfer Object (DTO) Pattern:** Sử dụng `RegisterRequest`, `LoginRequest`, `LoginResponse`, `UserResponse`. Pattern này giúp ẩn đi cấu trúc thực tế của database (Entities), tránh rò rỉ các thông tin nhạy cảm (như mật khẩu băm, các trường auditing) ra ngoài API, đồng thời giúp tối ưu hóa băng thông truyền tải mạng.
* **Filter Pattern (Chain of Responsibility):** Spring Security áp dụng pattern này để xây dựng chuỗi các filter bảo mật. Mỗi filter chịu trách nhiệm xử lý một nhiệm vụ chuyên biệt (CORS, CSRF, JWT, Authorization) và quyết định xem request có được đi tiếp tới controller hay không.

---

## 7. Điểm chưa tối ưu (Code Smell & Vulnerability)

Dưới đây là các điểm cần cải tiến được phát hiện dưới góc nhìn của một Senior Developer:

### 7.1. Hibernate Lazy Loading & Transaction giữ kết nối quá lâu
Trong class `CustomUserDetailsService.java`:
```java
@Override
@Transactional // <- Điểm chưa tối ưu
public UserDetails loadUserByUsername(String email) {
    User user = userRepository.findByEmail(email)...
    String roleName = user.getRole().getRoleName(); // <- Gây ra query phụ
    ...
}
```
* **Lý do chưa tối ưu:** Annotation `@Transactional` được đặt ở đây nhằm giữ Session của Hibernate mở để tránh lỗi `LazyInitializationException` khi gọi `user.getRole()`. Tuy nhiên, việc mở Transaction ở đây vô tình giữ connection của database lâu hơn, làm giảm số lượng request đồng thời mà server có thể phục vụ. Đồng thời, Hibernate vẫn phải chạy thêm 1 query phụ để lấy Role.

### 7.2. Lỗ hổng bảo mật CSRF (Cross-Site Request Forgery)
Trong `SecurityConfig.java`, CSRF bị vô hiệu hóa hoàn toàn bằng `csrf.disable()`. Đồng thời trong `AuthController.java`, các cookies được set thủ công bằng class `Cookie` tiêu chuẩn của Java Servlet:
```java
Cookie access = new Cookie("accessToken", lr.getToken());
access.setHttpOnly(true);
access.setPath("/");
```
* **Lý do chưa tối ưu:** Mặc dù HttpOnly giúp chống lại XSS, nhưng việc lưu token trong Cookie và tắt hoàn toàn CSRF bảo vệ khiến hệ thống dễ bị tấn công CSRF. Hacker có thể lừa người dùng click vào một đường link độc hại, trình duyệt của người dùng sẽ tự động gửi kèm cookie `accessToken` lên server và thực thi các hành động phá hoại.
* **Thiếu cấu hình an toàn:** Cookie chưa được set thuộc tính `Secure` (chỉ truyền qua HTTPS) và thuộc tính `SameSite` (ngăn trình duyệt gửi cookie đi cùng các request từ trang web khác).

### 7.3. Phá vỡ cơ chế Single Page Application (SPA) ở React Frontend
Trong `AuthContext.js`:
```javascript
const clearAuth = (shouldRedirect = false) => {
  setUser(null);
  localStorage.removeItem("user");
  if (shouldRedirect) {
    window.location.href = "/"; // <- Code Smell
  }
};
```
* **Lý do chưa tối ưu:** Dòng lệnh `window.location.href = "/"` sẽ ép trình duyệt tải lại toàn bộ trang web (Hard Refresh). Điều này phá hỏng hoàn toàn trải nghiệm mượt mà của SPA (Single Page Application) trong React, làm mất đi các dữ liệu được lưu trữ trong bộ nhớ tạm thời của các trang khác.

---

## 8. Hướng tối ưu & Refactor

Dưới đây là các giải pháp cụ thể giúp tối ưu hóa hệ thống cả về hiệu năng lẫn bảo mật:

### 8.1. Khắc phục Lazy Loading bằng Fetch Join
**Mục tiêu:** Nạp đầy đủ thông tin User và Role chỉ bằng **1 câu lệnh SQL JOIN duy nhất** và loại bỏ hoàn toàn `@Transactional` ở tầng UserDetailsService.

#### Code trước khi tối ưu (`UserRepository.java`):
```java
Optional<User> findByEmail(String email);
```

#### Code sau khi tối ưu (`UserRepository.java`):
```java
@Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email AND u.isDelete = false")
Optional<User> findByEmailWithRole(@Param("email") String email);
```

#### Cập nhật lại trong `CustomUserDetailsService.java`:
```java
@Override
// KHÔNG cần dùng @Transactional nữa!
public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmailWithRole(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + email));

    if (user.getIsActive() != null && !user.getIsActive()) {
        throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa.");
    }

    String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
    return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPasswordHash(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName)));
}
```
> [!TIP]
> **Hiệu quả:** Database chỉ chạy 1 câu query duy nhất với phép `INNER JOIN`. Connection được đóng ngay lập tức sau khi lấy xong dữ liệu, giải phóng tài nguyên cho Connection Pool (HikariCP).

---

### 8.2. Nâng cấp bảo mật Cookie (Chống CSRF & SameSite Configuration)
**Mục tiêu:** Cấu hình SameSite cho cookie để trình duyệt từ chối gửi cookie nếu request xuất phát từ một website của bên thứ ba, bảo vệ ứng dụng khỏi tấn công CSRF.

Vì class `jakarta.servlet.http.Cookie` tiêu chuẩn không hỗ trợ trực tiếp thuộc tính `SameSite`, chúng ta sẽ refactor bằng cách sử dụng lớp `ResponseCookie` của Spring Framework:

#### Code trước khi tối ưu (`AuthController.java`):
```java
Cookie access = new Cookie("accessToken", lr.getToken());
access.setHttpOnly(true);
access.setPath("/");
access.setMaxAge(3600);
response.addCookie(access);
```

#### Code sau khi tối ưu (`AuthController.java`):
```java
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

// Sử dụng ResponseCookie để hỗ trợ SameSite và Secure
ResponseCookie accessCookie = ResponseCookie.from("accessToken", lr.getToken())
        .httpOnly(true)
        .secure(true) // Chỉ cho phép truyền qua HTTPS (Bật lên ở môi trường Production)
        .path("/")
        .maxAge(3600)
        .sameSite("Lax") // Chống tấn công CSRF hiệu quả
        .build();

ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", lr.getRefreshToken())
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(7 * 24 * 3600)
        .sameSite("Lax")
        .build();

response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
```

---

### 8.3. Refactor SPA Navigation ở React
**Mục tiêu:** Thực hiện chuyển hướng trang trong React mà không làm reload lại toàn bộ trang web.

#### Code trước khi tối ưu (`AuthContext.js`):
```javascript
const clearAuth = (shouldRedirect = false) => {
  setUser(null);
  localStorage.removeItem("user");
  if (shouldRedirect) {
    window.location.href = "/";
  }
};
```

#### Code sau khi tối ưu:
Sử dụng hook `useNavigate()` hoặc cấu hình quản lý lịch sử chuyển hướng của `react-router-dom` thay vì can thiệp trực tiếp vào đối tượng `window` của trình duyệt. 

Do `AuthContext` nằm ngoài Router Provider trực tiếp, chúng ta có thể truyền hàm `navigate` từ component gọi nó, hoặc export một helper history hoặc đơn giản là xử lý chuyển hướng tại nơi bắt lỗi (ví dụ trong Axios Interceptor hoặc Component):

```javascript
// Sử dụng navigate của react-router-dom tại các component tiêu dùng (như Login, Profile)
// Hoặc tạo một custom event/history helper để AuthContext có thể điều hướng mượt mà:
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

// Trong clearAuth:
if (shouldRedirect) {
  history.push("/login");
}
```

---

## 9. Mindset của Senior Developer

Khi đọc và làm việc với codebase của module Xác thực (Authentication), một Senior Developer luôn đặt ra các câu hỏi phản biện cốt lõi và tư duy như sau:

1. **Stateful vs Stateless:** Hệ thống này có thực sự Stateless không?
   * *Câu trả lời:* Có, chúng ta đang dùng JWT và SessionPolicy là Stateless. Tuy nhiên, việc lưu JWT trong cookie cần cẩn trọng. Stateless nghĩa là Server không lưu trạng thái session. Nếu cần thu hồi token (ví dụ: đổi mật khẩu, bị mất máy), ta phải triển khai thêm một cơ chế Blacklist sử dụng Redis để lưu các token bị vô hiệu hóa trước thời hạn.
2. **Quản lý khóa bí mật (Secret Key Security):**
   * *Nguyên tắc:* Tuyệt đối không được hardcode khóa bí mật (`jwt.secret`) trong file cấu hình `application.yml` rồi đẩy lên Git repository công khai. Khóa này phải được nạp thông qua biến môi trường (Environment Variable) như `${JWT_SECRET}` ở môi trường Production.
3. **CORS và kiểm soát nguồn gốc:**
   * *Tư duy:* Không bao giờ dùng `allowedOrigins("*")` khi đã cấu hình `allowCredentials(true)`. Đây là một lỗ hổng bảo mật nghiêm trọng. Spring Security sẽ ném ngoại lệ nếu ta cố tình làm vậy. Luôn chỉ định chính xác danh sách domain của Client (ví dụ: `http://localhost:3000`, `https://agriai.phucnguyen.vn`).
4. **Exception Handling:**
   * *Tư duy:* Khi quá trình lọc JWT (`JwtAuthenticationFilter`) xảy ra lỗi (token hết hạn, format sai), ta không được để lộ stack trace chi tiết của Java ra ngoài API cho client, vì hacker có thể dựa vào đó để khai thác thông tin công nghệ hệ thống. Mọi lỗi phải được xử lý khéo léo thông qua `AuthenticationEntryPoint` để trả về format JSON chuẩn.

---

## 10. Kết luận cho feature

* **Tính năng:** Xác thực và Phân quyền sử dụng JWT lưu trong HttpOnly Cookie.
* **Đánh giá xếp hạng Codebase:** **Mid Level (Mức độ Trung bình - Khá)**.
* **Lý do đánh giá:**
  * **Điểm mạnh:** Đã biết áp dụng các chuẩn bảo mật tốt như lưu JWT trong HttpOnly Cookie để chống XSS, cấu hình Spring Security stateless bài bản, có cơ chế tự động refresh token bằng Axios Interceptor khá chuyên nghiệp. Có cấu trúc phân tầng rõ ràng.
  * **Điểm yếu:** Còn mắc các lỗi kinh điển về tối ưu Hibernate (Lazy Loading gây N+1 queries), cấu hình Cookie chưa thực sự an toàn tuyệt đối chống CSRF (thiếu thuộc tính SameSite và Secure), và sử dụng hard refresh (`window.location.href`) làm ảnh hưởng đến UX của ứng dụng SPA React.
  * **Độ Production-ready:** **85%**. Sau khi áp dụng các giải pháp Refactor ở mục 8 (Fetch Join, ResponseCookie SameSite, và cải tiến điều hướng React), tính năng này hoàn toàn sẵn sàng vận hành trên Production quy mô lớn một cách an toàn và tối ưu.
