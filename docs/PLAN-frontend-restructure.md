# Tái cấu trúc thư mục Frontend & Đưa API về tầng Services dùng chung (Kết hợp cấu hình Cloudflare & Env)

Tài liệu này là sự kết hợp giữa kế hoạch tái cấu trúc thư mục frontend (`agriai_frontend`) nhằm tuân thủ [PROJECT_GUIDELINES.md](file:///d:/AgriAI/PROJECT_GUIDELINES.md), di chuyển các API về tầng `src/services`, và kế hoạch cấu hình API URL thích ứng linh hoạt giữa môi trường Local và Cloudflare Production (từ [PLAN-api-config-for-cloudflare.md](file:///d:/AgriAI/docs/PLAN-api-config-for-cloudflare.md)).

---

## Phản hồi từ Code Review & Giải pháp tích hợp

### 1. Tránh Circular Dependency trong `api.js` bằng cách Export `refreshToken` từ `api.js`
- **Giải pháp triệt để**:
  - `api.js` sẽ định nghĩa và xuất trực tiếp hàm `refreshToken()` sử dụng raw `axios` gốc.
  - `api.js` sẽ tự gọi hàm `refreshToken()` này trong response interceptor của mình khi gặp lỗi 401. Như vậy, `api.js` **không cần import bất kỳ thứ gì từ `authService.js`**.
  - `authService.js` sẽ import `api` (instance Axios chung) và `refreshToken` (được định nghĩa và xuất từ `api.js`) để sử dụng hoặc re-export.
  - Sơ đồ phụ thuộc (Dependency Graph): `authService.js` -> `api.js` (Một chiều, không vòng lặp).
  ```javascript
  // Trong src/services/api.js
  import axios from 'axios';
  
  export const api = axios.create({ ... });
  
  // Viết bằng raw axios để tránh import vòng lặp
  export const refreshToken = async () => {
    const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
    return response.data;
  };
  
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
       ...
       await refreshToken(); // Gọi trực tiếp
       ...
    }
  );
  ```

### 2. Đồng bộ trạng thái Auth độc lập với HttpOnly Cookie
- **Giải pháp**: Khi refresh token thất bại (nhận 401 hoặc 403), interceptor trong `api.js` sẽ tự dọn dẹp `localStorage.removeItem("user")` và chuyển hướng trình duyệt về `/` qua `window.location.href = "/"`. Các API request thành công sẽ tự động gửi cookie mà không cần thay đổi UI state nếu thông tin user chưa thay đổi.

### 3. Phân loại LocationPermissionModal
- **Giải pháp**: Di chuyển sang `src/components/ui/` do quy định guidelines phân loại Modal là thành phần phức hợp (ui), còn common chỉ dành cho các phần tử nguyên tử (atoms) như Button, Input.

### 4. Tách biệt Internal API (Backend) và External API (OpenStreetMap Nominatim)
- **Giải pháp**: Chỉ các request nội bộ đi qua Axios client chung (`api.js`). Hàm `reverseGeocode` (trong `weatherService.js`) gọi sang Nominatim API sẽ dùng `fetch` độc lập để bảo vệ thông tin Cookie nội bộ và tránh xung đột URL.

### 5. Kết hợp cấu hình môi trường Local vs Cloudflare (Production)
Dựa trên **Phương án 1 (Nginx Reverse Proxy)** trong `PLAN-api-config-for-cloudflare.md`:
- **Local Development**:
  - Sử dụng relative path `/api/...` trong code.
  - Phải đảm bảo khai báo `"proxy": "http://localhost:8080"` trong `agriai_frontend/package.json` (Đã xác minh là đang có sẵn). Điều này cấu hình cho React dev server proxy tất cả relative `/api/...` calls sang backend local, tránh lỗi 404 và CORS.
  - File `.env.development` sẽ được tạo với chú thích rõ ràng và biến để trống.
- **Production (Docker + Cloudflare)**:
  - Nginx trong Docker (`nginx.conf`) chịu trách nhiệm proxy `/api/` về container `backend:8080`.
  - File `.env.production` sẽ được tạo với chú thích rõ ràng và biến để trống.
  - Khi Docker build, `REACT_APP_API_URL` được truyền vào từ `docker-compose.yaml` (dưới dạng build args). Thiết lập biến này ở file `.env` root của dự án thành để trống.

---

## Proposed Changes

### [agriai_frontend]

#### [NEW] [.env.development](file:///d:/AgriAI/agriai_frontend/.env.development)
Cấu hình local phát triển sử dụng relative path (để CRA dev server proxy hoạt động):
```env
# Để trống — sử dụng relative path /api, proxy của CRA sẽ xử lý khi chạy local dev
REACT_APP_API_URL=
```

#### [NEW] [.env.production](file:///d:/AgriAI/agriai_frontend/.env.production)
Cấu hình production để trống để tự động nhận domain gốc thông qua Nginx Reverse Proxy:
```env
# Để trống — sử dụng relative path /api, Nginx reverse proxy sẽ xử lý trong container production
REACT_APP_API_URL=
```

#### [MODIFY] [package.json](file:///d:/AgriAI/agriai_frontend/package.json)
Xác minh và đảm bảo dòng sau có mặt để proxy local hoạt động:
```json
"proxy": "http://localhost:8080"
```

#### [NEW] [api.js](file:///d:/AgriAI/agriai_frontend/src/services/api.js)
Tạo Axios instance chung `api` cấu hình baseURL, credentials, chứa hàm `refreshToken` (dùng raw axios) được export, và cài đặt Response Interceptor tự động refresh token.

#### [NEW] [authService.js](file:///d:/AgriAI/agriai_frontend/src/services/authService.js)
Tập trung các chức năng auth: `login`, `register`, `logout`. Import và re-export `refreshToken` từ `api.js`.

#### [NEW] [userService.js](file:///d:/AgriAI/agriai_frontend/src/services/userService.js)
Tập trung chức năng quản lý user: `updateProfile`.

#### [NEW] [farmingAreaService.js](file:///d:/AgriAI/agriai_frontend/src/services/farmingAreaService.js)
Tập trung các API cho farming areas: `getAreas`, `createArea`, `updateArea`, `deleteArea`.

#### [NEW] [diseaseMapService.js](file:///d:/AgriAI/agriai_frontend/src/services/diseaseMapService.js)
Tập trung các API bản đồ dịch bệnh: `getMarkers`, `getDiseases`.

#### [NEW] [diagnosisService.js](file:///d:/AgriAI/agriai_frontend/src/services/diagnosisService.js)
Tập trung các API chẩn đoán bệnh: `getCropTypes`, `submitDiagnosis`, `getHistory`, `getDiagnosisDetail`, `getReview`, `submitReview`, `getAllReviews`.

#### [NEW] [chatService.js](file:///d:/AgriAI/agriai_frontend/src/services/chatService.js)
Thay thế `chatApi.js`, tích hợp Axios instance chung để gọi các API chat bot.

#### [NEW] [weatherService.js](file:///d:/AgriAI/agriai_frontend/src/services/weatherService.js)
Thay thế `weatherApi.js`, chuyển phần API nội bộ sang sử dụng Axios instance chung. Hàm `reverseGeocode` bên ngoài vẫn dùng fetch độc lập.

#### [DELETE] [chatApi.js](file:///d:/AgriAI/agriai_frontend/src/services/chatApi.js)
#### [DELETE] [weatherApi.js](file:///d:/AgriAI/agriai_frontend/src/services/weatherApi.js)

#### [NEW] [index.js (features/chat)](file:///d:/AgriAI/agriai_frontend/src/features/chat/index.js)
#### [NEW] [index.js (features/diagnosis)](file:///d:/AgriAI/agriai_frontend/src/features/diagnosis/index.js)
#### [NEW] [index.js (features/farmingArea)](file:///d:/AgriAI/agriai_frontend/src/features/farmingArea/index.js)
#### [NEW] [index.js (features/landing)](file:///d:/AgriAI/agriai_frontend/src/features/landing/index.js)
#### [NEW] [index.js (features/map)](file:///d:/AgriAI/agriai_frontend/src/features/map/index.js)

#### [MODIFY] [LocationPermissionModal.jsx](file:///d:/AgriAI/agriai_frontend/src/components/ui/LocationPermissionModal.jsx) (Di chuyển từ common sang ui)
#### [MODIFY] [AuthContext.js](file:///d:/AgriAI/agriai_frontend/src/context/AuthContext.js)
#### [MODIFY] Cập nhật các Pages và Components gọi API để dùng tầng Services tập trung.

### [Root Config]

#### [MODIFY] [.env (root)](file:///d:/AgriAI/.env)
Cập nhật biến môi trường build frontend để trống trong môi trường Docker Production nhằm kích hoạt Nginx Proxy tự động:
```env
REACT_APP_API_URL=
```

---

## Thứ tự thực hiện (Task Breakdown)

### Bước 1: Khởi tạo cấu hình và API Client
1. Tạo file `.env.development` và `.env.production` tại root frontend.
2. Cập nhật file `.env` root của toàn dự án thành `REACT_APP_API_URL=` (để trống) để Docker Compose build cho môi trường production đi qua Nginx proxy.
3. Tạo file `src/services/api.js` với Axios instance, định nghĩa và xuất hàm `refreshToken()`, cài đặt response interceptor độc lập (không import `authService`).

### Bước 2: Tạo các file Service dùng chung
1. Tạo các file service tập trung trong `src/services/`: `authService.js` (import và re-export `refreshToken` từ `api.js`), `userService.js`, `farmingAreaService.js`, `diseaseMapService.js`, `diagnosisService.js`, `chatService.js`, `weatherService.js`.

### Bước 3: Di chuyển cấu trúc thư mục & Tạo các feature exports
1. Di chuyển `LocationPermissionModal.jsx` sang `src/components/ui/`.
2. Tạo các file `index.js` cho từng feature (`chat`, `diagnosis`, `farmingArea`, `landing`, `map`).

### Bước 4: Di chuyển từng Page/Component theo tính năng (Incremental Migration)
1. Cập nhật `AuthContext.js` sử dụng `authService` và dọn dẹp interceptor cũ.
2. Cập nhật `ChatBotWidget.jsx` dùng `chatService` và chỉnh sửa import qua feature entry.
3. Cập nhật `LoginPage.jsx` và `RegisterPage.jsx` dùng `authService`.
4. Cập nhật `ProfilePage.jsx` dùng `userService`.
5. Cập nhật `FarmingAreaPage.jsx` và các modal vùng canh tác dùng `farmingAreaService`.
6. Cập nhật `DiseaseMapPage.jsx` dùng `diseaseMapService`.
7. Cập nhật `DiagnosisPage.jsx`, `DiagnosisHistoryPage.jsx`, `DiagnosisHistoryDetailPage.jsx`, `DiagnosisRatingModal.jsx` và `FarmerReviews.jsx` dùng `diagnosisService`.

### Bước 5: Kiểm thử và Dọn dẹp
1. Chạy thử `npm test` và `npm run build` để kiểm tra.
2. Xóa các file cũ `chatApi.js` và `weatherApi.js` sau khi chắc chắn không còn tham chiếu nào.

---

## Verification Plan

### Automated Tests
- Chạy toàn bộ test suite hiện có của frontend để kiểm tra sự ổn định:
  ```bash
  cd agriai_frontend
  npm test
  ```
- Build thử ứng dụng frontend ở cả môi trường local và production:
  ```bash
  npm run build
  ```

### Manual Verification
1. Khởi chạy thử local (`npm start`), xác nhận các API login, chatbot, bản đồ và chẩn đoán chạy bình thường qua proxy.
2. Chạy ứng dụng qua Docker Compose (`docker-compose up -d --build`) và kiểm tra tính năng qua cổng Nginx 3000 (Local Production).
