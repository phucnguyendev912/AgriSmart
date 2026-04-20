import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import SEO from '../components/SEO';

const LandingPage = () => {
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
