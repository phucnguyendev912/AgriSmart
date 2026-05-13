import React from 'react';

/**
 * Hiển thị danh sách cảnh báo thời tiết vi phạm điều kiện phun.
 */
const DiagnoseWeatherAlertsPanel = ({ weatherAlerts }) => {
    const violated = (weatherAlerts || []).filter(a => a.violated);
    if (violated.length === 0) return null;

    return (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
            <div className="px-6 py-4 border-b border-surface-container-highest bg-amber-50 dark:bg-amber-900/20">
                <h3 className="text-sm font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">cloud_alert</span>
                    Cảnh báo thời tiết ({violated.length})
                </h3>
            </div>
            <div className="divide-y divide-surface-container-highest">
                {violated.map((wa, idx) => (
                    <div key={idx} className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-on-surface">{wa.treatmentName}</span>
                            {wa.required && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-black uppercase">Bắt buộc</span>}
                        </div>
                        <p className="text-sm text-on-surface-variant">
                            {wa.weatherFactor}: hiện tại <strong>{wa.actualValue}{wa.unit || ''}</strong>
                        </p>
                        {wa.recommendationNote && <p className="text-xs text-amber-700 mt-1 font-medium">💡 {wa.recommendationNote}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiagnoseWeatherAlertsPanel;
