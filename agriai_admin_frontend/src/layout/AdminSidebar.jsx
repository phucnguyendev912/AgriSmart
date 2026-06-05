import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Tổng quan', icon: 'dashboard' },
  { path: '/users', label: 'Quản lý người dùng', icon: 'group' },
  { path: '/diseases', label: 'Quản lý bệnh cây trồng', icon: 'coronavirus' },
  { path: '/crop-types', label: 'Quản lý loại cây trồng', icon: 'potted_plant' },
  { path: '/treatment-plans', label: 'Quản lý phác đồ điều trị', icon: 'medical_services' },
  { path: '/drugs', label: 'Quản lý thuốc', icon: 'medication' },
  { path: '/ingredients', label: 'Quản lý hoạt chất', icon: 'biotech' },
  { path: '/drug-interactions', label: 'Quản lý tương tác hoạt chất', icon: 'vaccines' },
  { path: '/weather-conditions', label: 'Điều kiện thời tiết gây bệnh', icon: 'thunderstorm' },
  { path: '/attachments', label: 'Quản lý tệp đính kèm', icon: 'attachment' },
  { path: '/diagnosis-reviews', label: 'Đánh giá kết quả chẩn đoán', icon: 'rate_review' },
];

const AdminSidebar = () => {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-slate-200 dark:border-slate-800 flex-col pt-20 pb-6 bg-slate-50 dark:bg-slate-950 z-40 overflow-y-auto">
      <div className="px-6 mb-8 shrink-0">
        <p className="text-sm font-bold text-green-800 dark:text-green-400">Quản trị viên</p>
        <p className="text-xs text-slate-500">Hệ thống AgriSmart</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium leading-6 transition-all duration-200 ease-in-out ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-r-4 border-green-800 dark:border-green-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
