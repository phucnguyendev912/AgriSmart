import React from 'react';

export default function EmptyState({
  icon = 'inbox',
  title = 'Không có dữ liệu',
  description = 'Không tìm thấy dữ liệu yêu cầu.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-[2px]">
      <div className="h-16 w-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-100/80">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>
          {icon}
        </span>
      </div>
      
      <h3 className="text-base font-bold text-slate-800 mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && action.label && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:brightness-95 transition shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
