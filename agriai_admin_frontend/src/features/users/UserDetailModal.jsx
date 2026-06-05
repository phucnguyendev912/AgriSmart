const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN');
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-medium text-on-surface">{value || '—'}</span>
  </div>
);

const UserDetailModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-on-surface">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold text-lg border-2 border-white shadow">
              {getInitials(user.fullName)}
            </div>
            <div>
              <p className="text-lg font-black text-on-surface">{user.fullName}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
              <span
                className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.roleName === 'ADMIN'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed'
                }`}
              >
                {user.roleName === 'ADMIN' ? 'Admin' : 'Người dùng'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Số điện thoại" value={user.phoneNumber} />
            <InfoRow
              label="Trạng thái"
              value={
                user.isActive ? (
                  <span className="text-primary font-bold">Hoạt động</span>
                ) : (
                  <span className="text-error font-bold">Bị khóa</span>
                )
              }
            />
            <InfoRow label="ID" value={`#${user.id}`} />
            <InfoRow label="Ngày tạo" value={formatDate(user.createdAt)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
