import React from 'react';

/**
 * Helper to determine CSS classes for severity badges.
 * @param {string} severity - Severity level (NANG, TRUNG_BINH, NHE).
 * @returns {string} Tailwind CSS class string.
 */
const getSeverityClasses = (severity) => {
    if (severity === 'NANG') return "bg-error-container text-on-error-container";
    if (severity === 'TRUNG_BINH') return "bg-secondary-container text-on-secondary-container";
    return "bg-primary-container text-on-primary-container";
};

/**
 * Helper to get Vietnamese label for severity levels.
 * @param {string} severity - Severity code.
 * @returns {string} Vietnamese display label.
 */
const getSeverityLabel = (severity) => {
    if (severity === 'NANG') return 'Nặng';
    if (severity === 'TRUNG_BINH') return 'Trung bình';
    if (severity === 'NHE') return 'Nhẹ';
    return severity || 'N/A';
};

/**
 * Generates warning message when current weather favors detected diseases.
 * @param {Array} diseases - Detected disease objects.
 * @param {Array} diseaseWeatherRisks - Disease-weather risk associations.
 * @returns {string} Warning message or empty string.
 */
const getWeatherRiskMessage = (diseases, diseaseWeatherRisks) => {
    const diseaseIds = new Set(
        diseases
            .map((disease) => disease.diseaseId)
            .filter((id) => id !== null && id !== undefined)
            .map(String)
    );

    const diseaseNames = diseaseWeatherRisks
        .filter((risk) => risk.diseaseId !== null && risk.diseaseId !== undefined)
        .filter((risk) => diseaseIds.has(String(risk.diseaseId)))
        .map((risk) => risk.diseaseName)
        .filter(Boolean)
        .filter((name, index, names) => names.indexOf(name) === index);

    if (diseaseNames.length === 0) return '';

    return `Thời tiết thuận lợi cho bệnh ${diseaseNames.join(', ')} phát triển. Hãy thăm đồng thường xuyên.`;
};

/**
 * DiagnoseResultPanel Component
 * Displays the list of detected crop diseases, confidence percentages,
 * severity level indicators, and any associated weather or safety warnings.
 * 
 * @param {Object} props - Component properties.
 * @param {Object} props.result - Diagnosis API response object.
 */
const DiagnoseResultPanel = ({ result }) => {
    if (!result) return null;

    const diseases = result.diseases || [];
    const diseaseWeatherRisks = result.diseaseWeatherRisks || [];
    const warnings = result.warnings || [];
    const weatherRiskMessage = getWeatherRiskMessage(diseases, diseaseWeatherRisks);

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
                        <p className="text-lg font-bold text-slate-600">Không xác định được bệnh</p>
                        <p className="text-sm text-on-surface-variant mt-1">Vui lòng thử lại với ảnh rõ hơn.</p>
                    </div>
                )
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {diseases.map((disease, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-black text-primary text-base md:text-lg leading-tight">
                                            {disease.diseaseName}
                                            {disease.diseaseNameEn && <span className="text-on-surface-variant font-semibold text-xs ml-1.5">({disease.diseaseNameEn})</span>}
                                        </h4>
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

                    {weatherRiskMessage && (
                        <div className="mt-4 p-4 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
                            <span className="material-symbols-outlined text-error mt-0.5">warning</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-error break-words leading-tight">
                                    Nguy cơ cao: Bệnh có thể lây lan nhanh chóng
                                </span>
                                <span className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                    {weatherRiskMessage}
                                </span>
                            </div>
                        </div>
                    )}

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
