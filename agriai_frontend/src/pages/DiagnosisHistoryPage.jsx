import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import DiagnosisRatingModal from '../features/diagnosis/components/DiagnosisRatingModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getSeverityClasses = (severity) => {
    if (severity === 'NANG') return 'bg-error-container text-on-error-container';
    if (severity === 'TRUNG_BINH') return 'bg-secondary-container text-on-secondary-container';
    if (severity === 'NHE') return 'bg-primary-container text-on-primary-container';
    return 'bg-surface-variant text-on-surface-variant';
};

const getSeverityLabel = (severity) => {
    if (severity === 'NANG') return 'Nặng';
    if (severity === 'TRUNG_BINH') return 'Trung bình';
    if (severity === 'NHE') return 'Nhẹ';
    return severity || 'N/A';
};

const DiagnosisHistoryPage = () => {
    const { user } = useAuth();
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);

    const openRatingModal = (id) => {
        setSelectedHistoryId(id);
        setIsRatingModalOpen(true);
    };

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/diagnosis/history`, {
                    params: { page, size: 10 },
                    withCredentials: true
                });
                setHistoryList(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } catch (err) {
                console.error('Lỗi lấy lịch sử:', err);
                setHistoryList([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchHistory();
        } else {
            setHistoryList([]);
            setTotalPages(0);
            setTotalElements(0);
            setLoading(false);
        }
    }, [user, page]);

    return (
        <main className="pt-24 lg:pt-32 pb-12 px-4 md:px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight leading-tight">Lịch sử chẩn đoán</h2>
                        <p className="text-on-surface-variant mt-1 text-sm lg:text-base">Theo dõi và quản lý sức khỏe cây trồng qua thời gian.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-surface-container-low p-1 rounded-xl flex overflow-x-auto no-scrollbar max-w-full">
                            <button className="px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-lg bg-surface-container-lowest text-primary shadow-sm whitespace-nowrap">Hôm nay</button>
                            <button className="px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-lg text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">7 ngày qua</button>
                            <button className="px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-lg text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">30 ngày qua</button>
                            <button className="px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-lg text-on-surface-variant hover:text-on-surface transition-colors flex items-center space-x-1 whitespace-nowrap">
                                <span>Tùy chỉnh</span>
                                <span className="material-symbols-outlined text-[14px] lg:text-[16px]">calendar_month</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-container-low">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Thời gian</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Mẫu vật</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Loại cây</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Mức độ</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Độ tin cậy</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant font-medium">Đang tải lịch sử...</td>
                                    </tr>
                                ) : historyList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant font-medium">Chưa có lịch sử chẩn đoán nào.</td>
                                    </tr>
                                ) : historyList.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-on-surface">{new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
                                            <p className="text-[10px] text-on-surface-variant">ID: #{item.id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <img alt={`Plant sample ${index}`} className="w-12 h-12 rounded-lg object-cover ring-1 ring-outline-variant/20" src={item.originalImageUrl || 'https://placehold.co/100x100?text=No+Image'} />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{item.cropName || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getSeverityClasses(item.severity)}`}>
                                                {getSeverityLabel(item.severity)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 h-1.5 w-16 bg-surface-container-high rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${item.confidence ? Math.round(item.confidence * 100) : 0}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-primary">{item.confidence ? Math.round(item.confidence * 100) : '-'}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!item.isReviewed ? (
                                                    <button
                                                        onClick={() => openRatingModal(item.id)}
                                                        className="text-secondary hover:bg-secondary/5 p-2 rounded-lg transition-colors group flex items-center gap-1 text-[10px] font-bold"
                                                        title="Đánh giá kết quả"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">rate_review</span>
                                                        <span>Đánh giá</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openRatingModal(item.id)}
                                                        className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                                                        title="Sửa đánh giá"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        Đã ĐG
                                                    </button>
                                                )}
                                                <Link to={`/history/${item.id}`} className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors group inline-block" title="Xem chi tiết">
                                                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">visibility</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden divide-y divide-outline-variant/10">
                        {loading ? (
                            <div className="p-8 text-center text-on-surface-variant font-medium">Đang tải...</div>
                        ) : historyList.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant font-medium">Chưa có lịch sử chẩn đoán nào.</div>
                        ) : historyList.map((item, index) => (
                            <div key={item.id || index} className="p-4 flex space-x-4">
                                <img alt={`Plant sample mobile ${index}`} className="w-16 h-16 rounded-xl object-cover shrink-0" src={item.originalImageUrl || 'https://placehold.co/100x100?text=No+Image'} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">{new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
                                            <p className="text-xs text-on-surface-variant">{item.cropName || 'N/A'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getSeverityClasses(item.severity)}`}>
                                            {getSeverityLabel(item.severity)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-outline-variant/5 pt-2">
                                        {!item.isReviewed ? (
                                            <button
                                                onClick={() => openRatingModal(item.id)}
                                                className="text-[11px] font-bold text-secondary flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">rate_review</span>
                                                <span>Đánh giá</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => openRatingModal(item.id)}
                                                className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Đã đánh giá
                                            </button>
                                        )}
                                        <Link to={`/history/${item.id}`} className="text-[11px] font-bold text-[#006194] flex items-center space-x-1 hover:underline">
                                            <span>Chi tiết</span>
                                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 bg-surface-container-low/30 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <p className="text-[11px] text-on-surface-variant">
                            Hiển thị {historyList.length > 0 ? (page * 10) + 1 : 0} - {Math.min((page + 1) * 10, totalElements)} trên tổng số {totalElements} bản ghi
                        </p>
                        {totalPages > 1 && (
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>

                                {Array.from({ length: totalPages }).map((_, idx) => {
                                    if (totalPages <= 7 || idx === 0 || idx === totalPages - 1 || Math.abs(page - idx) <= 1) {
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setPage(idx)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold ${page === idx ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-white'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    }
                                    if (idx === 1 && page > 2) {
                                        return <span key={idx} className="px-1 text-on-surface-variant text-[11px]">...</span>;
                                    }
                                    if (idx === totalPages - 2 && page < totalPages - 3) {
                                        return <span key={idx} className="px-1 text-on-surface-variant text-[11px]">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page === totalPages - 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-white disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isRatingModalOpen && (
                <DiagnosisRatingModal
                    historyId={selectedHistoryId}
                    onClose={() => setIsRatingModalOpen(false)}
                    onSuccess={() => {
                        toast.success('Cảm ơn bạn đã đánh giá kết quả chẩn đoán!');
                        setHistoryList((prev) => prev.map((history) => (
                            history.id === selectedHistoryId ? { ...history, isReviewed: true } : history
                        )));
                    }}
                />
            )}
        </main>
    );
};

export default DiagnosisHistoryPage;
