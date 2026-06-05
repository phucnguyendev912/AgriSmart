import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useState } from 'react';

const API_URL = "";

const AdminHeader = () => {
  const { admin, logoutContext } = useAdminAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logoutContext();
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none border-b border-slate-200/50">
      <div className="flex items-center gap-4">
        <span className="text-xl font-black text-green-800 dark:text-green-400 tracking-tighter">AgriSmart</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-64 outline-none" placeholder="Tìm kiếm hệ thống..." type="text" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm uppercase">
            {admin?.fullName?.charAt(0) || 'A'}
          </div>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-error-container text-error transition-colors"
            title="Đăng xuất"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
