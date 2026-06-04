import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminLayout from './layout/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import DiseaseManagementPage from './pages/DiseaseManagementPage';
import CropTypeManagementPage from './pages/CropTypeManagementPage';

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang login — public */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Các trang admin — yêu cầu đăng nhập */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="diseases" element={<DiseaseManagementPage />} />
            <Route path="crop-types" element={<CropTypeManagementPage />} />
            <Route path="treatment-plans" element={<div className="p-8">Quản lý phác đồ</div>} />
            <Route path="ingredients" element={<div className="p-8">Quản lý thành phần</div>} />
            <Route path="drugs" element={<div className="p-8">Quản lý thuốc</div>} />
            <Route path="drug-interactions" element={<div className="p-8">Quản lý tương tác thuốc</div>} />
            <Route path="ai-performance" element={<div className="p-8">Quản lý hiệu suất AI</div>} />
            <Route path="diagnosis-reviews" element={<div className="p-8">Quản lý đánh giá chẩn đoán</div>} />
            <Route path="attachments" element={<div className="p-8">Quản lý tệp đính kèm</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;

