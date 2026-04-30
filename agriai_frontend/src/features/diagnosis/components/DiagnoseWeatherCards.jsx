import React from 'react';

/**
 * Hiển thị 3 card thời tiết: Nhiệt độ, Độ ẩm, Lượng mưa.
 */
const DiagnoseWeatherCards = ({ weather }) => {
    if (!weather) return null;

    const cards = [
        { icon: 'thermostat', label: 'Nhiệt độ', value: weather.temperature != null ? `${Math.round(weather.temperature)}°C` : 'N/A' },
        { icon: 'humidity_high', label: 'Độ ẩm', value: weather.humidity != null ? `${Math.round(weather.humidity)}%` : 'N/A' },
        { icon: 'rainy', label: 'Lượng mưa', value: weather.rainfall != null ? `${weather.rainfall}mm` : 'N/A' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({ icon, label, value }) => (
                <div key={label} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-highest flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</p>
                        <p className="text-xl font-bold text-on-surface">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DiagnoseWeatherCards;
