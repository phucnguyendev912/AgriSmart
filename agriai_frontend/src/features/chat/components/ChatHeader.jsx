import React from 'react';

/**
 * Header của chat widget: tiêu đề session, nút new session, lịch sử, đóng.
 */
const ChatHeader = ({ sessionTitle, isTyping, showHistory, onClose, onNewSession, onToggleHistory }) => {
  return (
    <header className="bg-[#00A651] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-white shrink-0">
      {/* left: back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
          </div>
          <div>
            <h2 className="font-bold text-base md:text-lg leading-tight line-clamp-1 max-w-[180px] md:max-w-xs">
              {sessionTitle}
            </h2>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              {' Đang hoạt động'}
            </p>
          </div>
        </div>
      </div>

      {/* right: new session + history + close */}
      <div className="flex items-center gap-1">
        <button
          onClick={onNewSession}
          disabled={isTyping}
          title="Tạo cuộc trò chuyện mới"
          className="hover:bg-white/10 p-2 rounded-full transition-colors disabled:opacity-40"
        >
          <span className="material-symbols-outlined">add_comment</span>
        </button>

        <button
          onClick={onToggleHistory}
          title="Lịch sử hội thoại"
          className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          <span className="material-symbols-outlined">history</span>
        </button>

        <button
          onClick={onClose}
          className="hover:bg-white/10 p-2 rounded-full transition-colors ml-1"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
