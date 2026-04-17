import React from 'react';

const Hero = () => {
  return (
    <header className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img alt="Ruộng lúa" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrhFtts1Qj7yox7CeohRFr30JN8AbuwOfUqvDZNCt1PV47kakPmRv5nvFxrXnDfobs3HLxPqhrsr-zKcd6aIh7uHt0SgcfgYOpKxM5iiVG6zeat0_E2cXAfuTOoj73byIgb-GuQL-6REA8OtsZgC5gzQRTmLxZTt1aqKwP7sBawbCNIy2LsW2ysumi-OvH6LKVyc-lKA-eOYUacQN4BE8NOmsklTu_2jvVKgWTTxHkdQ93ZDwlGPabM516jbo0cp7VjwnPwcsFNtj4" />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] max-w-5xl mx-auto">
          AgriAI – AI Thông Minh Chẩn Đoán Bệnh Cây Trồng
        </h1>
        <p className="text-xl md:text-2xl font-medium mb-12 opacity-90 max-w-3xl mx-auto">
          Phát hiện sớm bệnh hại • Tiết kiệm chi phí • Tăng năng suất mùa vụ cho nông dân Việt Nam
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">photo_camera</span>
            <span>Chẩn đoán bệnh ngay</span>
          </button>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
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
