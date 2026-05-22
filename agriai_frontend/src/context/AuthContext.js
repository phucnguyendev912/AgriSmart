import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = "";

// Đặt cấu hình gửi Cookie mặc định cho tất cả các Axios requests
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(
    () => !localStorage.getItem("user")
  );

  const clearAuth = (shouldRedirect = false) => {
    setUser(null);
    localStorage.removeItem("user");
    if (shouldRedirect) {
      window.location.href = "/";
    }
  };

  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`);
      const userData = response.data.user || response.data.data;

      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("⚠️ response.data thiếu user:", response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuth();
      }
      console.error("Refresh token failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthToken();

    // Axios Interceptor for Response. (Bỏ Request Interceptor vì Cookie tự động gửi)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/auth/refresh-token")
        ) {
          originalRequest._retry = true;
          try {
            await axios.post(`${API_URL}/api/auth/refresh-token`);
            // Sau khi refresh, Cookie httponly mới đã được backend set lại tự động.
            // Chỉ cần gọi lại đúng request đó là đủ.
            return axios(originalRequest);
          } catch (refreshError) {
            clearAuth(true); // Token hết hạn hoàn toàn -> logout
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAuthToken]);

  const loginContext = (userData) => {
    // Token nằm trong HttpOnly cookie, frontend chỉ lưu user để giữ trạng thái UI.
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUserContext = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutContext = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginContext,
        updateUserContext,
        logoutContext,
        loading,
        refreshAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
