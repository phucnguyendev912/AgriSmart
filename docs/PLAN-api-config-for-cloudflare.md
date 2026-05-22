# Config API URL cho Frontend chạy được ở Localhost và Cloudflare (Domain)

## Yêu cầu và Hiện trạng
- **Vấn đề**: Hiện tại Frontend (React) đang gọi trực tiếp vào `http://localhost:8080`. Khi chạy qua Cloudflare (có domain), trình duyệt của người dùng truy cập trang web qua domain nhưng lại gọi API tới `localhost:8080` của máy họ, dẫn đến lỗi không gọi được API.
- **Mục tiêu**: Thay đổi cách thiết lập URL của API sao cho Frontend có thể chạy mượt mà ở cả môi trường `localhost` (dev) và trên Cloudflare Domain (production).

---

## 🔴 Cần người dùng Review (Socratic Gate)

> [!IMPORTANT]
> **Vui lòng trả lời các câu hỏi sau để chốt phương án:**
> 1. Frontend và Backend của bạn có đang dùng chung một domain trên Cloudflare không? (Ví dụ: truy cập web ở `https://app.domain.com` và gọi API qua đường dẫn `https://app.domain.com/api/...`)
> 2. Hay Backend của bạn được Cloudflare trỏ sang một domain phụ khác? (Ví dụ: Frontend là `app.domain.com` và Backend là `api.domain.com`)

Dưới đây là 2 phương án tùy thuộc vào mô hình Cloudflare của bạn:

---

## Các Phương án Đề xuất

### Phương án 1: Dùng Nginx Reverse Proxy (Khuyên dùng cho Docker / Cùng 1 Domain)
*Phương pháp này biến mọi request gọi tới Frontend có tiền tố `/api` sẽ được Nginx tự động đẩy sang Backend. Code Frontend không cần biết nó đang chạy ở domain nào hay localhost.*

#### Các bước triển khai:
1. **Sửa Nginx config của Frontend** (`agriai_frontend/nginx.conf`):
   Thêm proxy cấu hình vào Nginx:
   ```nginx
   location /api/ {
       proxy_pass http://backend:8080/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```
2. **Sửa URL gọi API trong React code**:
   Đồng loạt tìm và thay thế tất cả những đoạn `const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';` thành `/api` (hoặc để trống url base để nó nối tự động thành đường dẫn tương đối).
3. **Cấu hình Cloudflare Tunnel**:
   Chỉ cần thiết lập Cloudflare Tunnel trỏ về service `frontend` (port 3000). Nó sẽ phục vụ cả trang web lẫn API.

---

### Phương án 2: Sử dụng Environment Variables lúc Build (Nếu Backend khác Domain)
*Nếu Backend của bạn có một Public URL riêng biệt qua Cloudflare Tunnel (VD: `https://api.my-agri-app.com`).*

#### Các bước triển khai:
1. **Tạo file `.env` ở Frontend**:
   Bạn tạo file `.env` chứa `REACT_APP_API_URL=https://api.my-agri-app.com`.
2. **Docker Compose Build**:
   Khi build `docker-compose up -d --build`, Docker sẽ đọc `REACT_APP_API_URL` và nhúng thẳng URL Cloudflare này vào mã nguồn JS.
   (Nhược điểm: Khi bạn test ở localhost, mã JS vẫn sẽ gọi lên `https://api.my-agri-app.com` thay vì localhost:8080, trừ khi bạn maintain 2 cấu hình build khác nhau).
3. **Tập trung file cấu hình (Refactor)**:
   Thay vì lặp lại `process.env.REACT_APP_API_URL || 'http://localhost:8080'` trong từng file (như `DiagnosisRatingModal.jsx`, `chatApi.js`, v.v.), chúng ta sẽ gom chung lại vào `src/services/api.js` (tạo `axios instance`).

---

## Kế hoạch Thực hiện (Task Breakdown)

Ngay sau khi bạn chốt phương án, các bước sẽ được thực thi:

- [ ] (Refactor) Tạo/sửa `src/services/api.js` (hoặc cấu hình Axios global) để quy định BASE_URL ở một nơi duy nhất.
- [ ] (Sửa Code) Cập nhật toàn bộ các file `*.js/jsx` đang hardcode `http://localhost:8080` (như `chatApi.js`, `weatherApi.js`, `DiagnosisRatingModal.jsx`, `LoginPage.jsx`...) để sử dụng cái chung.
- [ ] (Cấu hình) Nếu bạn chọn **Phương án 1**, sửa file `agriai_frontend/nginx.conf`.
- [ ] (Cấu hình) Nếu bạn chọn **Phương án 2**, thiết lập biến môi trường và cập nhật file `docker-compose.yaml`.

---

**Bạn muốn áp dụng Phương án 1 (Nginx Proxy - Cùng Domain) hay Phương án 2 (Environment Variables - Khác Domain)?**
