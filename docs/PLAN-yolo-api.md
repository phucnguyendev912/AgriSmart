# Cấu hình Kết nối YOLO API (Model) cho Localhost và Production

## Hiện trạng và Yêu cầu
- **Yêu cầu**: Cập nhật cấu hình gọi API của model (`/predict`) sao cho vừa chạy được ở localhost vừa chạy được trên production.
- **Hiện trạng**:
  - Model YOLO (`rice-disease-api`) đã được host trên một tên miền riêng: `https://rice-disease-api.indevs.in/docs`.
  - Trên production, API endpoint của model là: `https://rice-disease-api.indevs.in/predict`.
  - Trên localhost, model YOLO chạy trên Docker ở cổng `8010:8010`.
  - Backend đang có cấu hình cứng `VISION_AI_URL: http://host.docker.internal:8010/predict` trong `docker-compose.yaml`.

---

## Giải pháp Đề xuất

### 1. Cấu hình Docker Compose (`docker-compose.yaml`)
- Chuyển `VISION_AI_URL` của container `backend` sang dạng biến môi trường động để có thể ghi đè bằng file `.env`:
  `VISION_AI_URL: ${VISION_AI_URL:-http://host.docker.internal:8010/predict}`
- Thêm `extra_hosts` cho container `backend` để phân giải được `host.docker.internal` trên môi trường Linux (Localhost Docker):
  ```yaml
  extra_hosts:
    - "host.docker.internal:host-gateway"
  ```

### 2. Cấu hình file `.env` và `.env.example`
Thêm cấu hình `VISION_AI_URL` để dễ dàng chuyển đổi giữa các môi trường:
- **Localhost (.env)**:
  `VISION_AI_URL=http://host.docker.internal:8010/predict`
- **Production (.env)**:
  `VISION_AI_URL=https://rice-disease-api.indevs.in/predict`

---

## Kế hoạch Thực hiện (Task Breakdown)

- [ ] **Bước 1**: Cập nhật `docker-compose.yaml` để sử dụng biến `VISION_AI_URL` từ file `.env` kèm `extra_hosts` cho `backend`.
- [ ] **Bước 2**: Thêm cấu hình mẫu vào `.env.example` ở root và backend.
- [ ] **Bước 3**: Thêm biến cấu hình `VISION_AI_URL` vào file `.env` hiện tại.
- [ ] **Bước 4**: Hướng dẫn người dùng chạy lại container và kiểm tra.


