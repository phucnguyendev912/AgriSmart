const STAT_CARDS = [
  { key: 'totalUsers',       label: 'Tổng người dùng',           icon: 'person',         color: 'text-primary',   bg: 'bg-primary-fixed' },
  { key: 'activeUsers',      label: 'Người dùng hoạt động',      icon: 'group',          color: 'text-secondary', bg: 'bg-secondary-fixed' },
  { key: 'diagnosesInPeriod',label: 'Lượt chẩn đoán (kỳ này)',  icon: 'camera',         color: 'text-tertiary',  bg: 'bg-tertiary-fixed' },
  { key: 'accuracyPercent',  label: 'Độ chính xác AI',           icon: 'verified',       color: 'text-primary',   bg: 'bg-primary-fixed',  suffix: '%' },
];

export default function DashboardStatCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {STAT_CARDS.map(({ key, label, icon, color, bg, suffix }) => (
        <div key={key} className="bento-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`material-symbols-outlined ${color} p-3 ${bg} rounded-xl`}
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {icon}
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">{label}</p>
          <h3 className="text-2xl font-black text-on-surface">
            {summary[key]?.toLocaleString('vi-VN')}{suffix || ''}
          </h3>
        </div>
      ))}
    </div>
  );
}
