function Stars({ rating }) {
  if (!rating) return <span className="text-xs text-on-surface-variant">Chưa cho sao</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
}

export default function LatestReviewsPanel({ data = [] }) {
  return (
    <div className="bento-card rounded-xl shadow-sm border border-outline-variant/10">
      <div className="p-6 pb-3">
        <h2 className="text-lg font-bold">Đánh giá gần đây</h2>
      </div>
      <div className="divide-y divide-outline-variant/20">
        {data.length === 0 ? (
          <div className="px-6 py-8 text-center text-on-surface-variant text-sm">Chưa có đánh giá</div>
        ) : data.map((item) => (
          <div key={item.id} className="px-6 py-4 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {item.userName ? item.userName.slice(0, 2).toUpperCase() : 'KH'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.userName || 'Khách'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.accurate ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                  {item.accurate ? 'Chính xác' : 'Không chính xác'}
                </span>
              </div>
              <Stars rating={item.rating} />
              {item.feedback && (
                <p className="text-xs text-on-surface-variant mt-1 truncate">{item.feedback}</p>
              )}
              <p className="text-[10px] text-on-surface-variant mt-1">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
