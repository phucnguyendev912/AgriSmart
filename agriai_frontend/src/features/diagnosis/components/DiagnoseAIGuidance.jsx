import React from 'react';

/**
 * Sidebar hiển thị tư vấn chuyên gia AI (Gemini).
 */
const DiagnoseAIGuidance = ({ guidance }) => {
    if (!guidance) return null;

    return (
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
                <div className="text-[14px] md:text-[15px] leading-relaxed text-on-surface-variant whitespace-pre-line bg-primary/5 p-4 rounded-xl border border-primary/10">
                    {guidance}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-container-highest flex items-center justify-between">
                <p className="text-[10px] text-on-surface-variant italic">* Phân tích dựa trên dữ liệu bệnh và thời tiết thực tế. Thông tin chỉ mang tính chất tham khảo.</p>
                <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-lg">share</span>
                </button>
            </div>
        </div>
    );
};

export default DiagnoseAIGuidance;
