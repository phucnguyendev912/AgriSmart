import React from 'react';

/**
 * Features Component
 * Landing page sections displaying AgriAI solution features, step-by-step guidance,
 * and user testimonials.
 */
const Features = () => {
  return (
    <>
      {/* Features List Section */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Giải pháp AI dành riêng cho nông dân Việt</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-gray-100 bg-surface hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">center_focus_strong</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Chẩn đoán bằng ảnh</h3>
              <p className="text-on-surface-variant leading-relaxed">Sử dụng camera điện thoại chụp ảnh lá bệnh, AI nhận diện chính xác bệnh hại chỉ sau 3 giây.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-gray-100 bg-surface hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">smart_toy</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Chatbot 24/7</h3>
              <p className="text-on-surface-variant leading-relaxed">Hỗ trợ tư vấn kỹ thuật canh tác, phòng trừ sâu bệnh mọi lúc mọi nơi cùng chuyên gia ảo.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-gray-100 bg-surface hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl">prescriptions</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Phác đồ xử lý</h3>
              <p className="text-on-surface-variant leading-relaxed">Đề xuất loại thuốc bảo vệ thực vật và liều lượng sử dụng hiệu quả, tiết kiệm chi phí.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50 overflow-hidden text-center" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-20">Chỉ 3 bước – Xong ngay trong 30 giây</h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 relative">
            <div className="flex-1 z-10">
              <div className="text-8xl font-black step-number mb-6 opacity-40">01</div>
              <h4 className="text-2xl font-bold mb-2">Chụp ảnh</h4>
              <p className="text-on-surface-variant">Lá hoặc thân cây</p>
            </div>
            <div className="hidden md:block w-24 border-t-2 border-dashed border-primary/30"></div>
            <div className="flex-1 z-10">
              <div className="text-8xl font-black step-number mb-6 opacity-40">02</div>
              <h4 className="text-2xl font-bold mb-2">AI phân tích</h4>
              <p className="text-on-surface-variant">Hệ thống xử lý</p>
            </div>
            <div className="hidden md:block w-24 border-t-2 border-dashed border-primary/30"></div>
            <div className="flex-1 z-10">
              <div className="text-8xl font-black step-number mb-6 opacity-40">03</div>
              <h4 className="text-2xl font-bold mb-2">Phác đồ</h4>
              <p className="text-on-surface-variant">Đề xuất thuốc xử lý</p>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
};

export default Features;
