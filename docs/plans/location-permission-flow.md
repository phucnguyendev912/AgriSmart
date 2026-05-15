# Location Permission Flow

## Mo ta yeu cau

- Khi nguoi dung truy cap web lan dau trong phien hien tai, trinh duyet se hoi quyen truy cap vi tri.
- Neu nguoi dung tu choi, website van hoat dong binh thuong.
- Khi nguoi dung vao hoac thao tac voi chuc nang can vi tri, he thong se double check bang popup trong app.
- Neu nguoi dung tiep tuc tu choi, chuc nang van chay nhung khong gui toa do.

## File se tao / sua

- Tao `agriai_frontend/src/context/LocationPermissionContext.js`
- Tao `agriai_frontend/src/layout/InitialLocationPrompt.jsx`
- Tao `agriai_frontend/src/components/common/LocationPermissionModal.jsx`
- Sua `agriai_frontend/src/index.js`
- Sua `agriai_frontend/src/App.js`
- Sua `agriai_frontend/src/pages/DiagnosisPage.jsx`
- Sua `agriai_frontend/src/features/landing/components/WeatherDiseaseSection.jsx`

## Thu tu thuc hien

1. Tao context dung chung de quan ly trang thai GPS va ham `requestLocation`.
2. Boc app bang `LocationProvider`.
3. Them component hoi quyen vi tri lan dau o cap app.
4. Tao modal double check khi vao chuc nang can vi tri.
5. Cap nhat trang chan doan de dung context thay vi tu goi GPS rieng.
6. Cap nhat section thoi tiet de dung context va chi xin GPS khi nguoi dung dong y.
7. Kiem tra build/test frontend.
