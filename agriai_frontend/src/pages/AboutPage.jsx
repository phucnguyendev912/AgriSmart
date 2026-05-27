import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";

/**
 * AboutPage Component
 * Renders the "About Us" page detailing the mission, vision, statistics,
 * technologies, and team behind the AgriAI project.
 */
export default function AboutPage() {
  return (
    <>
      <SEO
        title="Về chúng tôi"
        description="AgriAI là hệ sinh thái chẩn đoán bệnh cây trồng bằng Trí tuệ Nhân tạo (AI), nâng tầm nông nghiệp Việt Nam bằng các công nghệ số tiên tiến."
        keywords="về chúng tôi, giới thiệu AgriAI, AI nông nghiệp, đội ngũ AgriSmart"
        url="/about"
      />

      <main className="pt-20 min-h-screen bg-surface">
        {/* Hero Section */}
        <section className="relative h-[400px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Lush green paddy fields"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnp-K7vx1NxjpfXy9MLwOWXOgha7VeLjqCReVFtg-lm7OeredtM9toNuvltay5lou9hpOir14qyVFfsb9298cl2sb4QhZy4_ILo4cCflQPGN2vu1C0l573xVbDrBEZRzF5ZFRVeJjjl_RDZDi26ilLqWfPuKX6u6zS89u5EXpoOLd13ZY_hUlSERDHH_GxUrfvK2O87pbKumArBU4DG8N6QysFO4FzzCD7Hex27eZPEEY7Kqjb4Z3tdQYB7ZCulP7cZ_EP8V3OcbVC"
            />
            <div className="absolute inset-0 hero-gradient"></div>
          </div>

          <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto text-on-primary w-full text-center">
            <span className="tracking-widest text-primary-fixed uppercase font-bold mb-4 block text-sm">VỀ CHÚNG TÔI</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-4">
              Hành Trình Kiến Tạo AgriAI
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              Mang công nghệ Trí tuệ Nhân tạo (AI) tiên tiến nhất đến từng cánh đồng Việt Nam, bảo vệ mùa màng và nâng cao sinh kế cho bà con nông dân.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 md:px-12 -translate-y-12 z-20 relative max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-100 text-center">
              <span className="text-3xl md:text-4xl font-black text-primary block mb-2">95%+</span>
              <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Độ chính xác AI</span>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-100 text-center">
              <span className="text-3xl md:text-4xl font-black text-primary block mb-2">10k+</span>
              <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Bà con tin dùng</span>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-100 text-center">
              <span className="text-3xl md:text-4xl font-black text-primary block mb-2">50k+</span>
              <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Ca chẩn đoán</span>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-slate-100 text-center">
              <span className="text-3xl md:text-4xl font-black text-primary block mb-2">3 giây</span>
              <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Phản hồi tức thì</span>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl font-bold">flag</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Sứ Mệnh Của Chúng Tôi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ứng dụng các tiến bộ công nghệ mới nhất về Trí tuệ Nhân tạo (AI) và Phân tích dữ liệu lớn để hỗ trợ người nông dân dễ dàng theo dõi sức khỏe cây trồng, nhận diện sâu bệnh sớm và đưa ra phác đồ điều trị kịp thời, thân thiện với môi trường, giảm bớt sự phụ thuộc vào hóa chất độc hại.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl font-bold">visibility</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Tầm Nhìn Chiến Lược</h3>
                <p className="text-slate-600 leading-relaxed">
                  Xây dựng AgriAI trở thành nền tảng nông nghiệp số thông minh hàng đầu tại Việt Nam và Đông Nam Á. Chúng tôi định hướng tạo dựng một hệ sinh thái kết nối chặt chẽ giữa Nhà khoa học, Nhà nông, và Doanh nghiệp phân phối vật tư, góp phần thúc đẩy sản lượng nông nghiệp sạch đạt tiêu chuẩn xuất khẩu quốc tế.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto bg-surface-container/30 rounded-3xl mb-16">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">verified_user</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Chính Xác & Tin Cậy</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Mô hình AI được huấn luyện liên tục dựa trên hàng trăm ngàn hình ảnh mẫu kiểm duyệt bởi các chuyên gia nông nghiệp hàng đầu.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">rocket_launch</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Đột Phá Công Nghệ</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Luôn tiên phong đưa các giải pháp số hóa thông minh, bản đồ phân bố và chatbot trợ lý 24/7 trực quan tới tay người nông dân Việt.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-3xl font-bold">nature_people</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Đồng Hành Bền Vững</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hướng tới mô hình canh tác xanh, tối thiểu hóa chi phí đầu vào, bảo vệ đất đai, nguồn nước và bảo đảm sức khỏe cho cộng đồng.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Highlights Section */}
        <section className="px-6 md:px-12 py-8 max-w-6xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl overflow-hidden shadow-xl flex flex-col lg:flex-row border border-emerald-800">
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wide">ỨNG DỤNG CÔNG NGHỆ CAO</span>
              <h3 className="text-3xl font-extrabold mb-6 leading-tight">Giải Pháp Trí Tuệ Nhân Tạo Thông Minh Cho Cây Trồng</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-emerald-100">
                  <span className="material-symbols-outlined text-emerald-400 font-bold">check_circle</span>
                  <span><strong>AI Computer Vision:</strong> Phân tích hình ảnh lá bệnh hại để nhận diện và kết luận tác nhân (nấm, vi khuẩn, virus) ngay lập tức.</span>
                </li>
                <li className="flex items-start space-x-3 text-emerald-100">
                  <span className="material-symbols-outlined text-emerald-400 font-bold">check_circle</span>
                  <span><strong>Bản Đồ Phân Bố Số:</strong> Theo dõi các ổ dịch bệnh bùng phát tại địa phương giúp đưa ra khuyến cáo phòng chống chủ động.</span>
                </li>
                <li className="flex items-start space-x-3 text-emerald-100">
                  <span className="material-symbols-outlined text-emerald-400 font-bold">check_circle</span>
                  <span><strong>Trợ Lý Ảo Chatbot:</strong> Giải đáp mọi thắc mắc của người nông dân về quy trình kỹ thuật gieo cấy và bón phân theo mùa vụ.</span>
                </li>
              </ul>
            </div>
            <div className="w-full lg:w-1/2 min-h-[300px] relative overflow-hidden bg-emerald-850">
              <img
                alt="Smart technology visualization"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCziuK8XcOhggpQw3MoBgYvXQSYIolG-d3DUPUEAcJ4Q_WRtqUEcPzxtGNDgK1FR8Kzye-tLlyhqySXevVeAj8H72_pgdEXNEGRFZR1uhnLEAGZ3E94EKWl02hDSH2ITlXnjwyFx27BL2zAgzetixWcWsNSltjXpAVvoyXVXBHkpq_RPy-5-ZE0L_qwRFrJ2hev-TLnSfluh42GEI5vC89eJykwl0g0QQ0Gk07b9WBW0G9rd3-arqO6T0KoqHAHMX-7I3G5yj3fCGFI"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-emerald-950 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-16 text-center bg-emerald-50 border-t border-emerald-100">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Trải Nghiệm Hệ Sinh Thái AgriAI Ngay Hôm Nay</h3>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Chỉ mất vài giây để nhận diện bệnh hại cây trồng của bạn và nhận phác đồ chăm sóc toàn diện hoàn toàn miễn phí.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/diagnosis"
                className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">camera</span>
                Chẩn đoán bệnh ngay
              </Link>
              <Link
                to="/warning-map"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">map</span>
                Bản đồ dịch bệnh
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
