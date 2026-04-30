import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FarmingAreaPage from "./pages/FarmingAreaPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import DiagnosisHistoryPage from "./pages/DiagnosisHistoryPage";
import DiagnosisHistoryDetailPage from "./pages/DiagnosisHistoryDetailPage";
import NotificationsPage from "./pages/NotificationsPage";
import DiseaseMapPage from "./pages/DiseaseMapPage";
import ProfilePage from "./pages/ProfilePage";
import ChatBotWidget from "./features/chat/components/ChatBotWidget";
import GlobalNotificationListener from "./layout/GlobalNotificationListener";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <GlobalNotificationListener />
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
              <Route path="/history" element={<DiagnosisHistoryPage />} />
              <Route
                path="/history/:id"
                element={<DiagnosisHistoryDetailPage />}
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/warning-map" element={<DiseaseMapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
          <ChatBotWidget />
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
          />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
