import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { DiagnosisRatingModal } from '../features/diagnosis';
import { getHistory } from '../services/diagnosisService';

const DATE_FILTERS = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'last7', label: '7 ngày qua' },
    { key: 'last30', label: '30 ngày qua' },
    { key: 'custom', label: 'Tùy chỉnh' }
];

/**
 * Formats a Date object to a string in YYYY-MM-DD format.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Backend trả về LocalDateTime không có timezone ("2026-05-23T16:30:00").
// Một số browser hiểu chuỗi này là UTC → lệch 7h. Hàm này gắn +07:00 để đảm bảo đúng giờ VN.
const parseVnDate = (iso) => {
    if (!iso) return null;
    const normalized = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
    return new Date(normalized);
};

/**
 * Calculates preset date range (today, last 7 days, last 30 days).
 * @param {string} filterKey - Predefined date filter key.
 * @returns {{fromDate: string, toDate: string}} The computed date range.
 */

const getPresetRange = (filterKey) => {
    const today = new Date();
    const fromDate = new Date(today);

    if (filterKey === 'last7') {
        fromDate.setDate(today.getDate() - 6);
    } else if (filterKey === 'last30') {
        fromDate.setDate(today.getDate() - 29);
    }

    return {
        fromDate: formatDateInput(fromDate),
        toDate: formatDateInput(today)
    };
};

/**
 * Maps severity code to Tailwind styling classes.
 * @param {string} severity - Severity level code.
 * @returns {string} Tailwind CSS class string.
 */
const getSeverityClasses = (severity) => {
    if (severity === 'NANG') return 'bg-error-container text-on-error-container';
    if (severity === 'TRUNG_BINH') return 'bg-secondary-container text-on-secondary-container';
    if (severity === 'NHE') return 'bg-primary-container text-on-primary-container';
    return 'bg-surface-variant text-on-surface-variant';
};

/**
 * Converts severity code to user-friendly label.
 * @param {string} severity - Severity level code.
 * @returns {string} The localized label.
 */
const getSeverityLabel = (severity) => {
    if (severity === 'NANG') return 'Nặng';
    if (severity === 'TRUNG_BINH') return 'Trung bình';
    if (severity === 'NHE') return 'Nhẹ';
    return severity || 'N/A';
};

/**
 * DiagnosisHistoryPage Component
 * Renders list of historical crop diagnoses with date filters and ratings.
 */
const DiagnosisHistoryPage = () => {
    const { user } = useAuth();
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [activeDateFilter, setActiveDateFilter] = useState('today');
    const [customFromDate, setCustomFromDate] = useState(() => formatDateInput(new Date()));
    const [customToDate, setCustomToDate] = useState(() => formatDateInput(new Date()));

    const isInvalidCustomRange = activeDateFilter === 'custom'
        && customFromDate
        && customToDate
        && customFromDate > customToDate;

    // Memoize date parameters to prevent unnecessary API fetches
    const dateParams = useMemo(() => {
        if (activeDateFilter === 'custom') {
            return {
                ...(customFromDate ? { fromDate: customFromDate } : {}),
                ...(customToDate ? { toDate: customToDate } : {})
            };
        }

        return getPresetRange(activeDateFilter);
    }, [activeDateFilter, customFromDate, customToDate]);

    const openRatingModal = (id) => {
        setSelectedHistoryId(id);
        setIsRatingModalOpen(true);
    };

    const handleDateFilterChange = (filterKey) => {
        setActiveDateFilter(filterKey);
        setPage(0);
    };

    useEffect(() => {
        // Fetch paginated history from service based on date filters
        const fetchHistory = async () => {
            if (isInvalidCustomRange) {
                setHistoryList([]);
                setTotalPages(0);
                setTotalElements(0);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await getHistory({ page, size: 10, ...dateParams });
                setHistoryList(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } catch (err) {
                console.error('Failed to get history:', err);
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
            // Reset state if user logs out
            setHistoryList([]);
            setTotalPages(0);
            setTotalElements(0);
            setLoading(false);
        }
    }, [user, page, dateParams, isInvalidCustomRange]);

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
                            {DATE_FILTERS.map((filter) => (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => handleDateFilterChange(filter.key)}
                                    className={`px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 ${
                                        activeDateFilter === filter.key
                                            ? 'bg-surface-container-lowest text-primary shadow-sm'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    <span>{filter.label}</span>
                                    {filter.key === 'custom' && (
                                        <span className="material-symbols-outlined text-[14px] lg:text-[16px]">calendar_month</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {activeDateFilter === 'custom' && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 shadow-sm">
                        <label className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant">
                            Từ ngày
                            <input
                                type="date"
                                value={customFromDate}
                                max={customToDate || undefined}
                                onChange={(event) => {
                                    setCustomFromDate(event.target.value);
                                    setPage(0);
                                }}
                                className="rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:ring-primary"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-bold text-on-surface-variant">
                            Đến ngày
                            <input
                                type="date"
                                value={customToDate}
                                min={customFromDate || undefined}
                                onChange={(event) => {
                                    setCustomToDate(event.target.value);
                                    setPage(0);
                                }}
                                className="rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm font-medium text-on-surface focus:border-primary focus:ring-primary"
                            />
                        </label>
                        {isInvalidCustomRange && (
                            <p className="text-xs font-bold text-error">Ngày bắt đầu không được lớn hơn ngày kết thúc.</p>
                        )}
                    </div>
                )}

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
                                            <p className="text-sm font-bold text-on-surface">{parseVnDate(item.createdAt)?.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}</p>
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
                                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">{parseVnDate(item.createdAt)?.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}</p>
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
