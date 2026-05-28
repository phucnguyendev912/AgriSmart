# Kế hoạch sửa đổi cấu trúc thư mục Frontend cho đúng guidelines

Tài liệu này đề xuất kế hoạch tái cấu trúc thư mục frontend (`agriai_frontend`) nhằm tuân thủ hoàn toàn hướng dẫn về cấu trúc thư mục, quy tắc đặt tên (Naming Conventions), chuyển tất cả các component có định dạng `.js` chứa JSX thành `.jsx`, di chuyển Auth pages thành feature module, đổi tên Navbar thành Header và quản lý import (Public API qua `index.js` của mỗi feature) đã được quy định trong [PROJECT_GUIDELINES.md](file:///d:/AgriAI/PROJECT_GUIDELINES.md).

---

## User Review Required

> [!IMPORTANT]
> - Việc đổi tên thư mục `src/features/farmingArea` thành `src/features/farming-area` (kebab-case) là bắt buộc theo quy định đặt tên thư mục của guidelines: `"Folder: kebab-case | Ví dụ: user-profile/"`.
> - Sửa đổi cách import của toàn bộ các trang (`App.jsx`, `DiagnosisPage.jsx`, `FarmingAreaPage.jsx`, v.v.) từ việc gọi trực tiếp các component con trong thư mục con của feature sang sử dụng export tập trung từ public API (`index.js`) của từng feature.
> - Chuyển toàn bộ các file chứa mã React JSX từ đuôi `.js` sang `.jsx` bao gồm: `App.js`, `App.test.js`, `index.js`, `AuthContext.js`, `LocationPermissionContext.js` và `ChatGreeting.js`.
> - Di chuyển `LoginPage.jsx` và `RegisterPage.jsx` từ `src/pages/` sang feature module mới `src/features/auth/components/` và xuất thông qua `src/features/auth/index.js`.
> - Đổi tên layout `Navbar.jsx` thành `Header.jsx` để đồng bộ đúng chuẩn quy định layout.

> [!NOTE]
> - Tạo thêm các thư mục trống `src/assets/images`, `src/assets/icons`, `src/assets/fonts` và `src/hooks/` để giữ tính cấu trúc lâu dài cho dự án.
> - Bổ sung file `.cursorrules` cho repo frontend (`agriai_frontend/.cursorrules`).

---

## Open Questions

> [!NOTE]
> Tất cả các câu hỏi đã được làm rõ và thống nhất với user:
> 1. Có chuyển các trang Auth (`LoginPage.jsx` và `RegisterPage.jsx`) thành feature module.
> 2. Có đổi tên layout `Navbar.jsx` thành `Header.jsx`.
> 3. Có đổi tất cả các file chứa JSX có đuôi `.js` thành đuôi `.jsx`.

---

## Proposed Changes

### [agriai_frontend]

#### [NEW] [frontend/.cursorrules](file:///d:/AgriAI/agriai_frontend/.cursorrules)
Tạo file `.cursorrules` cho frontend để hướng dẫn AI tuân thủ đúng context frontend.

#### [NEW] [assets/images/](file:///d:/AgriAI/agriai_frontend/src/assets/images)
#### [NEW] [assets/icons/](file:///d:/AgriAI/agriai_frontend/src/assets/icons)
#### [NEW] [assets/fonts/](file:///d:/AgriAI/agriai_frontend/src/assets/fonts)
#### [NEW] [hooks/](file:///d:/AgriAI/agriai_frontend/src/hooks)
Tạo cấu trúc các thư mục còn thiếu theo guidelines.

#### [NEW] [features/auth/index.js](file:///d:/AgriAI/agriai_frontend/src/features/auth/index.js)
File entry point xuất khẩu public cho module auth.

#### [RENAME] [features/farmingArea/](file:///d:/AgriAI/agriai_frontend/src/features/farmingArea) -> [features/farming-area/](file:///d:/AgriAI/agriai_frontend/src/features/farming-area)
Đổi tên thư mục thành kebab-case theo quy định.

#### [RENAME] [pages/LoginPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/LoginPage.jsx) -> [features/auth/components/LoginPage.jsx](file:///d:/AgriAI/agriai_frontend/src/features/auth/components/LoginPage.jsx)
Di chuyển trang đăng nhập vào module feature auth.

#### [RENAME] [pages/RegisterPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/RegisterPage.jsx) -> [features/auth/components/RegisterPage.jsx](file:///d:/AgriAI/agriai_frontend/src/features/auth/components/RegisterPage.jsx)
Di chuyển trang đăng ký vào module feature auth.

#### [RENAME] [layout/Navbar.jsx](file:///d:/AgriAI/agriai_frontend/src/layout/Navbar.jsx) -> [layout/Header.jsx](file:///d:/AgriAI/agriai_frontend/src/layout/Header.jsx)
Đổi tên layout Navbar thành Header.jsx và đổi tên React component bên trong thành Header.

#### [RENAME] [App.js](file:///d:/AgriAI/agriai_frontend/src/App.js) -> [App.jsx](file:///d:/AgriAI/agriai_frontend/src/App.jsx)
#### [RENAME] [App.test.js](file:///d:/AgriAI/agriai_frontend/src/App.test.js) -> [App.test.jsx](file:///d:/AgriAI/agriai_frontend/src/App.test.jsx)
#### [RENAME] [index.js](file:///d:/AgriAI/agriai_frontend/src/index.js) -> [index.jsx](file:///d:/AgriAI/agriai_frontend/src/index.jsx)
#### [RENAME] [context/AuthContext.js](file:///d:/AgriAI/agriai_frontend/src/context/AuthContext.js) -> [context/AuthContext.jsx](file:///d:/AgriAI/agriai_frontend/src/context/AuthContext.jsx)
#### [RENAME] [context/LocationPermissionContext.js](file:///d:/AgriAI/agriai_frontend/src/context/LocationPermissionContext.js) -> [context/LocationPermissionContext.jsx](file:///d:/AgriAI/agriai_frontend/src/context/LocationPermissionContext.jsx)
#### [RENAME] [features/chat/components/ChatGreeting.js](file:///d:/AgriAI/agriai_frontend/src/features/chat/components/ChatGreeting.js) -> [features/chat/components/ChatGreeting.jsx](file:///d:/AgriAI/agriai_frontend/src/features/chat/components/ChatGreeting.jsx)
Chuyển đổi đuôi các tệp chứa mã React JSX từ `.js` thành `.jsx`.

#### [MODIFY] [App.jsx](file:///d:/AgriAI/agriai_frontend/src/App.jsx)
Cập nhật import:
- `ChatBotWidget` từ `./features/chat`
- `Header` từ `./layout/Header` thay thế `Navbar`
- `LoginPage`, `RegisterPage` từ `./features/auth`
- `AuthContext` từ `./context/AuthContext` (đuôi `.jsx`)

#### [MODIFY] [FarmingAreaPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/FarmingAreaPage.jsx)
Cập nhật import `AddFarmingAreaModal` và `EditFarmingAreaModal` từ `../features/farming-area` thay vì trực tiếp.

#### [MODIFY] [DiagnosisPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisPage.jsx)
#### [MODIFY] [DiagnosisHistoryPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryPage.jsx)
#### [MODIFY] [DiagnosisHistoryDetailPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiagnosisHistoryDetailPage.jsx)
Cập nhật import các component chẩn đoán từ `../features/diagnosis` thay vì trực tiếp.

#### [MODIFY] [LandingPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/LandingPage.jsx)
#### [MODIFY] [HomePage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/HomePage.jsx)
Cập nhật import các component landing từ `../features/landing` thay vì trực tiếp.

#### [MODIFY] [DiseaseMapPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx)
Cập nhật import các component map từ `../features/map` thay vì trực tiếp.

---

## Thứ tự thực hiện (Task Breakdown)

### Bước 1: Khởi tạo các thư mục trống và tệp cấu hình
1. Tạo các thư mục `src/assets/images`, `src/assets/icons`, `src/assets/fonts` và `src/hooks`.
2. Tạo tệp `agriai_frontend/.cursorrules`.

### Bước 2: Chuyển đổi đuôi tệp chứa JSX thành `.jsx`
1. Đổi tên `App.js` -> `App.jsx`, `App.test.js` -> `App.test.jsx`.
2. Đổi tên `index.js` -> `index.jsx`.
3. Đổi tên `src/context/AuthContext.js` -> `src/context/AuthContext.jsx`.
4. Đổi tên `src/context/LocationPermissionContext.js` -> `src/context/LocationPermissionContext.jsx`.
5. Đổi tên `src/features/chat/components/ChatGreeting.js` -> `src/features/chat/components/ChatGreeting.jsx`.

### Bước 3: Đổi tên thư mục `farmingArea` thành `farming-area`
1. Đổi tên thư mục `src/features/farmingArea` thành `src/features/farming-area`.
2. Cập nhật đường dẫn import tương đối trong các tệp của `farming-area/`.

### Bước 4: Di chuyển Auth pages thành feature module
1. Tạo thư mục `src/features/auth/components/` và `src/features/auth/hooks/` (nếu cần).
2. Di chuyển `src/pages/LoginPage.jsx` -> `src/features/auth/components/LoginPage.jsx`.
3. Di chuyển `src/pages/RegisterPage.jsx` -> `src/features/auth/components/RegisterPage.jsx`.
4. Tạo `src/features/auth/index.js` để re-export `LoginPage` và `RegisterPage`.

### Bước 5: Đổi tên Navbar thành Header
1. Đổi tên `src/layout/Navbar.jsx` -> `src/layout/Header.jsx`.
2. Cập nhật tên component `Navbar` thành `Header` bên trong tệp `Header.jsx`.

### Bước 6: Cấu trúc lại imports tại các trang và App.jsx sang Public API
1. Cập nhật `App.jsx` để:
   - Sử dụng `Header` thay vì `Navbar`.
   - Import `LoginPage` và `RegisterPage` từ `./features/auth`.
   - Import `ChatBotWidget` từ `./features/chat`.
2. Cập nhật `FarmingAreaPage.jsx` để import modal từ `../features/farming-area`.
3. Cập nhật `DiagnosisPage.jsx`, `DiagnosisHistoryPage.jsx`, `DiagnosisHistoryDetailPage.jsx` để import từ `../features/diagnosis`.
4. Cập nhật `LandingPage.jsx`, `HomePage.jsx` để import từ `../features/landing`.
5. Cập nhật `DiseaseMapPage.jsx` để import từ `../features/map`.

---

## Verification Plan

### Automated Tests
- Chạy test suite của frontend:
  ```bash
  cd agriai_frontend
  npm test -- --watchAll=false
  ```
- Build thử ứng dụng frontend:
  ```bash
  npm run build
  ```

### Manual Verification
- Chạy local dev server bằng `npm start`.
- Truy cập vào ứng dụng và kiểm tra hoạt động của chatbot, các modal của vùng canh tác, chức năng chẩn đoán, bản đồ dịch bệnh xem có bất kỳ lỗi import nào không.

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Build: ✅ Success (npm run build)
- Tests: ✅ 5/5 test suites passed (11/11 tests)
- Date: 2026-05-27

