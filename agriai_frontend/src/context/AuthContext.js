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

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        clearAuth();
        console.warn(
          "Refresh token response missing user data.",
          response.data,
        );
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
            const refreshResponse = await axios.post(
              `${API_URL}/api/auth/refresh-token`,
            );
            const userData =
              refreshResponse.data.user || refreshResponse.data.data;

            if (userData) {
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
            }

            return axios(originalRequest);
          } catch (refreshError) {
            clearAuth(true);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAuthToken]);

  const loginContext = (userData) => {
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
