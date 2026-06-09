import React, { useState, useEffect, useRef } from 'react';
import { getAllReviews } from '../../../services/diagnosisService';

const PAGE_SIZE = 8;

/**
 * ReviewCard — single review card with avatar, stars, and feedback
 */
const ReviewCard = ({ item, isNew }) => {
  const initials = item.userName
    ? item.userName.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : 'ND';

  const formattedDate = item.createdAt
    ? new Date(
        item.createdAt.endsWith('Z') || item.createdAt.includes('+')
          ? item.createdAt
          : item.createdAt + 'Z'
      ).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '';

  const rating = item.rating || 5;

  return (
    <div
      className={`review-card bg-white rounded-2xl p-5 flex flex-col h-full relative overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 ${
        isNew ? 'review-card-new' : ''
      }`}
    >
      {/* decorative quote */}
      <span
        className="material-symbols-outlined absolute top-3 right-3 text-emerald-50 select-none"
        style={{ fontSize: '3rem', lineHeight: 1 }}
        aria-hidden="true"
      >
        format_quote
      </span>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3 relative z-10" aria-label={`${rating} sao`}>
        {[...Array(5)].map((_, idx) => (
          <span
            key={idx}
            className="material-symbols-outlined text-amber-400"
            style={{
              fontSize: '14px',
              fontVariationSettings: `'FILL' ${idx < rating ? 1 : 0}`,
            }}
          >
            star
          </span>
        ))}
      </div>

      {/* Feedback text */}
      <p className="text-slate-600 italic text-sm leading-relaxed flex-1 relative z-10 line-clamp-4 mb-4">
        &ldquo;{item.feedback}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-xs leading-tight">
            {item.userName || 'Nhà nông'}
          </p>
          {formattedDate && (
            <p className="text-[10px] text-slate-400 mt-0.5">{formattedDate}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonCard — loading placeholder
 */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 flex flex-col h-full border border-slate-100 shadow-sm animate-pulse">
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-full bg-slate-200" />
      ))}
    </div>
    <div className="flex-1 space-y-2 mb-4">
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-5/6" />
      <div className="h-3 bg-slate-200 rounded w-4/6" />
    </div>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-200" />
      <div className="space-y-1">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-2 w-14 bg-slate-100 rounded" />
      </div>
    </div>
  </div>
);

/**
 * FarmerStories Component
 * Fetches and displays user feedback with load-more pagination.
 */
const FarmerStories = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newIndexStart, setNewIndexStart] = useState(0);
  const loadMoreRef = useRef(null);

  // Fetch reviews — append to list on load more
  const fetchReviews = async (pageNum, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const response = await getAllReviews({ page: pageNum, size: PAGE_SIZE });
      const data = response.data;

      if (data && Array.isArray(data.content)) {
        // Pageable response from Spring Boot
        setTotalPages(data.totalPages ?? null);
        if (append) {
          setNewIndexStart((prev) => prev + (reviews.length > 0 ? reviews.length : 0));
          setReviews((prev) => [...prev, ...data.content]);
        } else {
          setNewIndexStart(0);
          setReviews(data.content);
          setTotalPages(data.totalPages ?? null);
        }
      } else if (data && Array.isArray(data)) {
        // Fallback: plain array — client-side slice
        setTotalPages(1);
        if (append) {
          setReviews((prev) => [...prev, ...data.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE)]);
        } else {
          setReviews(data.slice(0, PAGE_SIZE));
        }
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
    // Slight delay then scroll so new cards are visible
    setTimeout(() => {
      loadMoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const hasMore = totalPages === null || page + 1 < totalPages;

  return (
    <>
      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .review-card-new {
          animation: cardFadeIn 0.45s ease both;
        }
        .review-card:hover {
          box-shadow: 0 8px 28px rgba(16,185,129,0.10), 0 2px 8px rgba(0,0,0,0.06);
          border-color: #a7f3d0;
          transform: translateY(-2px);
        }
      `}</style>

      <section className="px-6 md:px-12 py-20 bg-surface">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Đánh giá từ nhà nông</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              AgriAI đồng hành cùng hàng ngàn hộ nông dân khắp Việt Nam
            </p>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-slate-400 py-16">Chưa có đánh giá nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {reviews.map((item, i) => (
                <ReviewCard
                  key={`${item.id ?? i}-${page}`}
                  item={item}
                  isNew={i >= newIndexStart && newIndexStart > 0}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="flex justify-center mt-10" ref={loadMoreRef}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>expand_more</span>
                    Xem thêm đánh giá
                  </>
                )}
              </button>
            </div>
          )}

          {/* End message */}
          {!loading && !hasMore && reviews.length > PAGE_SIZE && (
            <p className="text-center text-slate-400 text-sm mt-8">
              Đã hiển thị tất cả {reviews.length} đánh giá ✓
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default FarmerStories;
