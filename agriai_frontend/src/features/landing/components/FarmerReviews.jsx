import React, { useState, useEffect } from 'react';

const FarmerStories = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = "";
        const response = await fetch(`${API_URL}/api/reviews/all`);
        const data = await response.json();
        if (data && Array.isArray(data)) {
           setReviews(data);
        } else if (data && Array.isArray(data.content)) {
           setReviews(data.content);
        } else {
           setReviews([]);
        }
        
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <section className="px-6 md:px-12 py-16 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Đánh giá từ nhà nông</h2>
          <p className="text-slate-500">AgriAI đồng hành cùng hàng ngàn hộ nông dân khắp Việt Nam</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reviews.slice(0, 8).map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-outline-variant/10 relative flex flex-col h-full">
              <span className="material-symbols-outlined text-emerald-100 text-4xl absolute top-3 right-3">format_quote</span>
              
              <div className="flex gap-1 mb-3 relative z-10 text-amber-400">
                {[...Array(5)].map((_, idx) => (
                  <span key={idx} className="material-symbols-outlined text-xs" style={{ fontVariationSettings: `'FILL' ${idx < (item.rating || 5) ? 1 : 0}` }}>
                    star
                  </span>
                ))}
              </div>
                
              <p className="text-slate-600 italic mb-4 relative z-10 leading-relaxed text-sm flex-1 overflow-hidden text-ellipsis line-clamp-4">"{item.feedback}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                  ND
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{item.userName || 'Nhà nông'}</p>
                  <p className="text-[10px] text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmerStories;
