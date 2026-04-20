import React from 'react';

const REASON_LABELS = {
    MIX_COMPATIBLE: "Các hoạt chất tương thích, có thể phun chung",
    CONFLICT_SEPARATED: "Tách lịch phun do xung đột hoạt chất",
    WEATHER_BLOCKED: "Điều kiện thời tiết chưa phù hợp, cần hoãn phun",
    DEFAULT_PRIORITY: "Áp dụng phác đồ ưu tiên cho từng bệnh"
};

/**
 * Hiển thị toàn bộ phác đồ xử lý (Spray Programs).
 */
const DiagnoseSprayProgramsPanel = ({ sprayPrograms }) => {
    if (!sprayPrograms || sprayPrograms.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="text-xl">🔬</span>
                {sprayPrograms.length === 1 ? "Phác đồ xử lý chi tiết" : "Phác đồ điều trị"}
            </h3>

            {sprayPrograms.map((program, pIdx) => (
                <div key={pIdx} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                    {/* Program Header */}
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
                        {/* Reasons */}
                        {program.reasons && program.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {program.reasons.map((code, rIdx) => (
                                    <span key={rIdx} className="text-xs px-3 py-1.5 bg-surface-container rounded-lg text-on-surface-variant font-medium border border-surface-container-highest">
                                        {REASON_LABELS[code] || code}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Treatment Cards */}
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
    );
};

export default DiagnoseSprayProgramsPanel;
