import React from 'react';
import useScrollReveal from '../../../hooks/useScrollReveal';

/**
 * Features Component
 * Landing page sections displaying AgriAI solution features, step-by-step guidance,
 * and user testimonials.
 * Scroll-triggered staggered animations on feature cards and steps.
 */
const Features = () => {
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <>
      {/* Features List Section */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Giải pháp AI dành riêng cho nông dân Việt</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Cards — staggered scroll reveal */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'center_focus_strong',
                title: 'Chẩn đoán bằng ảnh',
                desc: 'Sử dụng camera điện thoại chụp ảnh lá bệnh, AI nhận diện chính xác bệnh hại chỉ sau 3 giây.',
              },
              {
                icon: 'smart_toy',
                title: 'Chatbot 24/7',
                desc: 'Hỗ trợ tư vấn kỹ thuật canh tác, phòng trừ sâu bệnh mọi lúc mọi nơi cùng chuyên gia ảo.',
              },
              {
                icon: 'prescriptions',
                title: 'Phác đồ xử lý',
                desc: 'Đề xuất loại thuốc bảo vệ thực vật và liều lượng sử dụng hiệu quả, tiết kiệm chi phí.',
              },
            ].map((feature, index) => (
              <div
                key={feature.icon}
                className={`p-8 rounded-3xl border border-gray-100 bg-surface hover:shadow-xl hover:-translate-y-1 group scroll-reveal ${
                  featuresVisible ? 'is-visible' : ''
                }`}
                style={{
                  transitionDelay: `${index * 0.12}s`,
                }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50 overflow-hidden text-center" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-20">Chỉ 3 bước – Xong ngay trong 30 giây</h2>
          <div ref={stepsRef} className="flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0 relative">
            {[
              { num: '01', title: 'Chụp ảnh', desc: 'Lá hoặc thân cây' },
              { num: '02', title: 'AI phân tích', desc: 'Hệ thống xử lý' },
              { num: '03', title: 'Phác đồ', desc: 'Đề xuất thuốc xử lý' },
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div
                  className={`flex-1 z-10 scroll-reveal ${stepsVisible ? 'is-visible' : ''}`}
                  style={{
                    transitionDelay: `${index * 0.15}s`,
                  }}
                >
                  <div className="text-8xl font-black step-number mb-6 opacity-40">{step.num}</div>
                  <h4 className="text-2xl font-bold mb-2">{step.title}</h4>
                  <p className="text-on-surface-variant">{step.desc}</p>
                </div>
                {index < 2 && (
                  <div
                    className={`hidden md:block w-24 border-t-2 border-dashed border-primary/30 scroll-reveal ${
                      stepsVisible ? 'is-visible' : ''
                    }`}
                    style={{
                      transitionDelay: `${index * 0.15 + 0.1}s`,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
