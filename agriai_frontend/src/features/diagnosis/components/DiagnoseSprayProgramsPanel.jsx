import React from 'react';
import { buildTreatmentPrograms } from '../utils/diagnosisDisplay';

const REASON_LABELS = {
    MIX_COMPATIBLE: 'Các hoạt chất tương thích, có thể phun chung',
    CONFLICT_SEPARATED: 'Tách lịch phun do xung đột hoạt chất',
    WEATHER_BLOCKED: 'Điều kiện thời tiết chưa phù hợp, cần hoãn phun',
    DEFAULT_PRIORITY: 'Áp dụng phác đồ ưu tiên cho từng bệnh',
    RANKED_TREATMENTS: 'Xếp hạng phác đồ theo dữ liệu thuốc và hướng dẫn sử dụng'
};

const DiagnoseSprayProgramsPanel = ({ sprayPrograms, treatments }) => {
    const displayPrograms = buildTreatmentPrograms(sprayPrograms, treatments);
    if (displayPrograms.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">medication</span>
                {displayPrograms.length === 1 ? 'Phác đồ xử lý chi tiết' : 'Phác đồ điều trị'}
            </h3>

            {displayPrograms.map((program, pIdx) => (
                <div key={program.programCode || pIdx} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                    <div className="px-6 py-4 border-b border-surface-container-highest bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-on-surface">
                                {displayPrograms.length <= 1
                                    ? (program.diseaseNames && program.diseaseNames.length > 1 ? 'Phác đồ kết hợp' : 'Phác đồ điều trị')
                                    : `Đợt phun ${program.programOrder}${program.intervalDays ? ` (cách đợt trước ${program.intervalDays} ngày)` : ''}`}
                            </h4>
                            {program.diseaseNames && program.diseaseNames.length > 0 && (
                                <p className="text-xs text-on-surface-variant mt-1">{program.diseaseNames.join(', ')}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {program.status === 'BLOCKED_BY_WEATHER' && (
                                <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase bg-error-container text-on-error-container">
                                    Chờ thời tiết
                                </span>
                            )}
                            {program.mixAllowed === false && (
                                <span className="bg-orange-100 text-orange-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase">Không pha chung</span>
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
                            {(program.treatments || []).map((t, tIdx) => (
                                <div key={t.treatmentPlanId || tIdx} className="bg-white dark:bg-slate-800 rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
                                    <div className="px-5 py-3 bg-surface-container-low border-b border-surface-container-highest flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                                            <span className="font-bold text-on-surface text-lg break-words">{t.drugName || t.treatmentName || 'Phác đồ điều trị'}</span>
                                            {t.diseaseName && <span className="text-xs text-slate-400 font-medium">({t.diseaseName})</span>}
                                            {t.recommended && <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-primary-container text-on-primary-container">Khuyến nghị</span>}
                                            {t.rank && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-surface-container text-on-surface-variant">Rank #{t.rank}</span>}
                                        </div>
                                        {(t.displayDosage || t.dosage) && (
                                            <span className="text-[#2E7D32] font-black text-lg whitespace-nowrap">{t.displayDosage || t.dosage}</span>
                                        )}
                                    </div>

                                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {t.ingredientName && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Hoạt chất</p>
                                                <p className="text-sm font-bold text-on-surface">{t.ingredientName}</p>
                                            </div>
                                        )}
                                        {t.mixingInstruction && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Hướng dẫn pha</p>
                                                <p className="text-sm font-bold text-on-surface">{t.mixingInstruction}</p>
                                            </div>
                                        )}
                                        {(t.displayWaterVolume || t.waterVolumePerHa) && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Lượng nước/ha</p>
                                                <p className="text-sm font-bold text-on-surface">{t.displayWaterVolume || t.waterVolumePerHa}</p>
                                            </div>
                                        )}
                                        {t.applicationMethod && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Cách dùng</p>
                                                <p className="text-sm font-bold text-on-surface">{t.applicationMethod}</p>
                                            </div>
                                        )}
                                        {t.applicationTime && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Thời điểm</p>
                                                <p className="text-sm font-bold text-on-surface">{t.applicationTime}</p>
                                            </div>
                                        )}
                                        {(t.sprayInterval || t.frequency) && (
                                            <div>
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Tần suất</p>
                                                <p className="text-sm font-bold text-on-surface">{t.sprayInterval || t.frequency}</p>
                                            </div>
                                        )}
                                       
                                    </div>

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
