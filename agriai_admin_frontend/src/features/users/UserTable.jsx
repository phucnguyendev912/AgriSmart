import { useState } from 'react';

// ---- helpers ----

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const RoleBadge = ({ role }) => {
  const isAdmin = role === 'ADMIN';
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isAdmin
          ? 'bg-primary-fixed text-on-primary-fixed-variant'
          : 'bg-tertiary-fixed text-on-tertiary-fixed'
      }`}
    >
      {isAdmin ? 'Admin' : 'Người dùng'}
    </span>
  );
};

const StatusBadge = ({ isActive }) =>
  isActive ? (
    <div className="flex items-center gap-1.5 text-primary">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="text-xs font-bold">Hoạt động</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-error">
      <span className="w-1.5 h-1.5 rounded-full bg-error" />
      <span className="text-xs font-bold">Bị khóa</span>
    </div>
  );

const Avatar = ({ user }) => {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-xs border-2 border-white shadow-sm">
      {getInitials(user.fullName)}
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

// ---- Delete Confirm Modal ----

const DeleteModal = ({ user, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h3 className="text-base font-bold text-on-surface mb-2">Xác nhận xóa</h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Bạn có chắc muốn xóa người dùng{' '}
        <span className="font-semibold text-on-surface">{user.fullName}</span>? Hành động này
        không thể hoàn tác.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-error text-white hover:bg-red-700 transition-colors"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
);

// ---- Pagination ----

const Pagination = ({ page, totalPages, totalElements, pageSize, onPageChange }) => {
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  const pages = [];
  const maxVisible = 3;
  let from = Math.max(0, page - 1);
  let to = Math.min(totalPages - 1, from + maxVisible - 1);
  if (to - from < maxVisible - 1) from = Math.max(0, to - maxVisible + 1);
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="px-6 py-4 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
      <p className="text-xs text-stone-500">
        Hiển thị {start} - {end} của {totalElements} người dùng
      </p>
      <div className="flex gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-400 border border-stone-200 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-all ${
              p === page
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-primary hover:text-primary'
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="w-8 h-8 flex items-center justify-center rounded bg-white text-stone-400 border border-stone-200 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

// ---- Main UserTable ----

const UserTable = ({ users, page, totalPages, totalElements, onPageChange, onEdit, onView, onDelete, loading }) => {
  const [pendingDelete, setPendingDelete] = useState(null);
  const PAGE_SIZE = 10;

  const handleDelete = (user) => setPendingDelete(user);
  const confirmDelete = async () => {
    await onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  if (loading) {
    return (
      <div className="bento-card rounded-xl shadow-sm border border-outline-variant/10 p-12 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <>
      {pendingDelete && (
        <DeleteModal
          user={pendingDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className="bento-card rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                {['Họ tên & Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Tác vụ'].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-widest ${
                        h === 'Tác vụ' ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-stone-400">
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={u} />
                        <div>
                          <p className="text-sm font-bold text-on-surface">{u.fullName}</p>
                          <p className="text-xs text-stone-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.roleName} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={u.isActive} />
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(u)}
                          className="p-2 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => onView(u)}
                          className="p-2 text-stone-400 hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 text-stone-400 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-stone-100">
          {users.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone-400">Không có người dùng nào.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 bg-white hover:bg-stone-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={u} />
                    <div>
                      <p className="text-sm font-bold text-on-surface">{u.fullName}</p>
                      <p className="text-[10px] text-stone-500">{u.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={u.roleName} />
                </div>
                <div className="grid grid-cols-2 gap-y-2 mb-4">
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Điện thoại</p>
                    <p className="text-xs font-medium text-on-surface">{u.phoneNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Trạng thái</p>
                    <StatusBadge isActive={u.isActive} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Ngày tạo</p>
                    <p className="text-xs text-stone-500">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Sửa
                  </button>
                  <button
                    onClick={() => onView(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-stone-200 rounded-lg hover:bg-stone-50"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span> Xem
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-red-100 text-error rounded-lg hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
};

export default UserTable;
