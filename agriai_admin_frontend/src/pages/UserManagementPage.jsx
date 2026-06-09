import { useState } from 'react';
import { useUsers } from '../features/users/useUsers';
import UserStats from '../features/users/UserStats';
import UserFilters from '../features/users/UserFilters';
import UserTable from '../features/users/UserTable';
import UserForm from '../features/users/UserForm';
import UserDetailModal from '../features/users/UserDetailModal';

const UserManagementPage = () => {
  const {
    users,
    totalElements,
    totalPages,
    page,
    setPage,
    filters,
    applyFilters,
    loading,
    error,
    refresh,
    deleteUser,
    stats,
  } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);



  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 md:mb-10">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary font-medium">Quản lý người dùng</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base">
            Quản lý quyền truy cập và thông tin chi tiết của người dùng trong hệ sinh thái.
          </p>
        </div>
        <button
          id="btn-add-user"
          onClick={() => setShowForm(true)}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">person_add</span>
          Thêm người dùng mới
        </button>
      </div>

      {/* Stats + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-12 lg:col-span-8">
          <UserStats total={stats.totalUsers} active={stats.activeUsers} />
        </div>
        <div className="md:col-span-12 lg:col-span-4">
          <UserFilters filters={filters} onChange={applyFilters} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container text-sm px-5 py-3 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Table */}
      <UserTable
        users={users}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onEdit={handleEdit}
        onView={(u) => setViewingUser(u)}
        onDelete={deleteUser}
        loading={loading}
      />

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-6 rounded-xl flex items-start gap-4 border border-outline-variant/10 shadow-sm">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <h4 className="text-sm font-bold text-primary mb-1">Quyền quản trị</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Chỉ quản trị viên cấp cao mới có quyền khóa hoặc xóa tài khoản của quản trị viên
              khác. Hãy cẩn trọng khi thay đổi vai trò người dùng.
            </p>
          </div>
        </div>
        <div className="bento-card p-6 rounded-xl flex items-start gap-4 border border-outline-variant/10 shadow-sm">
          <span className="material-symbols-outlined text-secondary">security</span>
          <div>
            <h4 className="text-sm font-bold text-secondary mb-1">Xác thực 2 yếu tố</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Hệ thống khuyến nghị yêu cầu bắt buộc xác thực 2 lớp đối với vai trò Admin để bảo
              đảm an toàn tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <UserForm user={editingUser} onClose={handleCloseForm} onSuccess={handleFormSuccess} />
      )}
      {viewingUser && (
        <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
    </div>
  );
};

export default UserManagementPage;
