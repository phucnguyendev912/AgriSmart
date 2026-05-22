import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import InitialLocationPrompt from "./layout/InitialLocationPrompt";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";

/**
 * Route guard component that redirects unauthenticated users to the landing page.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Guarded component routes.
 */
const RequireAuth = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Main Application Component
 * Sets up routing, providers, navigation layout, global modal listeners,
 * and toast notification container.
 */
function App() {
  return (
    <HelmetProvider>
      <Router>
        <InitialLocationPrompt />
        <GlobalNotificationListener />
        {/* Main application layout wrapper */}
        <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
          <Navbar />
          {/* Router view container */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/home"
                element={
                  <RequireAuth>
                    <HomePage />
                  </RequireAuth>
                }
              />
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
