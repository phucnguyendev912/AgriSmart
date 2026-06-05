import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginContext = (userData) => {
    setAdmin(userData);
    sessionStorage.setItem('admin_user', JSON.stringify(userData));
  };

  const logoutContext = () => {
    setAdmin(null);
    sessionStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loginContext, logoutContext }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
