# AgriSmart - Hệ thống hỗ trợ chẩn đoán và quản lý nông nghiệp thông minh

Dự án AgriSmart là một ứng dụng toàn diện giúp chẩn đoán bệnh cây trồng, đề xuất giải pháp điều trị và cung cấp bản đồ phân bố dịch bệnh dựa trên công nghệ AI. 

Hệ thống được tổ chức dưới dạng monorepo bao gồm:
1. **`agriai_backend`**: Hệ thống Spring Boot (Java 17 / Maven) xử lý logic nghiệp vụ và tích hợp AI.
2. **`agriai_frontend`**: Ứng dụng React (Vite / npm) dành cho người dùng cuối.
3. **`agriai_admin_frontend`**: Trang quản trị React (Vite / npm) dành cho Admin.
4. **`nginx_gateway`**: Reverse Proxy phân phối lưu lượng giữa các dịch vụ.

---

## 🛠️ Hướng dẫn Chạy Dự án bằng Docker

Dự án hỗ trợ 2 môi trường Docker Compose chính nằm tại thư mục gốc:

### 1. Môi trường Development (`docker-compose.yaml`)
Sử dụng cho lập trình viên để chạy thử hoặc debug cục bộ.
- Có bật cổng debug remote `5005` cho backend Java.
- Khởi động cơ sở dữ liệu PostgreSQL 18 và nạp dữ liệu từ `init.sql`.

```bash
docker compose up --build -d
```

### 2. Môi trường Production (`docker-compose.prod.yaml`)
Dành cho việc triển khai thực tế trên môi trường sản xuất (Production).
- Các container giao diện được cấu hình qua Nginx tối ưu và gzip.
- Đi kèm với cổng `nginx-gateway` điều phối cổng HTTP (`80`) và HTTPS (`443`).

Để chạy môi trường production với các container đã được build sẵn từ registry:
```bash
docker compose -f docker-compose.prod.yaml up -d
```

---

## 🚀 Hệ thống CI/CD với Docker (GitHub Actions)

Dự án đã được tích hợp quy trình tích hợp và phân phối liên tục (CI/CD) tự động qua **GitHub Actions** và **GitHub Container Registry (GHCR)**.

### 1. Luồng kiểm tra tự động (CI - Code Validation)
Được cấu hình trong `.github/workflows/ci.yml`.
- **Kích hoạt:** Tự động chạy khi có sự kiện Push hoặc Pull Request tới các nhánh `main` và `develop`.
- **Nhiệm vụ:**
  - Build và chạy toàn bộ unit test của backend Spring Boot.
  - Cài đặt thư viện và build kiểm tra giao diện người dùng `agriai_frontend`.
  - Cài đặt thư viện và build kiểm tra giao diện quản trị `agriai_admin_frontend`.

### 2. Luồng đóng gói & Phát hành (CD - Docker Push)
Được cấu hình trong `.github/workflows/cd.yml`.
- **Kích hoạt:** **Chỉ chạy khi có sự kiện Push hoặc Merge thành công vào nhánh `main`**.
- **Nhiệm vụ:** Tự động build Docker image cho cả 3 phân hệ theo chuẩn Production và phát hành lên GitHub Container Registry (GHCR).

Các Docker image được xuất bản tại:
- **Backend:** `ghcr.io/djwin2609/agrismart/agriai-backend:latest`
- **User Frontend:** `ghcr.io/djwin2609/agrismart/agriai-frontend:latest`
- **Admin Frontend:** `ghcr.io/djwin2609/agrismart/agriai-admin-frontend:latest`

*Lưu ý: Các image cũng được đánh thẻ (tag) theo mã commit SHA để dễ dàng rollback khi gặp sự cố.*

---

## 📥 Hướng dẫn kéo Docker image từ GHCR

Để sử dụng các image chính thức từ GitHub Container Registry trên VPS/Server của bạn:

1. **Đăng nhập vào GHCR** bằng GitHub Personal Access Token (PAT) có quyền `read:packages`:
   ```bash
   echo <YOUR_GITHUB_TOKEN> | docker login ghcr.io -u <YOUR_GITHUB_USERNAME> --password-stdin
   ```

2. **Kéo image mới nhất:**
   ```bash
   docker pull ghcr.io/phucnguyendev912/agrismart/agriai-backend:latest
   docker pull ghcr.io/phucnguyendev912/agrismart/agriai-frontend:latest
   docker pull ghcr.io/phucnguyendev912/agrismart/agriai-admin-frontend:latest
   ```

3. **Cập nhật `docker-compose.prod.yaml`** (nếu deploy bằng file compose): Thay đổi trường `image` của các service tương ứng thành các đường dẫn GHCR trên.
