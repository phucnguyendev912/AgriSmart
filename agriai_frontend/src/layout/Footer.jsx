import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white pt-12 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center space-x-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl font-bold">potted_plant</span>
            <span className="text-xl font-black text-primary tracking-tighter">AgriAI</span>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">Nâng tầm nông nghiệp Việt bằng công nghệ AI đỉnh cao, giúp bà con nông dân canh tác hiệu quả và bền vững.</p>
        </div>
        <div>
          <h5 className="font-black mb-4 uppercase text-xs tracking-widest text-gray-400">Sản phẩm</h5>
          <ul className="space-y-2 text-sm">
            <li><a className="text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Chẩn đoán AI</a></li>
            <li><a className="text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Bản đồ dịch bệnh</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-black mb-4 uppercase text-xs tracking-widest text-gray-400">Công ty</h5>
          <ul className="space-y-2 text-sm">
            <li><a className="text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Về chúng tôi</a></li>
            <li><a className="text-on-surface-variant hover:text-primary font-medium transition-colors" href="#">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-black mb-4 uppercase text-xs tracking-widest text-gray-400">Liên hệ</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-lg">mail</span>
              <span>hotro@agriai.vn</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium">
        <p>© 2026 AgriAI Diagnostic Ecosystem. Bảo lưu mọi quyền.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a className="hover:text-primary" href="#">Chính sách bảo mật</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
