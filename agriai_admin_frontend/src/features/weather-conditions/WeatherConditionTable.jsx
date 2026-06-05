const FACTOR_LABELS = {
  TEMPERATURE: { label: 'Nhiệt độ', icon: 'thermometer', color: 'text-red-600 bg-red-50' },
  HUMIDITY: { label: 'Độ ẩm', icon: 'water_drop', color: 'text-blue-600 bg-blue-50' },
  RAINFALL: { label: 'Lượng mưa', icon: 'rainy', color: 'text-sky-600 bg-sky-50' },
};

const formatCondition = (condition) => {
  const factor = FACTOR_LABELS[condition.weatherFactor]?.label || condition.weatherFactor;
  const unit = condition.unit || '';
  if (condition.operator === 'BETWEEN' && condition.minValue != null && condition.maxValue != null) {
    return `${condition.minValue}${unit} ≤ ${factor} ≤ ${condition.maxValue}${unit}`;
  }
  if (condition.operator === 'GREATER_THAN' && condition.minValue != null) {
    return `${factor} > ${condition.minValue}${unit}`;
  }
  if (condition.operator === 'LESS_THAN' && condition.maxValue != null) {
    return `${factor} < ${condition.maxValue}${unit}`;
  }
  if (condition.operator === 'EQUALS' && condition.minValue != null) {
    return `${factor} = ${condition.minValue}${unit}`;
  }
  return `${factor} ${condition.operator}`;
};

const WeatherConditionTable = ({ conditions, page, totalPages, totalElements, setPage, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      });
    } catch { return dateString; }
  };

  return (
    <>
      <div className="bento-card rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-dim/30 border-b border-outline-variant/20">
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">ID</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Bệnh</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Nhóm</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Yếu tố</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Điều kiện</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Trạng thái</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Ngày tạo</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {conditions.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-stone-500">Không tìm thấy điều kiện nào</td></tr>
              ) : (
                conditions.map((item) => {
                  const factorInfo = FACTOR_LABELS[item.weatherFactor] || { label: item.weatherFactor, color: 'text-stone-600 bg-stone-100', icon: 'cloud' };
                  return (
                    <tr key={item.id} className="hover:bg-surface-dim/10 transition-colors group">
                      <td className="p-4"><span className="font-mono text-xs font-medium text-stone-400">#{item.id}</span></td>
                      <td className="p-4"><span className="font-semibold text-on-surface text-sm">{item.diseaseName}</span></td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-bold">{item.conditionGroup}</span></td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${factorInfo.color}`}>
                          <span className="material-symbols-outlined text-[14px]">{factorInfo.icon}</span>
                          {factorInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-stone-700 text-sm font-mono">{formatCondition(item)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-error/10 text-error'}`}>
                          {item.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="p-4"><span className="text-stone-500 text-xs">{formatDate(item.createdAt)}</span></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-full bg-surface hover:bg-primary/20 flex items-center justify-center text-stone-500 hover:text-primary transition-colors" title="Sửa">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => onDelete(item)} className="w-8 h-8 rounded-full bg-surface hover:bg-error/20 flex items-center justify-center text-stone-500 hover:text-error transition-colors" title="Xóa">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="lg:hidden divide-y divide-outline-variant/10">
          {conditions.length === 0 ? (
            <div className="p-8 text-center text-stone-500">Không tìm thấy điều kiện nào</div>
          ) : (
            conditions.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-on-surface text-sm">{item.diseaseName}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Nhóm: {item.conditionGroup}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-error/10 text-error'}`}>
                    {item.isActive ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>
                <p className="text-xs font-mono text-stone-700 mt-1">{formatCondition(item)}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/10">
                  <span className="text-[10px] text-stone-400">{formatDate(item.createdAt)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(item)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Sửa</button>
                    <button onClick={() => onDelete(item)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors">Xóa</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-dim/10">
            <span className="text-sm text-stone-500 font-medium">
              Trang <span className="text-on-surface font-bold">{page + 1}</span> / {totalPages} (Tổng {totalElements})
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-outline-variant/30 text-stone-600 hover:bg-surface-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-outline-variant/30 text-stone-600 hover:bg-surface-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WeatherConditionTable;
