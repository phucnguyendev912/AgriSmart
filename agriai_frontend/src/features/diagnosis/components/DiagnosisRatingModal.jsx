import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getReview, submitReview } from '../../../services/diagnosisService';


const DiagnosisRatingModal = ({ historyId, onClose, onSuccess }) => {
    const [accuracy, setAccuracy] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await getReview(historyId);
                if (res.data) {
                    setAccuracy(res.data.isAccurate ? 'accurate' : 'inaccurate');
                    setRating(res.data.rating || 0);
                    setFeedback(res.data.feedback || '');
                }
            } catch (err) {
                // Ignore 404 since it implies there is no review yet
            }
        };
        if (historyId) {
            fetchReview();
        }
    }, [historyId]);

    const handleSubmit = async () => {
        if (!accuracy && rating === 0) return;
        try {
            await submitReview({
                historyId,
                isAccurate: accuracy === 'accurate',
                rating: rating || null,
                feedback: feedback || null
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 bg-zinc-950/40 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div 
                className="bg-surface-container-lowest dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl flex flex-col relative max-h-[85vh] overflow-y-auto border border-outline-variant/10 dark:border-slate-800"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 text-on-surface-variant/70 hover:text-on-surface dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-full hover:bg-surface-container-high dark:hover:bg-slate-800"
                    aria-label="Đóng"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-2 text-center">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="material-symbols-outlined text-primary dark:text-[#5adf82] text-2xl">rate_review</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-on-surface dark:text-white">Đánh giá kết quả chẩn đoán</h2>
                    <p className="text-on-surface-variant dark:text-zinc-400 text-xs mt-1 leading-relaxed px-4">
                        Ý kiến của bạn giúp AI của chúng tôi học hỏi và hỗ trợ nông dân tốt hơn mỗi ngày.
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-5">
                    {/* Accuracy */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest text-center block">
                             Kết quả chẩn đoán có chính xác không?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAccuracy('accurate')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${accuracy === 'accurate'
                                    ? 'border-primary bg-primary/10 text-primary dark:border-primary-container dark:bg-primary-container/20 dark:text-[#5adf82]'
                                    : 'border-zinc-200 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-white dark:bg-slate-800/50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl mb-0.5"
                                    style={{ fontVariationSettings: accuracy === 'accurate' ? "'FILL' 1" : "'FILL' 0" }}>
                                    check_circle
                                </span>
                                <span className="text-xs font-bold">Chính xác</span>
                            </button>
                            <button
                                onClick={() => setAccuracy('inaccurate')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${accuracy === 'inaccurate'
                                    ? 'border-error bg-error-container text-on-error-container dark:border-red-500/50 dark:bg-red-950/20 dark:text-red-400'
                                    : 'border-zinc-200 dark:border-slate-800 hover:border-zinc-300 dark:hover:border-slate-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-white dark:bg-slate-800/50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl mb-0.5">cancel</span>
                                <span className="text-xs font-bold">Không chính xác</span>
                            </button>
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="space-y-2 text-center">
                        <label className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest block">Đánh giá trải nghiệm</label>
                        <div className="flex justify-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className={`transition-transform hover:scale-125 ${star <= (hoveredRating || rating) ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl"
                                        style={{ fontVariationSettings: star <= (hoveredRating || rating) ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <textarea
                            className="w-full bg-surface-container-low dark:bg-slate-800/80 border border-outline-variant/20 dark:border-slate-700 rounded-lg text-xs px-4 py-2.5 text-on-surface dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-[#5adf82] transition-all resize-none"
                            placeholder="Ý kiến đóng góp khác (tùy chọn)..."
                            rows="3"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-1">
                        <button
                            onClick={handleSubmit}
                            disabled={!accuracy && rating === 0}
                            className={`w-full py-2.5 rounded-xl font-bold transition-all ${(!accuracy && rating === 0)
                                ? 'bg-surface-container-high text-on-surface-variant dark:bg-slate-800 dark:text-zinc-600 cursor-not-allowed opacity-60'
                                : 'bg-primary dark:bg-primary-container text-on-primary dark:text-[#f7fff3] shadow-lg shadow-primary/20 dark:shadow-none hover:brightness-110 active:scale-[0.98]'
                                }`}
                        >
                            Gửi đánh giá
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisRatingModal;
