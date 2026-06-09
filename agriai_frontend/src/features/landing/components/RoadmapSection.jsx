import React, { useEffect, useRef, useState } from 'react';

/**
 * RoadmapSection Component
 * Displays upcoming features planned for future releases of AgriAI.
 * Features a scroll-triggered fade-in animation for each card.
 */

const roadmapItems = [
  {
    icon: 'group',
    title: 'Cộng đồng Nông dân',
    description:
      'Diễn đàn chia sẻ kinh nghiệm canh tác, hỏi đáp về bệnh cây, kết nối hàng ngàn nông dân trên toàn quốc.',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
  },
  {
    icon: 'sensors',
    title: 'Tích hợp IoT',
    description:
      'Kết nối cảm biến đất, độ ẩm, nhiệt độ để giám sát vườn tự động 24/7 và nhận cảnh báo sớm từ xa.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
  },
  {
    icon: 'storefront',
    title: 'Sàn B2C Nông sản',
    description:
      'Kênh bán hàng trực tiếp từ nông dân đến người tiêu dùng, đảm bảo giá minh bạch và truy xuất nguồn gốc.',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
  },
  {
    icon: 'photo_camera',
    title: 'Chụp ảnh trực tiếp',
    description:
      'Camera real-time chẩn đoán bệnh ngay trên điện thoại mà không cần tải ảnh lên, kết quả tức thì.',
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
  },
];

const RoadmapCard = ({ item, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
      className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${item.bgClass} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-2xl ${item.colorClass}`}>
          {item.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
      </div>

      {/* Future badge */}
      <span className="self-start text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
        Sắp ra mắt
      </span>
    </div>
  );
};

const RoadmapSection = () => {
  return (
    <section className="px-6 md:px-12 py-16 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Lộ trình phát triển
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            AgriAI không ngừng đổi mới — những tính năng sau đây đang được phát triển để mang lại giá trị tốt hơn cho nhà nông.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapItems.map((item, index) => (
            <RoadmapCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
