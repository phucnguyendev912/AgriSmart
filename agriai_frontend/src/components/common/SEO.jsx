import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://agrismart.vn';
const DEFAULT_IMAGE = `${BASE_URL}/logo512.png`;

/**
 * Component quản lý SEO động cho từng trang.
 * @param {string} title - Tiêu đề trang (sẽ tự thêm " | AgriSmart")
 * @param {string} description - Mô tả trang
 * @param {string} keywords - Từ khóa bổ sung
 * @param {string} url - Đường dẫn trang (ví dụ: "/diagnosis")
 * @param {string} image - URL ảnh preview cho social media
 */
const SEO = ({
  title = 'Chẩn Đoán Bệnh Cây Trồng Bằng AI',
  description = 'AgriSmart giúp nông dân Việt Nam chẩn đoán bệnh cây trồng nhanh chóng bằng trí tuệ nhân tạo. Xem bản đồ cảnh báo dịch bệnh và nhận phác đồ điều trị tức thì.',
  keywords = 'chẩn đoán bệnh cây trồng, AI nông nghiệp, nông nghiệp thông minh, AgriSmart',
  url = '/',
  image = DEFAULT_IMAGE,
}) => {
  const fullTitle = title === 'AgriSmart'
    ? 'AgriSmart - Chẩn Đoán Bệnh Cây Trồng Bằng AI'
    : `${title} | AgriSmart`;
  const canonicalUrl = `${BASE_URL}${url}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
