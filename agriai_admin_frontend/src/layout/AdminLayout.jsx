import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="text-on-surface bg-background min-h-screen font-body">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 px-6 pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation Shell */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-around items-center h-16 z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>dashboard</span>
          <span className="text-[10px] font-bold">Tổng quan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>group</span>
          <span className="text-[10px]">Người dùng</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>camera</span>
          <span className="text-[10px]">Chẩn đoán</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>menu</span>
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
