import React from 'react';
import { Link } from 'react-router-dom';
import { FarmerReviews as FarmerStories, WeatherDiseaseSection, RoadmapSection, BentoFeatures } from '../features/landing';

/**
 * HomePage Component
 * Renders the primary landing experience, including a hero section,
 * quick access features (AI Diagnosis, Weather, Chatbot, Disease Map),
 * and links to sub-modules.
 * Includes lightweight hero entrance animations and bento grid hover improvements.
 */
const HomePage = () => {
  return (
    <>
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
            {/* Badge — delay 0s */}
            <span
              className="animate-fade-in-up tracking-widest text-primary-fixed uppercase font-bold mb-4 block text-sm"
              style={{ animationDelay: '0s' }}
            >
              CÔNG NGHỆ VÌ NHÀ NÔNG
            </span>

            {/* Headline — delay 0.12s */}
            <h1
              className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-6"
              style={{ animationDelay: '0.12s' }}
            >
              Hệ thống AI chẩn đoán bệnh cây trồng-AgriSmart
            </h1>

            {/* Subtitle — delay 0.24s */}
            <p
              className="animate-fade-in-up text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed"
              style={{ animationDelay: '0.24s' }}
            >
              Giúp nông dân Việt Nam phát hiện bệnh sớm, giảm thiểu thiệt hại, tăng năng suất mùa vụ bằng công nghệ thị giác máy tính tiên tiến nhất.
            </p>

            {/* CTA — delay 0.36s */}
            <div
              className="animate-fade-in-up flex flex-wrap gap-4 justify-center md:justify-start"
              style={{ animationDelay: '0.36s' }}
            >
              <Link
                to="/diagnosis"
                className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-lg flex items-center gap-3 font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span className="material-symbols-outlined">camera</span>
                Chẩn đoán bệnh ngay
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="px-6 md:px-12 -translate-y-12 z-20 relative max-w-7xl mx-auto">
        </section>

        <BentoFeatures />

        <WeatherDiseaseSection />

        <FarmerStories />
        <RoadmapSection />
      </main>
    </>
  );
};

export default HomePage;
