import React from 'react';

/**
 * Màn hình yêu cầu đăng nhập khi user chưa authenticate.
 */
const ChatLoginPrompt = ({ onClose }) => {
  return (
    <>
      <header className="bg-[#00A651] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h2 className="font-bold text-base md:text-lg leading-tight">Trợ lý AgriAI</h2>
            <p className="text-xs text-white/80">Tư vấn nông nghiệp thông minh</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 bg-slate-50">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Đăng nhập để chat với AgriBot</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Bạn cần đăng nhập để sử dụng tính năng tư vấn nông nghiệp AI.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <a
            href="/login"
            className="flex-1 bg-[#00A651] text-white text-center py-3 rounded-full font-semibold hover:brightness-95 transition-all shadow-md"
          >
            Đăng nhập
          </a>
          <a
            href="/register"
            className="flex-1 border border-[#00A651] text-[#00A651] text-center py-3 rounded-full font-semibold hover:bg-primary/5 transition-all"
          >
            Đăng ký
          </a>
        </div>
      </div>
    </>
  );
};

export default ChatLoginPrompt;
