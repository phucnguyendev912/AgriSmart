import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Modal đánh giá kết quả chẩn đoán.
 * Props: historyId, accessToken, onClose, onSuccess
 */
const DiagnosisRatingModal = ({ historyId, accessToken, onClose, onSuccess }) => {
    const [accuracy, setAccuracy] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async () => {
        if (!accuracy && rating === 0) return;
        try {
            await axios.post(`${API_URL}/api/reviews`, {
                historyId,
                isAccurate: accuracy === 'accurate',
                rating: rating || null,
                feedback: feedback || null
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-950/40 backdrop-blur-[2px]">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">rate_review</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-on-surface">Đánh giá kết quả chẩn đoán</h2>
                    <p className="text-on-surface-variant text-sm mt-2 leading-relaxed px-4">
                        Ý kiến của bạn giúp AI của chúng tôi học hỏi và hỗ trợ nông dân tốt hơn mỗi ngày.
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 space-y-8">
                    {/* Accuracy */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center block">
                            Kết quả chẩn đoán có chính xác không?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAccuracy('accurate')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                                    accuracy === 'accurate'
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-zinc-100 hover:border-zinc-200 text-zinc-400 hover:text-zinc-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl mb-1"
                                    style={{ fontVariationSettings: accuracy === 'accurate' ? "'FILL' 1" : "'FILL' 0" }}>
                                    check_circle
                                </span>
                                <span className="text-sm font-bold">Chính xác</span>
                            </button>
                            <button
                                onClick={() => setAccuracy('inaccurate')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                                    accuracy === 'inaccurate'
                                        ? 'border-error bg-error-container text-on-error-container'
                                        : 'border-zinc-100 hover:border-zinc-200 text-zinc-400 hover:text-zinc-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl mb-1">cancel</span>
                                <span className="text-sm font-medium">Không chính xác</span>
                            </button>
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="space-y-3 text-center">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block">Đánh giá trải nghiệm</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className={`transition-transform hover:scale-125 ${star <= (hoveredRating || rating) ? 'text-secondary' : 'text-zinc-200'}`}
                                >
                                    <span className="material-symbols-outlined text-3xl"
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
                            className="w-full bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400"
                            placeholder="Ý kiến đóng góp khác (tùy chọn)..."
                            rows="3"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={!accuracy && rating === 0}
                            className={`w-full py-4 rounded-lg font-bold transition-all ${
                                (!accuracy && rating === 0)
                                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
                                    : 'bg-primary text-on-primary shadow-lg hover:brightness-110 active:scale-[0.98]'
                            }`}
                        >
                            Gửi đánh giá
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-zinc-500 hover:text-zinc-800 text-sm font-medium transition-colors"
                        >
                            Bỏ qua
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisRatingModal;
