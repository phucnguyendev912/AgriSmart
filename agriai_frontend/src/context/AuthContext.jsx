import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logout as logoutApi, refreshToken } from "../services/authService";

const AuthContext = createContext();

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
      const data = await refreshToken();
      const userData = data.user || data.data;

      if (userData) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.warn("⚠️ response.data thiếu user:", data);
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
    // Response interceptor is now configured in api.js, no longer needed here.
  }, [refreshAuthToken]);

  const loginContext = (userData) => {
    // Token is stored in HttpOnly cookie, frontend only saves user to maintain UI state.
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUserContext = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutContext = async () => {
    try {
      await logoutApi();
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
