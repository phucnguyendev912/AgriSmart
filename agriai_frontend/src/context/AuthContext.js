import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, {
        withCredentials: true
      });

      setAccessToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuthToken();
  }, []);

  const loginContext = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logoutContext = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, loginContext, logoutContext, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
