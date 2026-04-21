import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken"),
  );
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Chỉ loading khi chưa có dữ liệu local
  const [loading, setLoading] = useState(
    () =>
      !(localStorage.getItem("accessToken") && localStorage.getItem("user")),
  );

  const clearAuth = (shouldRedirect = false) => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (shouldRedirect) {
      window.location.href = "/";
    }
  };

  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true },
      );
      console.log("Refresh token response:", response.data);
      const newToken = response.data.token || response.data.accessToken;
      const userData = response.data.user || response.data.data;
      console.log("newToken:", newToken);
      console.log("userData:", userData);

      // ✅ Chỉ update nếu data thực sự có giá trị
      if (newToken && userData) {
        setAccessToken(newToken);
        setUser(userData);
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Data không hợp lệ → giữ nguyên localStorage, không xóa
        console.warn("⚠️ response.data thiếu token hoặc user:", response.data);
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

    // Axios Interceptor for Request
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Axios Interceptor for Response
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(
              `${API_URL}/api/auth/refresh-token`,
              {},
              { withCredentials: true },
            );
            const newToken = response.data.token || response.data.accessToken;
            if (newToken) {
              setAccessToken(newToken);
              localStorage.setItem("accessToken", newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            clearAuth(true); // Token hết hạn hoàn toàn -> logout
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAuthToken]);

  const loginContext = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutContext = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
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
        accessToken,
        user,
        loginContext,
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
