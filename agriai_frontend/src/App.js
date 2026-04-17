import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmingAreaPage from './pages/FarmingAreaPage';
import DiagnosisPage from './pages/DiagnosisPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      {/* Nơi chứa toàn bộ nội dung của ứng dụng */}
      <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
        <Navbar />
        {/* Nơi chuyển đổi nội dung giữa các Trang */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/farming-areas" element={<FarmingAreaPage />} />
            <Route path="/diagnosis" element={<DiagnosisPage />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </Router>
  );
}

export default App;
