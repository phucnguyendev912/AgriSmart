import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
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
 */
function LocationBootstrap() {
  useInitialLocationPrompt();
  return null;
}

/**
 * Root layout component — wraps all routes with shared UI and providers.
 */
function RootLayout() {
  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
      <ScrollToTop />
      <LocationBootstrap />
      <GlobalNotificationListener />
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <ChatBotWidget />
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/home",
        element: (
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        ),
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        path: "/farming-areas",
        element: (
          <RequireAuth>
            <FarmingAreaPage />
          </RequireAuth>
        ),
      },
      { path: "/diagnosis", element: <DiagnosisPage /> },
      {
        path: "/history",
        element: (
          <RequireAuth>
            <DiagnosisHistoryPage />
          </RequireAuth>
        ),
      },
      {
        path: "/history/:id",
        element: (
          <RequireAuth>
            <DiagnosisHistoryDetailPage />
          </RequireAuth>
        ),
      },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/warning-map", element: <DiseaseMapPage /> },
      {
        path: "/profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      { path: "/about", element: <AboutPage /> },
    ],
  },
]);

/**
 * Main Application Component
 */
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
