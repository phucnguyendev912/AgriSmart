import React from 'react';

const Features = () => {
  return (
    <>
      {/* Tính năng */}
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

      {/* Cảm nhận & Lợi ích (Rút gọn) */}
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
      
      {/* Testimonial Images (Đã convert thẻ đóng <img>) */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-16">Niềm tin từ bà con nông dân</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 relative">
              <p className="text-lg italic text-on-surface-variant mb-8 leading-relaxed">"Nhờ AgriAI mà vụ lúa vừa rồi tôi phát hiện bệnh đạo ôn sớm cả tuần."</p>
              <div className="flex items-center space-x-4">
                <img alt="Nông dân" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRagydOZa55nOqDNbeU0Ym3vgVp-kyk_rg3o5T8W-4TAG9aUAWo7gJaXNjlDUUP6TVCvJELoFqWJ4maFFm6o7TGAF1kvRpgyHQK17Wkf6_l3NE8kO_V-WD1sgs4AEA0xvd3ggR405BC0pgTG02xXkAB5FnCmmEky5mDxB-N-LngHG2aR7My67A1R2rNoiPaSst9c7sy_DyGXR2ifkIacKlDeXACHfCiho4qV3wtFH1zxIlv9d47Mge7bR2J1qGEvpIQD1081oA8gZ1" />
                <div>
                  <div className="font-black text-on-surface">Chú Ba Thành</div>
                  <div className="text-sm text-gray-500 font-medium">Lúa, Đồng Tháp</div>
                </div>
              </div>
            </div>
            
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 relative">
              <p className="text-lg italic text-on-surface-variant mb-8 leading-relaxed">"Ban đầu ngại công nghệ nhưng dùng cái này dễ thiệt. Chụp cái là ra bệnh."</p>
              <div className="flex items-center space-x-4">
                <img alt="Nông dân" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ajAkZYRTb54QN8jNTH3QcnlPlz9CFKOYdguc416qRHk0S2XeQDnRJCTcEIcmp_dE2iahm2zN87D96NmQ48JBCOwUhBaKuGKLKxLesS5EffsfO0BydywfB5yi92hkFKB68rbRYo3VB8Oz87_OvfPh7Pk_hnBuBgquZPkQrKpaGI2MDmzohoFl0z9OLp_J5LlRxSEmDu6FSTVxGcEG_MD4v2rIiNz4M7-YiLhq1WV2MN4ycshd7lVQ593wGuHUlcq8ANQgTpFVjvuI" />
                <div>
                  <div className="font-black text-on-surface">Cô Lan</div>
                  <div className="text-sm text-gray-500 font-medium">Hồ tiêu, Đắk Lắk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
