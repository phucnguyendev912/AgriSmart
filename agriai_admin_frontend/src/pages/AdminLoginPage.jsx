import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

const API_URL = "";

export default function AdminLoginPage() {
  const { loginContext } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = response.data?.user;

      if (userData?.role !== 'ADMIN') {
        setError('Tài khoản này không có quyền truy cập trang quản trị.');
        setLoading(false);
        return;
      }

      loginContext(userData);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface to-secondary/10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <main className="relative w-full max-w-[440px]">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter mb-1">AgriAI</h1>
          <p className="text-on-surface-variant text-sm font-medium">Cổng quản trị hệ thống</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-2xl shadow-on-background/10 border border-outline-variant/15">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-on-surface tracking-tight mb-1">Đăng nhập Admin</h2>
            <p className="text-on-surface-variant text-sm">Chỉ tài khoản có quyền Admin mới được truy cập.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-xl">
              <span
                className="material-symbols-outlined text-error shrink-0"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                error
              </span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span
                    className="material-symbols-outlined text-outline"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    person
                  </span>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full min-h-[48px] pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 outline-none"
                  placeholder="admin@agriai.vn"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span
                    className="material-symbols-outlined text-outline"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    lock
                  </span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full min-h-[48px] pl-11 pr-12 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 outline-none"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  tabIndex={-1}
                >
                  <span
                    className="material-symbols-outlined text-outline hover:text-on-surface-variant transition-colors"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] flex justify-center items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary/20 text-base font-bold text-on-primary bg-primary hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin text-xl"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    progress_activity
                  </span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-on-surface-variant/60">
          © {new Date().getFullYear()} AgriAI · Hệ thống quản trị nội bộ
        </p>
      </main>
    </div>
  );
}
