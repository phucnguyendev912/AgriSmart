import React from 'react';
import Hero from '../features/landing/components/Hero';
import Features from '../features/landing/components/Features';
import SEO from '../components/common/SEO';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LandingPage Component
 * The initial landing/welcome page. Redirects authenticated users to the home dashboard
 * and displays SEO metadata along with Hero and Features sections for guest visitors.
 */
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <>
      <SEO
        title="AgriSmart"
        description="AgriSmart - Nền tảng chẩn đoán bệnh cây trồng bằng AI hàng đầu Việt Nam. Nhận kết quả tức thì, phác đồ điều trị và cảnh báo dịch bệnh."
        keywords="chẩn đoán bệnh cây trồng, AI nông nghiệp, nông nghiệp thông minh, AgriSmart"
        url="/"
      />
      <Hero />
      <Features />
    </>
  );
};

export default LandingPage;
