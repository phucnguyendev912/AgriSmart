import { Link } from 'react-router-dom';

const ACTIONS = [
  { label: 'Quản lý người dùng', icon: 'group', to: '/users',    color: 'bg-primary-fixed text-primary' },
  { label: 'Quản lý bệnh',       icon: 'bug_report', to: '/diseases', color: 'bg-secondary-fixed text-secondary' },
  { label: 'Loại cây trồng',     icon: 'eco',       to: '/crop-types', color: 'bg-tertiary-fixed text-tertiary' },
  { label: 'Phác đồ điều trị',  icon: 'medical_services', to: '/treatment-plans', color: 'bg-primary-fixed text-primary' },
];

export default function DashboardQuickActions() {
  return (
    <div className="bento-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
      <h2 className="text-lg font-bold mb-4">Thao tác nhanh</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} hover:opacity-80 transition-opacity`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {icon}
            </span>
            <span className="text-xs font-semibold text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
