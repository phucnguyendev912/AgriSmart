import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import SEO from '../components/common/SEO';
import SocialLoginButtons from '../features/auth/components/SocialLoginButtons';


const INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không đúng';
const SYSTEM_LOGIN_ERROR_MESSAGE = 'Lỗi hệ thống hoặc kết nối máy chủ. Vui lòng thử lại sau.';
const NETWORK_LOGIN_ERROR_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';

const getLoginErrorMessage = (error) => {
  if (!error.response) {
    return NETWORK_LOGIN_ERROR_MESSAGE;
  }

  const { status, data } = error.response;

  if (status === 401) {
    return data?.message || INVALID_CREDENTIALS_MESSAGE;
  }

  if (status >= 500) {
    return SYSTEM_LOGIN_ERROR_MESSAGE;
  }

  if (typeof data === 'object') {
    return data.message || data.error || SYSTEM_LOGIN_ERROR_MESSAGE;
  }

  return data || SYSTEM_LOGIN_ERROR_MESSAGE;
};

const LoginPage = () => {

  const { loginContext } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleEmailChange = (val) => {
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: null }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(null);
    setFieldErrors({});

    try {
      const response = await login(email, password);

      if (response.status === 200 || response.status === 201) {
        toast.success('Đăng nhập thành công!');
        // Token is stored in HttpOnly cookie; frontend only needs user object to update UI state.
        const userData = response.data.user;
        if (userData) {
          loginContext(userData);
        }

        navigate('/home');
      }
    } catch (error) {
      const errorMsg = getLoginErrorMessage(error);
      setErrors(errorMsg);
      toast.error(errorMsg);

      if (error.response && error.response.status === 401) {
        setFieldErrors({
          email: 'Vui lòng kiểm tra lại email hoặc tên đăng nhập.',
          password: 'Vui lòng kiểm tra lại mật khẩu.'
        });
      } else if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('tài khoản')) {
        setFieldErrors(prev => ({ ...prev, email: errorMsg }));
      } else if (errorMsg.toLowerCase().includes('mật khẩu') || errorMsg.toLowerCase().includes('password')) {
        setFieldErrors(prev => ({ ...prev, password: errorMsg }));
      }

      if (!error.response || error.response.status >= 500) {
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-surface text-on-background min-h-screen flex items-center justify-center p-6 pt-28 sm:pt-32">
      <SEO
        title="Đăng nhập"
        description="Đăng nhập vào AgriSmart để chẩn đoán bệnh cây trồng bằng AI, xem bản đồ dịch bệnh và nhận phác đồ điều trị tức thì."
        url="/login"
        noIndex
      />
      <div className="bg-agricultural-blur" data-alt="close-up of vibrant green rice plant leaves with dew drops in a sunlit field with soft bokeh background"></div>
      <div className="bg-overlay"></div>

      <main className="w-full max-w-[480px]">
        <div className="text-center mb-6 sm:mb-10 mt-8 sm:mt-0">
          <div className="inline-flex items-center justify-center p-3 bg-primary-container rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-3xl" data-icon="potted_plant">potted_plant</span>
          </div>
          <h1 className="text-primary text-3xl font-black tracking-tighter mb-1">AgriAI</h1>
          <p className="text-on-surface-variant font-medium tracking-tight px-4 sm:px-0">Chuyên gia nông nghiệp kỹ thuật số</p>
        </div>

        <div className="bg-surface-container-lowest sm:rounded-xl p-6 sm:p-10 shadow-2xl shadow-on-background/5 border-t border-b sm:border border-outline-variant/15">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Đăng nhập</h2>
            <p className="text-on-surface-variant text-sm">Chào mừng bạn quay trở lại với cánh đồng thông minh.</p>
          </div>

          {errors && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-lg border-none">
              <span className="material-symbols-outlined text-error" data-icon="error">error</span>
              <span className="text-sm font-medium">{errors}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[0.75rem] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                EMAIL / TÊN NGƯỜI DÙNG
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline" data-icon="person">person</span>
                </div>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`block w-full min-h-[44px] pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 transition-all text-on-surface placeholder:text-outline/60 ${fieldErrors.email ? 'focus:ring-error ring-2 ring-error/50' : 'focus:ring-primary'}`}
                  placeholder=" Nhập email hoặc tên tài khoản"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-error text-xs flex items-center gap-1 mt-1 ml-1 font-medium animate-fade-in">
                  <span className="material-symbols-outlined !text-sm">error</span>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[0.75rem] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                MẬT KHẨU
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline" data-icon="lock">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`block w-full min-h-[44px] pl-11 pr-12 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 transition-all text-on-surface placeholder:text-outline/60 ${fieldErrors.password ? 'focus:ring-error ring-2 ring-error/50' : 'focus:ring-primary'}`}
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-outline hover:text-on-surface-variant" data-icon="visibility">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-error text-xs flex items-center gap-1 mt-1 ml-1 font-medium animate-fade-in">
                  <span className="material-symbols-outlined !text-sm">error</span>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg shadow-primary/20 text-base font-bold text-on-primary bg-primary hover:bg-primary-container transition-all active:scale-[0.98]"
            >
              Đăng nhập
              <span className="material-symbols-outlined ml-2 text-xl" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-container-lowest px-2 text-on-surface-variant font-medium">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          <SocialLoginButtons />

          <div className="mt-8 pt-8 border-t border-outline-variant/15 text-center">
            <p className="text-sm text-on-surface-variant">
              Chưa có tài khoản?
              <Link to="/register" className="font-bold text-primary hover:text-primary-container ml-1 inline-block py-1">Đăng ký ngay</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 mb-8 flex justify-center flex-wrap gap-x-6 gap-y-4 text-on-surface-variant/60 text-xs font-medium">
          <Link to="/terms" className="hover:text-primary transition-colors py-2">Điều khoản dịch vụ</Link>
          <Link to="/privacy" className="hover:text-primary transition-colors py-2">Chính sách bảo mật</Link>
          <Link to="/help" className="hover:text-primary transition-colors py-2">Trợ giúp</Link>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
