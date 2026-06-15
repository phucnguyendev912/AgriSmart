import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { loginWithGoogle } from '../../../services/authService';

/**
 * SocialLoginButtons
 * Renders the Google social login button with loading state and error handling.
 */
const SocialLoginButtons = () => {
  const { loginContext } = useAuth();
  const navigate = useNavigate();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ── Google ────────────────────────────────────────────────────

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoadingGoogle(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      const userData = res.data?.user;
      if (userData) {
        loginContext(userData);
        toast.success('Đăng nhập bằng Google thành công!');
        navigate('/home');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="w-full flex justify-center google-login-wrapper relative min-h-[40px]">
      {loadingGoogle && (
        <div className="absolute inset-0 bg-surface/50 flex items-center justify-center z-10 rounded-lg">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        }}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
};

export default SocialLoginButtons;
