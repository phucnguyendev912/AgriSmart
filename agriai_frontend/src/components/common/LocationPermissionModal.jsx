import React from 'react';

export default function LocationPermissionModal({
  open,
  loading,
  blocked,
  title = 'Cho phép truy cập vị trí?',
  description = 'Hệ thống có thể sử dụng vị trí của bạn để hiển thị cảnh báo thời tiết và gợi ý theo khu vực chính xác hơn.',
  onAllow,
  onContinue,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-permission-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose?.();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-5 border-b border-slate-100 flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
          </div>
          <div className="min-w-0">
            <h3 id="location-permission-title" className="text-lg font-black text-slate-950">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {blocked
                ? 'Trình duyệt đang chặn quyền vị trí. Bạn có thể bật lại quyền vị trí trong cài đặt của trình duyệt, hoặc tiếp tục sử dụng không có vị trí.'
                : description}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 transition"
          >
            Tiếp tục không dùng vị trí
          </button>
          <button
            type="button"
            onClick={onAllow}
            disabled={loading || blocked}
            className="px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:brightness-95 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            )}
            Cho phép vị trí
          </button>
        </div>
      </div>
    </div>
  );
}
