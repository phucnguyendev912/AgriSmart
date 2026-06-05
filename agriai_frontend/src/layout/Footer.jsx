import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white pt-12 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center space-x-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl font-bold">potted_plant</span>
            <span className="text-xl font-black text-primary tracking-tighter">AgriSmart</span>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">Nâng tầm nông nghiệp Việt bằng công nghệ AI đỉnh cao, giúp bà con nông dân canh tác hiệu quả và bền vững.</p>
        </div>
        <div>
          <h5 className="font-black mb-4 uppercase text-xs tracking-widest text-gray-400">Sản phẩm</h5>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/diagnosis">Chẩn đoán bệnh</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/history">Lịch sử chẩn đoán</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/farming-areas">Khu vực canh tác</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/warning-map">Bản đồ dịch bệnh</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="font-black mb-4 uppercase text-xs tracking-widest text-gray-400">Công ty</h5>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/home">Trang chủ</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary font-medium transition-colors" to="/about">Về AgriSmart</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium">
        <p>© 2026 AgriSmart Diagnostic Ecosystem. Bảo lưu mọi quyền.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a className="hover:text-primary" href="#">Chính sách bảo mật</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
