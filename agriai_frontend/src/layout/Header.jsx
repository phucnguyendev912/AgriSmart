import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutContext();
    navigate('/login');
  };

  const homeRoute = user ? '/home' : '/';

  const isActive = (path) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) return true;
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `text-sm font-bold py-1 transition-colors ${
      isActive(path)
        ? 'text-primary border-b-2 border-primary'
        : 'text-slate-600 hover:text-primary'
    }`;


  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-lg border-b border-slate-200 h-20 shadow-sm transition-all">
        <div className="h-full max-w-[1440px] mx-auto px-4 md:px-8 flex justify-between items-center gap-4">
          <Link to={homeRoute} className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl font-bold">potted_plant</span>
            </div>
            <span className="text-2xl font-black text-primary tracking-tighter hidden sm:block">AgriSmart</span>
          </Link>

          <div className="hidden xl:flex items-center gap-8 flex-1 justify-center max-w-none">
            <div className="flex items-center space-x-6">
              <Link className={linkClass('/home')} to={homeRoute}>Trang chủ</Link>
              <Link className={linkClass('/diagnosis')} to="/diagnosis">Chẩn đoán bệnh</Link>
              {user && (
                <>
                  <button 
                    onClick={() => navigate('/history')}
                    className={linkClass('/history')}
                  >
                    Lịch sử chẩn đoán
                  </button>
                  <button
                    onClick={() => navigate('/farming-areas')}
                    className={linkClass('/farming-areas')}
                  >
                    Khu vực canh tác
                  </button>
                </>
              )}
              <Link className={`${linkClass('/warning-map')} flex items-center gap-1`} to="/warning-map">
                <span className="material-symbols-outlined text-base">map</span>
                Bản đồ dịch bệnh
              </Link>
              <Link className={linkClass('/about')} to="/about">Về chúng tôi</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <div className="relative">
                  <button onClick={() => setDesktopMenuOpen(!desktopMenuOpen)} className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 transition-colors py-2 px-3 rounded-lg group cursor-pointer" title="Tuỳ chọn tài khoản">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-900 leading-none group-hover:text-primary transition-colors">{user.fullName || 'Người dùng'}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{user.roleName === 'ADMIN' ? 'Quản trị viên' : user.roleName || 'Nông dân'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-black text-primary select-none">
                          {(user.fullName || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {desktopMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 animate-fade-in">
                      <Link 
                        to="/profile" 
                        onClick={() => setDesktopMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        Hồ sơ người dùng
                      </Link>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={() => { setDesktopMenuOpen(false); handleLogout(); }} 
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-error/5 transition-colors text-sm font-bold text-error"
                      >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-slate-50">Đăng nhập</Link>
                <Link to="/register" className="text-sm font-bold text-white bg-primary hover:bg-primary-container transition-colors py-2 px-4 rounded-lg">Đăng ký</Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 bg-primary/10 text-primary rounded-lg"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          </div>
        </div>

        <div className={`xl:hidden fixed inset-x-0 top-20 bg-white border-b border-slate-200 shadow-xl py-6 px-6 z-40 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-4">
            <Link className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 ${isActive('/home') ? 'text-primary' : 'text-slate-600'}`} to={homeRoute} onClick={() => setMobileMenuOpen(false)}>
              Trang chủ <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
            <Link className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 ${isActive('/diagnosis') ? 'text-primary' : 'text-slate-600'}`} to="/diagnosis" onClick={() => setMobileMenuOpen(false)}>
              Chẩn đoán bệnh <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
            {user && (
              <>
                <div 
                  className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 cursor-pointer ${isActive('/history') ? 'text-primary' : 'text-slate-600'}`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/history');
                  }}
                >
                  Lịch sử chẩn đoán <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
                <div
                  className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 cursor-pointer ${isActive('/farming-areas') ? 'text-primary' : 'text-slate-600'}`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/farming-areas');
                  }}
                >
                  Khu vực canh tác <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
              </>
            )}
            <Link className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 ${isActive('/warning-map') ? 'text-primary' : 'text-slate-600'}`} to="/warning-map" onClick={() => setMobileMenuOpen(false)}>
              Bản đồ dịch bệnh <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
            <Link className={`flex items-center justify-between text-base font-bold py-2 border-b border-slate-50 ${isActive('/about') ? 'text-primary' : 'text-slate-600'}`} to="/about" onClick={() => setMobileMenuOpen(false)}>
              Về AgriSmart <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>

            <div className="pt-4 flex items-center justify-between">
              {user ? (
                <>
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}>
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-primary select-none">
                          {(user.fullName || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 flex gap-1 items-center">{user.fullName || 'Người dùng'} <span className="material-symbols-outlined text-[14px]">edit</span></p>
                      <p className="text-xs text-slate-500">{user.roleName === 'ADMIN' ? 'Quản trị viên' : 'Nông dân tiêu biểu'}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-error hover:bg-error-container rounded-lg" title="Đăng xuất">
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-4 w-full">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-sm font-bold text-slate-900 bg-slate-100 py-3 rounded-lg">Đăng nhập</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-sm font-bold text-white bg-primary py-3 rounded-lg">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
