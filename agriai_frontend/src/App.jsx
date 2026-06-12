import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./layout/Header";
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
import AboutPage from "./pages/AboutPage";
import { ChatBotWidget } from "./features/chat";
import GlobalNotificationListener from "./context/GlobalNotificationListener";
import useInitialLocationPrompt from "./hooks/useInitialLocationPrompt";
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
 * Helper component to scroll the window to the top whenever the route changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Bootstraps the one-time location permission prompt via hook.
 * Extracted as a component so hooks can be called inside the Router context.
 */
function LocationBootstrap() {
  useInitialLocationPrompt();
  return null;
}

/**
 * Main Application Component
 * Sets up routing, providers, navigation layout, global modal listeners,
 * and toast notification container.
 */
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <Router>
        <ScrollToTop />
        <LocationBootstrap />
        <GlobalNotificationListener />
        {/* Main application layout wrapper */}
        <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
          <Header />
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
              <Route
                path="/farming-areas"
                element={
                  <RequireAuth>
                    <FarmingAreaPage />
                  </RequireAuth>
                }
              />
              <Route path="/diagnosis" element={<DiagnosisPage />} />
              <Route
                path="/history"
                element={
                  <RequireAuth>
                    <DiagnosisHistoryPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/history/:id"
                element={
                  <RequireAuth>
                    <DiagnosisHistoryDetailPage />
                  </RequireAuth>
                }
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/warning-map" element={<DiseaseMapPage />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <ProfilePage />
                  </RequireAuth>
                }
              />
              <Route path="/about" element={<AboutPage />} />
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
    </GoogleOAuthProvider>
  );
}

export default App;
