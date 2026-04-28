import React from 'react';
import { Link } from 'react-router-dom';
import FarmerStories from '../components/FarmerReviews';

const HomePage = () => {
  return (
    <>
      {/* Main Content Canvas */}
      <main className="pt-20 min-h-screen bg-surface">
        {/* Hero Section */}
        <section className="relative h-[550px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Lush Green Rice Terraces"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnp-K7vx1NxjpfXy9MLwOWXOgha7VeLjqCReVFtg-lm7OeredtM9toNuvltay5lou9hpOir14qyVFfsb9298cl2sb4QhZy4_ILo4cCflQPGN2vu1C0l573xVbDrBEZRzF5ZFRVeJjjl_RDZDi26ilLqWfPuKX6u6zS89u5EXpoOLd13ZY_hUlSERDHH_GxUrfvK2O87pbKumArBU4DG8N6QysFO4FzzCD7Hex27eZPEEY7Kqjb4Z3tdQYB7ZCulP7cZ_EP8V3OcbVC"
            />
            <div className="absolute inset-0 hero-gradient"></div>
          </div>

          <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto text-on-primary w-full text-center md:text-left">
            <span className="tracking-widest text-primary-fixed uppercase font-bold mb-4 block text-sm">CÔNG NGHỆ VÌ NHÀ NÔNG</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-6">
              AgriAI - AI Chẩn Đoán Bệnh Cây Trồng Và Gợi Ý Giải Pháp Nông Nghiệp Thông Minh
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Giúp nông dân Việt Nam phát hiện bệnh sớm, giảm thiểu thiệt hại, tăng năng suất mùa vụ bằng công nghệ thị giác máy tính tiên tiến nhất.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/diagnosis" className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-lg flex items-center gap-3 font-bold transition-all shadow-lg active:scale-95">
                <span className="material-symbols-outlined">camera</span>
                Chẩn đoán bệnh ngay
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="px-6 md:px-12 -translate-y-12 z-20 relative max-w-7xl mx-auto">
        </section>

        {/* Features Bento Grid */}
        <section className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full inline-block"></span>
            Tính năng nổi bật
          </h2>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row group border border-slate-100">
              <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                <img
                  alt="AI Diagnosis Interface"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCziuK8XcOhggpQw3MoBgYvXQSYIolG-d3DUPUEAcJ4Q_WRtqUEcPzxtGNDgK1FR8Kzye-tLlyhqySXevVeAj8H72_pgdEXNEGRFZR1uhnLEAGZ3E94EKWl02hDSH2ITlXnjwyFx27BL2zAgzetixWcWsNSltjXpAVvoyXVXBHkpq_RPy-5-ZE0L_qwRFrJ2hev-TLnSfluh42GEI5vC89eJykwl0g0QQ0Gk07b9WBW0G9rd3-arqO6T0KoqHAHMX-7I3G5yj3fCGFI"
                />
              </div>
              <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                <span className="text-emerald-600 font-bold mb-2 text-sm uppercase tracking-wide">CÔNG NGHỆ LÕI</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">Chẩn đoán bệnh AI</h3>
                <p className="text-slate-600 mb-8">Chụp ảnh lá cây bị bệnh, hệ thống AI sẽ phân tích và đưa ra kết quả chính xác sau 3 giây kèm theo phác đồ điều trị chi tiết.</p>
                <button className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
                  Khám phá ngay <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-tertiary-container text-white p-8 md:p-10 rounded-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4 block">cloud_sync</span>
                <h3 className="text-2xl font-bold mb-2">Phác đồ &amp; Thời tiết</h3>
                <p className="opacity-90">Lịch trình chăm sóc cây trồng dựa trên dự báo thời tiết địa phương thực tế.</p>
              </div>
              <button className="relative z-10 mt-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
                <span className="material-symbols-outlined text-[120px]">thermostat</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-secondary-container text-on-secondary-container p-8 md:p-10 rounded-xl flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4 block">chat_bubble</span>
                <h3 className="text-2xl font-bold mb-2">Chatbot tư vấn 24/7</h3>
                <p className="opacity-80">Giải đáp mọi thắc mắc về kỹ thuật canh tác và phòng trừ sâu bệnh bất cứ lúc nào.</p>
              </div>
              <button className="relative z-10 mt-6 w-12 h-12 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <div className="absolute -right-8 -bottom-8 opacity-10 transform -rotate-12">
                <span className="material-symbols-outlined text-[120px]">smart_toy</span>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-surface-container-high rounded-xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center border border-slate-200">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Nông nghiệp bền vững</h3>
                <p className="text-slate-600 mb-6">Cung cấp các kiến thức và giải pháp giúp nông dân canh tác an toàn, thân thiện với môi trường và tối ưu hóa lợi nhuận lâu dài.</p>
                <div className="flex gap-2">
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-primary">VIETGAP</span>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-primary">AN TOÀN</span>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-primary">BỀN VỮNG</span>
                </div>
              </div>
              <div className="w-full md:w-72 h-44 bg-white rounded-lg shadow-sm border overflow-hidden relative">
                <img
                  alt="Sustainable Farming"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU67ueXqwIk9QeelmrCMfV5DwYB5DBDMv_NVyHlM_rwFcD4tzCXxnw-ifQvbMd5WfQ63o5ra2ElIZ8EcRgqKFtFe5U9mle0aGek27q_4LOIXGXeeQrEUUrNfP6mAXu9rewxWF1tb0YNFJpTbHhZW0LwCy4O-ZAvFbmsQIVgPWT3hXJuJ5Yp1oLo7x713a01NBf99VcHlR_il9S5mqMBCjd4pOhj-lkxILp0DxReC8Mfc7Em76BZEJPzYBaJ-LVK3RMhIiqMZBU-gI6"
                />
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">eco</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FarmerStories />
        {/* Final CTA */}
        <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-on-primary mb-6">Sẵn sàng bảo vệ mùa vụ?</h2>
              <p className="text-primary-fixed-dim text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
                Tham gia cùng cộng đồng hàng ngàn nông dân Việt Nam hiện đại, ứng dụng AI để canh tác thông minh và bền vững hơn.
              </p>
              <button className="bg-white text-primary hover:bg-surface-bright px-12 py-5 rounded-full font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:translate-y-0">
                Bắt đầu chẩn đoán miễn phí
              </button>

              <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10 text-on-primary/70 text-sm font-medium">
                {['Không phí duy trì', 'Cập nhật bệnh mới 24/7', 'Hỗ trợ đa nền tảng'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary-container rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container rounded-full opacity-20 blur-3xl"></div>
          </div>
        </section>
      </main>


    </>
  );
};

export default HomePage;
