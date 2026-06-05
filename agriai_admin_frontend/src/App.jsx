import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminLayout from './layout/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import DiseaseManagementPage from './pages/DiseaseManagementPage';
import CropTypeManagementPage from './pages/CropTypeManagementPage';
import TreatmentPlanManagementPage from './pages/TreatmentPlanManagementPage';
import DrugManagementPage from './pages/DrugManagementPage';
import AttachmentManagementPage from './pages/AttachmentManagementPage';
import IngredientManagementPage from './pages/IngredientManagementPage';
import DrugInteractionManagementPage from './pages/DrugInteractionManagementPage';
import WeatherConditionManagementPage from './pages/WeatherConditionManagementPage';

import ReviewManagementPage from './pages/ReviewManagementPage';

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
            <Route path="treatment-plans" element={<TreatmentPlanManagementPage />} />
            <Route path="ingredients" element={<IngredientManagementPage />} />
            <Route path="drugs" element={<DrugManagementPage />} />
            <Route path="drug-interactions" element={<DrugInteractionManagementPage />} />
            <Route path="weather-conditions" element={<WeatherConditionManagementPage />} />
            <Route path="ai-performance" element={<div className="p-8">Quản lý hiệu suất AI</div>} />
            <Route path="diagnosis-reviews" element={<ReviewManagementPage />} />
            <Route path="attachments" element={<AttachmentManagementPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;

