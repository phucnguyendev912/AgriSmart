import { Link } from 'react-router-dom';

const AdminHeader = () => {
  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-none border-b border-slate-200/50">
      <div className="flex items-center gap-4">
        <span className="text-xl font-black text-green-800 dark:text-green-400 tracking-tighter">AgriAI</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-64 outline-none" placeholder="Tìm kiếm hệ thống..." type="text" />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-500" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
