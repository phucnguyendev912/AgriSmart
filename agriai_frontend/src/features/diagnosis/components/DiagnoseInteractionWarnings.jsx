import React from 'react';

const getSeverityColor = (sev) => {
    if (sev === 'HIGH') return 'text-red-600 bg-red-50 border-red-200';
    if (sev === 'MEDIUM') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
};

/**
 * Hiển thị danh sách xung đột hoạt chất (Interaction Warnings).
 */
const DiagnoseInteractionWarnings = ({ interactionWarnings }) => {
    if (!interactionWarnings || interactionWarnings.length === 0) return null;

    return (
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
    );
};

export default DiagnoseInteractionWarnings;
