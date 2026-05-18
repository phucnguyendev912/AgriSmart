const UserFilters = ({ filters, onChange }) => {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bento-card p-5 rounded-xl shadow-sm border border-outline-variant/10">
      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">
        Bộ lọc nhanh
      </p>
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        <select
          name="role"
          value={filters.role}
          onChange={handleChange}
          className="flex-1 bg-surface-container-low border-none rounded-lg text-xs font-medium py-2 px-3 focus:ring-1 focus:ring-primary min-w-[120px]"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="FARMER">Người dùng</option>
        </select>

        <select
          name="isActive"
          value={filters.isActive}
          onChange={handleChange}
          className="flex-1 bg-surface-container-low border-none rounded-lg text-xs font-medium py-2 px-3 focus:ring-1 focus:ring-primary min-w-[120px]"
        >
          <option value="">Mọi trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
