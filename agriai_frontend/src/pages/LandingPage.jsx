import React from 'react';
import { Hero, Features, BentoFeatures, WeatherDiseaseSection, FarmerReviews, RoadmapSection } from '../features/landing';
import SEO from '../components/common/SEO';
import { Helmet } from 'react-helmet-async';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// JSON-LD Structured Data: WebSite + Organization schema
const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AgriSmart',
  alternateName: 'AgriAI',
  url: 'https://agrismart.io.vn',
  description: 'Nền tảng chẩn đoán bệnh cây trồng bằng AI hàng đầu Việt Nam',
  inLanguage: 'vi-VN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://agrismart.io.vn/diagnosis',
    },
    'query-input': 'required name=search_term_string',
  },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AgriSmart',
  alternateName: 'AgriAI',
  url: 'https://agrismart.io.vn',
  logo: {
    '@type': 'ImageObject',
    url: 'https://agrismart.io.vn/logo512.png',
    width: 512,
    height: 512,
  },
  description: 'Nền tảng chẩn đoán bệnh cây trồng bằng AI hàng đầu Việt Nam, giúp nông dân phát hiện và xử lý bệnh hại sớm.',
  areaServed: 'VN',
  knowsLanguage: 'vi',
};

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
      {/* JSON-LD Structured Data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(WEBSITE_SCHEMA)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(ORGANIZATION_SCHEMA)}
        </script>
      </Helmet>
      <Hero />
      <Features />
      <BentoFeatures />
      <WeatherDiseaseSection />
      <FarmerReviews />
      <RoadmapSection />
    </>
  );
};

export default LandingPage;
