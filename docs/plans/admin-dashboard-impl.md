# Kế hoạch Triển khai Admin Dashboard

## Tổng quan
Triển khai **Admin Dashboard v1** cho `agriai_admin_frontend` và backend API `/api/admin/dashboard`. Phạm vi của Dashboard bao gồm toàn bộ trang tổng quan: các thẻ thống kê, biểu đồ (dùng Recharts), hoạt động chẩn đoán gần đây, các loại cây và bệnh phổ biến nhất, các đánh giá mới nhất, xu hướng độ chính xác của AI và các thao tác nhanh. Chu kỳ báo cáo mặc định là **30 ngày gần nhất**.

## Thay đổi ở Backend
- Thêm các file liên quan đến Admin Dashboard vào backend hiện tại:
  - `controller/admin/AdminDashboardController.java`
  - `service/admin/AdminDashboardService.java`
  - `dto/response/admin/AdminDashboardResponse.java`
- Thêm API endpoint:
  - `GET /api/admin/dashboard?periodDays=30`
- Bảo vệ endpoint bằng quy tắc bảo mật hiện có:
  - `/api/admin/** -> ROLE_ADMIN`
- Payload API trả về sẽ bao gồm:
  - Thẻ thống kê: tổng số user, user hoạt động, tổng lượt chẩn đoán, lượt chẩn đoán trong chu kỳ, tổng đánh giá, % độ chính xác của AI, điểm đánh giá trung bình, độ tin cậy trung bình.
  - Xu hướng chẩn đoán: số lượng mỗi ngày.
  - Xu hướng độ chính xác của AI: số đánh giá đúng/sai mỗi ngày.
  - Phân bổ cây trồng: tên loại cây + số lượng.
  - Bệnh phổ biến: tên bệnh + số lượng + độ tin cậy trung bình.
  - Hoạt động gần đây: danh sách lịch sử chẩn đoán mới nhất (user, cây, bệnh, độ tin cậy, trạng thái, thời gian).
  - Đánh giá mới nhất: user, đúng/sai, số sao, nội dung, thời gian.
- Thêm các câu truy vấn `@Query` trong các Repository để gom nhóm dữ liệu (aggregation):
  - Đếm user chưa bị xóa (`isDelete = false`).
  - Đếm user đang hoạt động (`isActive = true`).
  - Đếm lịch sử chẩn đoán trong khoảng thời gian.
  - Nhóm dữ liệu chẩn đoán theo ngày, theo loại cây.
  - Nhóm chi tiết chẩn đoán theo bệnh.
  - Tính trung bình độ tin cậy, tỷ lệ chính xác.
  - Lấy danh sách chẩn đoán và đánh giá mới nhất.
- Nguyên tắc thiết kế Service:
  - Controller chỉ nhận tham số `periodDays`.
  - Service chịu trách nhiệm xử lý logic thời gian, gọi repository, và map sang DTO.
  - Chỉ ném lỗi `AppException` với các tham số không hợp lệ (VD: `periodDays < 1` hoặc `> 365`).

## Thay đổi ở Frontend
- Cài đặt thêm thư viện vào `agriai_admin_frontend`:
  - `axios` (gọi API)
  - `recharts` (vẽ biểu đồ)
- Cài đặt cấu hình API dùng chung:
  - `src/services/api.js`: tạo Axios instance với JWT interceptor, bắt lỗi `401/403`.
  - `src/services/endpoints.js`: khai báo endpoint `ADMIN_DASHBOARD`.
- Cấu trúc lại Dashboard theo kiến trúc thư mục Feature:
  - `src/features/dashboard/dashboardService.js`
  - `src/features/dashboard/useDashboard.js`
  - Các Component giao diện: `DashboardStatCards.jsx`, `DiagnosisTrendChart.jsx`, `AccuracyTrendChart.jsx`, `CropDistributionChart.jsx`, `TopDiseasesTable.jsx`, `RecentDiagnosisTable.jsx`, `LatestReviewsPanel.jsx`, `DashboardQuickActions.jsx`.
- Cập nhật trang `src/pages/DashboardPage.jsx`:
  - Gọi hook `useDashboard(30)`.
  - Hiển thị UI khi đang tải (loading) và khi lỗi (error).
  - Gắn dữ liệu API thực tế thay cho dữ liệu mẫu.
  - Xử lý lỗi font tiếng Việt hiển thị chưa chuẩn hiện hành.
- Quy định sử dụng Recharts:
  - `LineChart` hoặc `AreaChart` cho xu hướng chẩn đoán.
  - `BarChart` cho xu hướng độ chính xác AI.
  - `PieChart` cho phân bổ cây trồng.
- Giao diện Responsive:
  - Thẻ thống kê: 1 cột (Mobile), 2 cột (Tablet), 4 cột (Desktop).
  - Biểu đồ: Xếp dọc trên Mobile, chia 2 cột trên Desktop.
  - Bảng: Bật cuộn ngang (overflow-x) trên màn hình nhỏ.

## API Contract (Cấu trúc Response)
`GET /api/admin/dashboard?periodDays=30`

```json
{
  "summary": {
    "totalUsers": 0,
    "activeUsers": 0,
    "totalDiagnoses": 0,
    "diagnosesInPeriod": 0,
    "totalReviews": 0,
    "accuracyPercent": 0,
    "averageRating": 0,
    "averageConfidence": 0
  },
  "diagnosisTrend": [
    { "date": "2026-05-18", "count": 0 }
  ],
  "accuracyTrend": [
    { "date": "2026-05-18", "accurate": 0, "inaccurate": 0 }
  ],
  "cropDistribution": [
    { "cropTypeName": "Lúa", "count": 0 }
  ],
  "topDiseases": [
    { "diseaseName": "Đạo ôn", "count": 0, "averageConfidence": 0 }
  ],
  "recentDiagnoses": [
    {
      "id": 0,
      "userName": "",
      "cropTypeName": "",
      "diseaseName": "",
      "confidence": 0,
      "status": "COMPLETED",
      "createdAt": ""
    }
  ],
  "latestReviews": [
    {
      "id": 0,
      "userName": "",
      "accurate": true,
      "rating": 5,
      "feedback": "",
      "createdAt": ""
    }
  ]
}
```

## Kế hoạch Kiểm thử (Test Plan)
- **Backend**:
  - API từ chối các user không có quyền Admin.
  - Nếu không truyền `periodDays`, mặc định là `30`.
  - Tham số không hợp lệ trả về lỗi chuẩn.
  - Nếu DB trống, trả về mảng rỗng và count = 0 thay vì lỗi Null.
  - Dữ liệu bị xóa mềm (soft-deleted) không được tính.
  - Tránh lỗi chia cho 0 khi tính % độ chính xác.
- **Frontend**:
  - Render đủ các trạng thái loading, error, empty, và populated.
  - Axios tự động đính kèm token.
  - Lỗi `401` chuyển hướng về trang đăng nhập.
  - Giao diện không bị vỡ trên Mobile/Tablet.
