import React from 'react';
import { Link } from 'react-router-dom';
/**
 * Hero Component
 * Renders the landing page hero section with a background image, key value propositions,
 * and a primary call-to-action button for quick crop disease diagnosis.
 * Includes staggered on-load entrance animations (fadeInUp) for each content group.
 */
const Hero = () => {
  return (
    <header className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img alt="Ruộng lúa" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrhFtts1Qj7yox7CeohRFr30JN8AbuwOfUqvDZNCt1PV47kakPmRv5nvFxrXnDfobs3HLxPqhrsr-zKcd6aIh7uHt0SgcfgYOpKxM5iiVG6zeat0_E2cXAfuTOoj73byIgb-GuQL-6REA8OtsZgC5gzQRTmLxZTt1aqKwP7sBawbCNIy2LsW2ysumi-OvH6LKVyc-lKA-eOYUacQN4BE8NOmsklTu_2jvVKgWTTxHkdQ93ZDwlGPabM516jbo0cp7VjwnPwcsFNtj4" />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center text-white">
        {/* Headline — delay 0s */}
        <h1
          className="animate-fade-in-up text-5xl md:text-7xl font-black mb-8 leading-[1.1] max-w-5xl mx-auto"
          style={{ animationDelay: '0s' }}
        >
          AgriAI - Hệ thống AI chẩn đoán bệnh cây trồng
        </h1>

        {/* Subtitle — delay 0.15s */}
        <p
          className="animate-fade-in-up text-xl md:text-2xl font-medium mb-12 opacity-90 max-w-3xl mx-auto"
          style={{ animationDelay: '0.15s' }}
        >
          Phát hiện sớm bệnh hại cây trồng • Tiết kiệm chi phí • Tăng năng suất mùa vụ
        </p>

        {/* CTA Buttons — delay 0.3s */}
        <div
          className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          style={{ animationDelay: '0.3s' }}
        >
          <Link
            to="/diagnosis"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Bắt đầu chẩn đoán ngay
          </Link>
        </div>

        {/* Trust Badges — delay 0.5s */}
        <div
          className="animate-fade-in-up flex flex-wrap justify-center items-center gap-8 opacity-70"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined">verified</span>
            <span className="text-sm font-bold uppercase tracking-widest">Viện Cây Trồng Kiểm Định</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined">security</span>
            <span className="text-sm font-bold uppercase tracking-widest">Bảo mật dữ liệu 100%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined">award_star</span>
            <span className="text-sm font-bold uppercase tracking-widest">Top 1 Nông Nghiệp Số</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
