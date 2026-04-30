import React from 'react';

/**
 * Hiển thị các biện pháp canh tác bổ sung.
 * Props: measures - string[]
 */
const DiagnoseCultivationMeasures = ({ measures }) => {
    if (!measures || measures.length === 0) return null;

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-highest shadow-sm mt-6">
            <h4 className="font-black text-on-surface flex items-center gap-2 text-xs uppercase tracking-widest border-l-4 border-[#2E7D32] pl-3 mb-4">
                BIỆN PHÁP CANH TÁC BỔ SUNG
            </h4>
            <ul className="space-y-3">
                {measures.map((m, i) => (
                    <li key={`measure-${i}`} className="flex gap-3 items-start text-sm leading-relaxed text-on-surface">
                        <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">check_circle</span>
                        <span>{m}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DiagnoseCultivationMeasures;
