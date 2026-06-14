import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BentoFeatures Component
 * Displays the "Tính năng nổi bật" (Highlighted Features) section as a 12-column
 * bento grid with 4 feature cards: AI Diagnosis, Weather & Treatment Plan,
 * 24/7 Chatbot, and Disease Map with animated outbreak markers.
 */
const BentoFeatures = () => {
  return (
    <section className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
        <span className="w-8 h-1 bg-primary rounded-full inline-block"></span>
        Tính năng nổi bật
      </h2>

      <div className="grid grid-cols-12 gap-6">
        {/* AI Diagnosis — large card */}
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
            <p className="text-slate-600 mb-8">
              Chụp ảnh lá cây bị bệnh, hệ thống AI sẽ phân tích và đưa ra kết quả chính xác sau 3 giây kèm theo
              phác đồ điều trị chi tiết.
            </p>
            <Link to="/diagnosis" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Khám phá ngay <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Weather & Treatment Plan */}
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

        {/* Chatbot 24/7 */}
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

        {/* Disease Map */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-high rounded-xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center border border-slate-200 group hover:border-primary/40 transition-colors">
          <div className="flex-1">
            <span className="text-rose-500 font-bold mb-2 text-sm uppercase tracking-wide block">CẢNH BÁO SỚM</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Bản đồ dịch bệnh</h3>
            <p className="text-slate-600 mb-6">
              Theo dõi tình hình dịch bệnh cây trồng theo thời gian thực trên bản đồ tương tác. Cập nhật liên tục
              từ cộng đồng nông dân và các trạm quan trắc.
            </p>
            <Link
              to="/warning-map"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
            >
              Xem bản đồ <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="w-full md:w-72 h-44 bg-white rounded-lg shadow-sm border overflow-hidden relative shrink-0">
            {/* Map preview with disease markers */}
            <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center relative">
              <span className="material-symbols-outlined text-[80px] text-teal-300">map</span>
              {/* Simulated outbreak dots */}
              <span className="absolute top-6 left-12 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-75"></span>
              <span className="absolute top-6 left-12 w-3 h-3 bg-rose-500 rounded-full"></span>
              <span className="absolute top-16 right-14 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-75"></span>
              <span className="absolute top-16 right-14 w-2 h-2 bg-amber-400 rounded-full"></span>
              <span className="absolute bottom-10 left-20 w-3 h-3 bg-rose-400 rounded-full animate-ping opacity-60"></span>
              <span className="absolute bottom-10 left-20 w-3 h-3 bg-rose-400 rounded-full"></span>
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 text-[10px] font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full inline-block"></span>Bùng phát
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span>Cảnh báo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
