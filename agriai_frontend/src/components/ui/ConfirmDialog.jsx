import React from 'react';

export default function ConfirmDialog({
  isOpen,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
  isDestructive = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up-fast">
        <div className="px-5 py-5 border-b border-slate-100 flex items-start gap-3">
          <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${
            isDestructive ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-950">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50/50 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-lg text-sm font-bold text-white transition ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-primary hover:brightness-95'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
