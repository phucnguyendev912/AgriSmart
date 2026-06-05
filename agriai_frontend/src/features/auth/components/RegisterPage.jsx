import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../../../services/authService';


/**
 * RegisterPage Component
 * Provides a registration interface for new users, including validation for password match,
 * submission of new registration details to the auth service, and field error toast feedback.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
    terms: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};

    if (formData.password !== formData.passwordConfirm) {
      errors.confirm_password = 'Mật khẩu không khớp.';
    }

    if (!formData.terms) {
      toast.warning('Bạn cần đồng ý với điều khoản dịch vụ.');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Đăng ký tài khoản thành công!');
        navigate('/login');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const fieldErrors = errorData.fieldErrors || {};
          
          if (Object.keys(fieldErrors).length > 0) {
            setFormErrors(prev => ({ ...prev, ...fieldErrors }));
          }

          const firstFieldError = Object.values(fieldErrors)[0];
          const errorMsg = firstFieldError
            || (errorData.message !== 'Du lieu gui len khong hop le.' ? errorData.message : null)
            || errorData.message
            || errorData.error
            || 'Đã xảy ra lỗi!';
            
          toast.error(errorMsg);
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error('Lỗi cấu hình CSDL hoặc kết nối mạng!');
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-x-hidden pt-24 pb-12">
      <div className="fixed inset-0 z-0 opacity-15 grayscale bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCu1PkRAwaMPO7mw6Jcd_TBMWsdC7Q1YTmarn9Ie4GKC3EpVFHfHQLGKqPuHDLnYyxtHKi30rU6PnS8lE_ld3PSkl4Ap45VrczeK0aZ3xn9Nx8q7PHLw9o4DmbNXDyeWyChaP9K68iZdWRRxvT0tg73x6OMuXTkHHbPDajrypq8czlAPg0rrRRPsDathEm-Eo5Y0-xzompeOX5Hr5k9nKF-tJuJ3kSUFNDJkFSSNIWOVbV96c19QbWbxmy9eJe2bY85O5rfejCn2lti')" }}></div>

      <main className="relative z-10 w-full max-w-md md:p-2">
        <div className="bg-white/90 backdrop-blur-md min-h-screen md:min-h-0 p-6 md:p-8 md:rounded-2xl shadow-none md:shadow-lg flex flex-col justify-center border border-gray-100">
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
              <span className="text-2xl font-black text-primary tracking-tighter">AgriSmart</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-2">Đăng ký mới</h1>
            <p className="text-on-surface-variant text-sm font-medium px-4">Khởi đầu hành trình canh tác thông minh cùng chuyên gia AI</p>
          </div>

          <form className="space-y-4 md:space-y-4" onSubmit={handleRegister}>
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-xs font-bold tracking-wider text-on-surface-variant uppercase ml-1" htmlFor="fullName">
                Họ và tên
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline-variant text-base"
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-xs font-bold tracking-wider text-on-surface-variant uppercase ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                <input
                  className={`w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 transition-all text-on-surface text-base ${formErrors.email ? 'focus:ring-error ring-2 ring-error/50' : 'focus:ring-primary'}`}
                  id="email"
                  type="email"
                  required
                  placeholder="user@agri.ai"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {formErrors.email && (
                <p className="text-error text-xs flex items-center gap-1 mt-1 ml-1 font-medium">
                  <span className="material-symbols-outlined !text-sm">error</span>
                  {formErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-xs font-bold tracking-wider text-on-surface-variant uppercase ml-1" htmlFor="phoneNumber">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">call</span>
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline-variant text-base"
                  id="phoneNumber"
                  placeholder="09xx xxx xxx"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] md:text-xs font-bold tracking-wider text-on-surface-variant uppercase ml-1" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input
                    className="w-full pl-11 pr-11 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary transition-all text-on-surface text-base"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] md:text-xs font-bold tracking-wider text-on-surface-variant uppercase ml-1" htmlFor="passwordConfirm">
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">lock_reset</span>
                  <input
                    className={`w-full pl-11 pr-11 py-3.5 bg-surface-container-low border-none rounded-lg focus:ring-2 transition-all text-on-surface text-base ${formErrors.confirm_password ? 'focus:ring-error ring-2 ring-error/50' : 'focus:ring-primary'}`}
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    tabIndex={-1}
                    aria-label={showPasswordConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined">{showPasswordConfirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formErrors.confirm_password && (
                  <p className="text-error text-xs flex items-center gap-1 mt-1 ml-1 font-medium">
                    <span className="material-symbols-outlined !text-sm">warning</span>
                    {formErrors.confirm_password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low flex-shrink-0"
                id="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label className="text-sm text-on-surface-variant leading-relaxed select-none" htmlFor="terms">
                Tôi đồng ý với <Link to="#" className="text-primary font-semibold hover:underline">Điều khoản dịch vụ</Link> và <Link to="#" className="text-primary font-semibold hover:underline">Chính sách bảo mật</Link> của AgriAI.
              </label>
            </div>

            <button
              className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg hover:bg-primary-container transition-all active:scale-[0.98] mt-4 text-base"
              type="submit"
            >
              Đăng ký
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <p className="text-on-surface-variant text-sm font-medium">
              Đã có tài khoản?
              <Link to="/login" className="text-primary font-bold ml-1 hover:underline decoration-2 underline-offset-4 inline-flex items-center min-h-[44px]">Đăng nhập</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 mb-4 flex justify-between px-6 md:px-2 opacity-60">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">© 2024 AgriAI Diagnostic</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined !text-base">language</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">Tiếng Việt</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
