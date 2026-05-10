import React from 'react';

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



/**
 * Hiển thị danh sách bệnh phát hiện được cùng các cảnh báo thời tiết và warnings nhanh.
 */
const DiagnoseResultPanel = ({ result }) => {
    if (!result) return null;

    const diseases = result.diseases || [];
    const diseaseWeatherRisks = result.diseaseWeatherRisks || [];
    const weatherAlerts = result.weatherAlerts || [];
    const warnings = result.warnings || [];

    return (
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
                        <p className="text-sm text-on-surface-variant mt-1">Không có dấu hiệu tổn thương trên ảnh.</p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-5xl text-slate-400 mb-2 block">search_off</span>
                        <p className="text-lg font-bold text-slate-600">Không phát hiện bệnh</p>
                        <p className="text-sm text-on-surface-variant mt-1">Vui lòng thử lại với một bức ảnh rõ nét hơn.</p>
                    </div>
                )
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {diseases.map((disease, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-black text-on-surface text-sm">{disease.diseaseName}</h4>
                                        <span className={`${getSeverityClasses(disease.severity)} text-[8px] px-1.5 py-0.5 rounded font-black uppercase`}>
                                            Mức độ: {getSeverityLabel(disease.severity)}
                                        </span>
                                    </div>
                                    <span className="text-xl font-black text-primary">
                                        {disease.confidence != null ? `${Math.round(disease.confidence * 100)}%` : 'N/A'}
                                    </span>
                                </div>
                                {disease.confidence != null && (
                                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mb-1">
                                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${disease.confidence * 100}%` }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Disease weather risks from Phase 3 contract */}
                    {diseaseWeatherRisks.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {diseaseWeatherRisks.map((risk, rIdx) => (
                                <div key={rIdx} className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <span className="material-symbols-outlined text-amber-600 mt-0.5">cloud_alert</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-amber-700 break-words leading-tight">{risk.diseaseName || 'Nguy cơ thời tiết'}</span>
                                        <span className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                            {risk.recommendationNotes || 'Điều kiện thời tiết hiện tại thuận lợi cho bệnh phát triển.'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Legacy weather alerts */}
                    {diseaseWeatherRisks.length === 0 && weatherAlerts.filter(a => a.violated).length > 0 && (
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

                    {/* General Warnings */}
                    {warnings.length > 0 && (
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
    );
};

export default DiagnoseResultPanel;
