import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Reason code → Vietnamese label mapping
const REASON_LABELS = {
    MIX_COMPATIBLE: "Các hoạt chất tương thích, có thể phun chung",
    CONFLICT_SEPARATED: "Tách lịch phun do xung đột hoạt chất",
    WEATHER_BLOCKED: "Điều kiện thời tiết chưa phù hợp, cần hoãn phun",
    DEFAULT_PRIORITY: "Áp dụng phác đồ ưu tiên cho từng bệnh"
};

const DiagnosisHistoryDetailPage = () => {
    const { id } = useParams(); // useParams: lấy tham số ID từ URL để biết bản ghi lịch sử nào cần hiển thị.
    const { user } = useAuth(); // useAuth: kiểm tra đăng nhập.
    const [result, setResult] = useState(null); // useState: lưu dữ liệu chi tiết chẩn đoán lấy từ API.
    const [loading, setLoading] = useState(true); // useState: trạng thái đang tải dữ liệu chi tiết.
    const [error, setError] = useState(''); // useState: lưu thông báo lỗi nếu không lấy được dữ liệu.

    // useEffect: tự động tải chi tiết lịch sử khi ID hoặc user thay đổi.
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/diagnosis/${id}`, {
                    withCredentials: true
                });
                setResult(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể lấy dữ liệu chi tiết lịch sử.');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchDetail();
        else setLoading(false);
    }, [id, user]);

    // === HELPER FUNCTIONS ===
    const getCultivationMeasures = (result) => {
        if (!result) return [];
        const { diagnosisType, sprayPrograms } = result;
        const strategy = sprayPrograms && sprayPrograms.length > 0 ? sprayPrograms[0].strategy : "";
        if (diagnosisType === "HEALTHY") {
            return ["Tiếp tục theo dõi lá và thân 2-3 ngày/lần, giữ ruộng thông thoáng."];
        }
        if (diagnosisType === "UNKNOWN") {
            return ["Ảnh chưa đủ rõ để xác định bệnh. Nên chụp gần vùng tổn thương và chụp rõ nét hơn."];
        }
        if (strategy === "SEPARATE_SPRAY") {
            return ["Đã tách lịch phun theo từng nhóm hoạt chất để tránh xung đột."];
        }
        return ["Có thể xử lý trong một đợt phun, nhưng cần đọc kỹ cảnh báo trước khi pha."];
    };

    const diseases = result?.diseases || [];
    const sprayPrograms = result?.sprayPrograms || [];
    const interactionWarnings = result?.interactionWarnings || [];
    const weatherAlerts = result?.weatherAlerts || [];
    const warnings = result?.warnings || [];

    const getSeverityClasses = (severity) => {
        if (severity === 'NANG') return "bg-error-container text-on-error-container";
        if (severity === 'TRUNG_BINH') return "bg-secondary-container text-on-secondary-container";
        return "bg-primary-container text-on-primary-container";
    };
    const getSeverityLabel = (severity) => {
        if (severity === 'NANG') return 'Nặng';
        if (severity === 'TRUNG_BINH') return 'Trung bình';
        if (severity === 'NHE') return 'Nhẹ';
        return severity || 'N/A';
    };
    const getSeverityColor = (sev) => {
        if (sev === 'HIGH') return 'text-red-600 bg-red-50 border-red-200';
        if (sev === 'MEDIUM') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    };

    if (loading) {
        return (
            <div className="pt-24 lg:pt-32 pb-12 px-4 md:px-6 min-h-screen flex justify-center items-center bg-surface-container-low">
                <div className="text-on-surface-variant flex items-center space-x-2 font-bold">
                    <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                    <span>Đang tải dữ liệu chi tiết...</span>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="pt-24 lg:pt-32 pb-12 px-4 md:px-6 min-h-screen flex justify-center items-center bg-surface-container-low">
                <div className="bg-error/10 text-error p-8 rounded-2xl border border-error/20 flex flex-col items-center">
                    <span className="material-symbols-outlined text-5xl mb-3">error</span>
                    <p className="font-bold text-lg">{error || "Không tìm thấy dữ liệu."}</p>
                    <Link to="/history" className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">
                        Quay lại lịch sử
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Page Header (Back button + Title) */}
                <div className="flex flex-col gap-4">
                    <Link to="/history" className="inline-flex items-center text-primary text-sm font-bold hover:underline gap-1 self-start">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Quay lại lịch sử
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Chi tiết chẩn đoán</h2>
                            <p className="text-on-surface-variant mt-2 text-base md:text-lg">Xem lại kết quả và phác đồ điều trị cho mẫu vật #{id}.</p>
                        </div>
                    </div>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Image Preview */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                            <div className="relative group overflow-hidden rounded-lg bg-surface-container lg:min-h-0 h-80 flex items-center justify-center">
                                <img alt="Xem trước" className="w-full h-full object-cover" src={result.originalImageUrl || "https://placehold.co/400x400?text=No+Image"} />
                            </div>
                        </div>
                    </div>

                    {/* Detection Results List */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container-highest flex-grow">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">biotech</span>
                                    Kết quả phát hiện ({diseases.length})
                                </h3>
                            </div>
                            {diseases.length === 0 ? (
                                result.isHealthy ? (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-5xl text-emerald-500 mb-2 block">eco</span>
                                        <p className="text-lg font-bold text-emerald-600">Cây khỏe mạnh!</p>
                                        <p className="text-sm text-on-surface-variant mt-1">Không phát hiện bệnh ở thời điểm chụp.</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-5xl text-slate-400 mb-2 block">search_off</span>
                                        <p className="text-lg font-bold text-slate-600">Không phát hiện bệnh</p>
                                    </div>
                                )
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {diseases.map((disease, idx) => {
                                            return (
                                                <div key={idx} className="p-4 rounded-xl border-2 border-primary bg-primary/5 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-black text-on-surface text-sm">{disease.diseaseName}</h4>
                                                            <span className={`${getSeverityClasses(disease.severity)} text-[8px] px-1.5 py-0.5 rounded font-black uppercase inline-block mt-1.5`}>
                                                                Mức độ: {getSeverityLabel(disease.severity)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xl font-black text-primary">{disease.confidence != null ? `${Math.round(disease.confidence * 100)}%` : 'N/A'}</span>
                                                    </div>
                                                    {disease.confidence != null && (
                                                        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mb-1 mt-2">
                                                            <div className="bg-primary h-full" style={{ width: `${disease.confidence * 100}%` }}></div>
                                                        </div>
                                                    )}

                                                    {/* Weather Alerts removed from here to be displayed at the bottom */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Unified Weather Alerts Section under Diseases */}
                                    {weatherAlerts && weatherAlerts.filter(a => a.violated).length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {weatherAlerts.filter(a => a.violated).map((alert, aIdx) => {
                                                const text = alert.recommendationNote || `${alert.weatherFactor} hiện tại (${alert.actualValue}${alert.unit || ''}) không thích hợp.`;
                                                const colonIdx = text.indexOf(':');
                                                const hasColon = colonIdx > 0 && colonIdx < 80;
                                                const title = hasColon ? text.substring(0, colonIdx) : "Cảnh báo thời tiết";
                                                const desc = hasColon ? text.substring(colonIdx + 1).trim() : text;
                                                
                                                return (
                                                    <div key={aIdx} className="p-4 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
                                                        <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-error break-words leading-tight">{title}</span>
                                                            <span className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Default Warnings Section */}
                                    {warnings && warnings.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {warnings.map((warning, wIdx) => {
                                                const colonIdx = warning.indexOf(':');
                                                const hasColon = colonIdx > 0 && colonIdx < 80;
                                                const title = hasColon ? warning.substring(0, colonIdx) : "Cảnh báo";
                                                const desc = hasColon ? warning.substring(colonIdx + 1).trim() : warning;
                                                
                                                return (
                                                    <div key={wIdx} className="p-4 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
                                                        <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-error break-words leading-tight">{title}</span>
                                                            <span className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========== PARALLEL LAYOUT SECTION (Treatments & AI Chat) ========== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
                    {/* LEFT COLUMN: Technical phác đồ (lg:col-span-8) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* SPRAY PROGRAMS */}
                        {sprayPrograms.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                    <span className="text-xl">🔬</span>
                                    {sprayPrograms.length === 1 ? "Phác đồ xử lý chi tiết" : `Phác đồ điều trị`}
                                </h3>

                                {sprayPrograms.map((program, pIdx) => (
                                    <div key={pIdx} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                                        <div className="px-6 py-4 border-b border-surface-container-highest bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-on-surface">
                                                    {(() => {
                                                        if (sprayPrograms.length <= 1) {
                                                            return (program.diseaseNames && program.diseaseNames.length > 1) 
                                                                ? "Phác đồ kết hợp" 
                                                                : "Phác đồ điều trị";
                                                        }
                                                        return `Đợt phun ${program.programOrder}${program.intervalDays ? ` (cách đợt trước ${program.intervalDays} ngày)` : ""}`;
                                                    })()}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {program.status === 'BLOCKED_BY_WEATHER' && (
                                                    <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase bg-error-container text-on-error-container">
                                                        ⛈ Chờ thời tiết
                                                    </span>
                                                )}
                                                {program.mixAllowed === false && (
                                                    <span className="bg-orange-100 text-orange-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase">⚠️ Không pha chung</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-5">
                                            {program.reasons && program.reasons.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {program.reasons.map((code, rIdx) => (
                                                        <span key={rIdx} className="text-xs px-3 py-1.5 bg-surface-container rounded-lg text-on-surface-variant font-medium border border-surface-container-highest">
                                                            {REASON_LABELS[code] || code}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {program.treatments && program.treatments.map((t, tIdx) => (
                                                    <div key={tIdx} className="bg-white dark:bg-slate-800 rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
                                                        <div className="px-5 py-3 bg-surface-container-low border-b border-surface-container-highest flex items-center justify-between">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="font-bold text-on-surface text-lg">{t.drugName || t.treatmentName}</span>
                                                                {t.diseaseName && <span className="text-xs text-slate-400 font-medium">({t.diseaseName})</span>}
                                                            </div>
                                                            {t.dosage && <span className="text-[#2E7D32] font-black text-lg">{t.dosage}</span>}
                                                        </div>

                                                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {t.ingredientName && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">🧪 Hoạt chất</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.ingredientName}</p>
                                                                </div>
                                                            )}
                                                            {(t.dosagePerHaValue || t.dosagePerHaUnit) && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">📏 Liều lượng/ha</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.dosagePerHaValue} {t.dosagePerHaUnit}</p>
                                                                </div>
                                                            )}
                                                            {t.waterVolumePerHa && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">💧 Lượng nước/ha</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.waterVolumePerHa}</p>
                                                                </div>
                                                            )}
                                                            {t.applicationMethod && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">🎯 Cách dùng</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.applicationMethod}</p>
                                                                </div>
                                                            )}
                                                            {t.applicationTime && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">🌅 Thời điểm</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.applicationTime}</p>
                                                                </div>
                                                            )}
                                                            {t.frequency && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">⏱ Tần suất</p>
                                                                    <p className="text-sm font-bold text-on-surface">{t.frequency}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {t.safetyNotes && (
                                                            <div className="px-5 pb-4">
                                                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                                    <p className="text-xs font-bold text-amber-800">⚠️ Lưu ý an toàn</p>
                                                                    <p className="text-sm text-amber-700 mt-1">{t.safetyNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* INTERACTION WARNINGS */}
                        {interactionWarnings.length > 0 && (
                            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                                <div className="px-6 py-4 border-b border-surface-container-highest bg-red-50 dark:bg-red-900/20">
                                    <h3 className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">warning</span>
                                        Xung đột hoạt chất ({interactionWarnings.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-surface-container-highest">
                                    {interactionWarnings.map((iw, idx) => (
                                        <div key={idx} className="p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="bg-primary-container text-on-primary-container text-xs px-2.5 py-1 rounded-full font-bold">{iw.ingredientAName}</span>
                                                    <span className="text-on-surface-variant font-black">✕</span>
                                                    <span className="bg-primary-container text-on-primary-container text-xs px-2.5 py-1 rounded-full font-bold">{iw.ingredientBName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {iw.severity && (
                                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase border ${getSeverityColor(iw.severity)}`}>
                                                            {iw.severity}
                                                        </span>
                                                    )}
                                                    {iw.blocksMixing && (
                                                        <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-black uppercase">🚫 Cấm pha chung</span>
                                                    )}
                                                </div>
                                            </div>
                                            {iw.warningMessage && <p className="text-sm text-on-surface">{iw.warningMessage}</p>}
                                            {iw.actionRule && <p className="text-xs text-on-surface-variant mt-1">Hướng xử lý: <strong>{iw.actionRule}</strong></p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WEATHER ALERTS */}
                        {weatherAlerts.filter(a => a.violated).length > 0 && (
                            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                                <div className="px-6 py-4 border-b border-surface-container-highest bg-amber-50 dark:bg-amber-900/20">
                                    <h3 className="text-sm font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xl">cloud_alert</span>
                                        Cảnh báo thời tiết lúc chẩn đoán
                                    </h3>
                                </div>
                                <div className="divide-y divide-surface-container-highest">
                                    {weatherAlerts.filter(a => a.violated).map((wa, idx) => (
                                        <div key={idx} className="p-5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-on-surface">{wa.treatmentName}</span>
                                                {wa.required && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-black uppercase">Bắt buộc</span>}
                                            </div>
                                            <p className="text-sm text-on-surface-variant">
                                                {wa.weatherFactor}: thực tế <strong>{wa.actualValue}{wa.unit || ''}</strong>
                                            </p>
                                            {wa.recommendationNote && <p className="text-xs text-amber-700 mt-1 font-medium">💡 {wa.recommendationNote}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CULTIVATION MEASURES */}
                        {getCultivationMeasures(result).length > 0 && (
                            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-highest shadow-sm mt-6">
                                <h4 className="font-black text-on-surface flex items-center gap-2 text-xs uppercase tracking-widest border-l-4 border-[#2E7D32] pl-3 mb-4">
                                    BIỆN PHÁP CANH TÁC BỔ SUNG
                                </h4>
                                <ul className="space-y-3">
                                    {getCultivationMeasures(result).map((m, i) => (
                                        <li key={`measure-${i}`} className="flex gap-3 items-start text-sm leading-relaxed text-on-surface">
                                            <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">check_circle</span>
                                            <span>{m}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: AI Chat Sidebar (lg:col-span-4) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
                        {result.userGuidance && (
                            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-highest shadow-md overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-on-surface text-[11px] uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
                                        TƯ VẤN CHUYÊN GIA AI
                                    </h4>
                                    <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">Gemini Flash</span>
                                </div>

                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <div className="text-[13px] leading-relaxed text-on-surface-variant whitespace-pre-line bg-primary/5 p-4 rounded-xl border border-primary/10">
                                        {result.userGuidance}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-surface-container-highest flex items-center justify-between">
                                    <p className="text-[10px] text-on-surface-variant italic">* Bản ghi lưu lịch sử gốc.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DiagnosisHistoryDetailPage;
