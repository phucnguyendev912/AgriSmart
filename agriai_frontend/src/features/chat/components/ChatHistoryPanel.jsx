import React from 'react';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  // Backend trả LocalDateTime không có timezone (VD: "2026-05-29T04:53:00")
  // Append 'Z' để browser parse đúng là UTC, tránh lệch 7 tiếng (UTC+7)
  const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  const diff = Date.now() - new Date(utcStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

/**
 * Panel lịch sử hội thoại — slide-in overlay bên phải.
 */
const ChatHistoryPanel = ({ sessions, activeSessionId, isLoadingHistory, isLoadingSession, onSelectSession, onClose }) => {
  return (
    <div className="absolute inset-0 z-20 flex mt-[64px] md:mt-[72px] rounded-b-2xl overflow-hidden">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      {/* panel */}
      <div className="relative ml-auto w-full max-w-xs md:max-w-sm h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Lịch sử hội thoại</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-lg text-slate-500">close</span>
          </button>
        </div>

        {/* scrollable session list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
              <span className="text-sm">Chưa có cuộc trò chuyện nào</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    disabled={isLoadingSession}
                    onClick={() => onSelectSession(session)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 disabled:opacity-50 ${session.id === activeSessionId ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <p className={`text-sm font-semibold line-clamp-1 ${session.id === activeSessionId ? 'text-primary' : 'text-slate-800'}`}>
                      {session.sessionTitle || 'Phiên tư vấn'}
                    </p>
                    {session.lastMessage && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {session.lastMessage}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-1">
                      {formatRelativeTime(session.lastMessageAt ?? session.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPanel;
