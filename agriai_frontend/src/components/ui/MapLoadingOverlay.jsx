import React from 'react';

export default function MapLoadingOverlay({ visible }) {
  return (
    <div
      className={`absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[500] flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white px-5 py-3.5 rounded-xl shadow-xl border border-slate-150 flex items-center gap-3 animate-fade-in-up-fast">
        <span className="material-symbols-outlined text-primary animate-spin text-2xl">
          progress_activity
        </span>
        <span className="text-sm font-bold text-slate-700">Đang tải bản đồ...</span>
      </div>
    </div>
  );
}
