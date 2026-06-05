import React, { useState, useEffect, useCallback } from 'react';
import { getReviews } from '../services/reviewService';

const ReviewManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to render stars
  const renderStars = (rating) => {
    if (!rating) return <span className="text-stone-400 text-xs italic">Chưa đánh giá sao</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={`material-symbols-outlined text-sm ${star <= rating ? 'text-amber-400' : 'text-stone-200'}`}
          >
            star
          </span>
        ))}
        <span className="ml-1 text-xs font-bold text-slate-700">{rating}.0</span>
      </div>
    );
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReviews({ page, size });
      setReviews(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
      setError('Không thể kết nối đến máy chủ hoặc lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-emerald-700 font-medium">Quản lý đánh giá</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý đánh giá chẩn đoán</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Xem danh sách các đánh giá phản hồi từ người dùng về kết quả chẩn đoán bệnh.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        
        {/* Table Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách đánh giá</h2>
          <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-800 uppercase tracking-widest">
            {totalElements} kết quả
          </span>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <span className="material-symbols-outlined text-5xl">reviews</span>
            <p className="mt-2 text-sm font-semibold">Chưa có đánh giá nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-4 px-4">Người dùng</th>
                  <th className="py-4 px-4">Đánh giá sao</th>
                  <th className="py-4 px-4">Độ chính xác</th>
                  <th className="py-4 px-4">Phản hồi</th>
                  <th className="py-4 px-4">Ngày đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm font-medium text-slate-700">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {review.userFullName ? review.userFullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{review.userFullName}</p>
                          <p className="text-[11px] text-stone-400">ID: {review.userId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="py-4 px-4">
                      {review.accurate === true && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Chính xác
                        </span>
                      )}
                      {review.accurate === false && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
                          Không chính xác
                        </span>
                      )}
                      {review.accurate === null && (
                        <span className="text-xs text-stone-400 italic">Chưa xác định</span>
                      )}
                    </td>
                    <td className="py-4 px-4 max-w-xs md:max-w-sm">
                      <p className="text-sm text-slate-600 truncate" title={review.feedback}>
                        {review.feedback || <span className="text-stone-400 italic">Không có phản hồi chữ</span>}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-500">
                      {formatDate(review.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                Trước
              </button>
              
              <div className="flex items-center gap-0.5">
                {[...Array(totalPages).keys()].slice(Math.max(0, page - 2), Math.min(totalPages, page + 3)).map((pIndex) => (
                  <button
                    key={pIndex}
                    onClick={() => setPage(pIndex)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                      pIndex === page 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                        : 'border border-stone-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {pIndex + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                Sau
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagementPage;
