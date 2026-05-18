import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Add other routes here as they are developed */}
          <Route path="users" element={<div className="p-8">Quản lý người dùng</div>} />
          <Route path="diseases" element={<div className="p-8">Quản lý bệnh cây trồng</div>} />
          <Route path="crop-types" element={<div className="p-8">Quản lý loại cây</div>} />
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
  );
}

export default App;
