const TreatmentPlanTable = ({ 
  treatmentPlans, 
  page, 
  totalPages, 
  totalElements, 
  setPage, 
  onViewDetail,
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatDosage = (plan) => {
    if (plan.dosageValueMin === null && plan.dosageValueMax === null) return '-';
    let range;
    if (plan.dosageValueMin !== null && plan.dosageValueMax !== null) {
      range = `${plan.dosageValueMin} - ${plan.dosageValueMax}`;
    } else {
      range = plan.dosageValueMin !== null ? plan.dosageValueMin : plan.dosageValueMax;
    }
    const unit = plan.dosageUnit || '';
    const area = plan.dosageAreaValue && plan.dosageAreaUnit ? ` / ${plan.dosageAreaValue} ${plan.dosageAreaUnit}` : '';
    return `${range} ${unit}${area}`;
  };

  return (
    <>
      <div className="bento-card rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-dim/30 border-b border-outline-variant/20">
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">ID</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Tên phác đồ</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Bệnh điều trị</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Thuốc sử dụng</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Liều lượng</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Ngày tạo</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {treatmentPlans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-stone-500">
                    Không tìm thấy phác đồ điều trị nào
                  </td>
                </tr>
              ) : (
                treatmentPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-surface-dim/10 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium text-stone-400">#{plan.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-on-surface">{plan.treatmentName}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-stone-700">{plan.diseaseName || '-'}</span>
                        {plan.cropTypeName && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 rounded px-1.5 py-0.5 mt-1 self-start">
                            {plan.cropTypeName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-600 text-sm font-medium">{plan.drugName || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-sm">{formatDosage(plan)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-xs">{formatDate(plan.createdAt)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewDetail(plan)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-emerald-50 flex items-center justify-center text-stone-500 hover:text-emerald-700 transition-colors"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onEdit(plan)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-primary/20 flex items-center justify-center text-stone-500 hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(plan)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-error/20 flex items-center justify-center text-stone-500 hover:text-error transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-outline-variant/10">
          {treatmentPlans.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              Không tìm thấy phác đồ điều trị nào
            </div>
          ) : (
            treatmentPlans.map((plan) => (
              <div key={plan.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-on-surface">
                      {plan.treatmentName}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Bệnh: <span className="font-semibold text-stone-700">{plan.diseaseName || '-'}</span> 
                      {plan.cropTypeName && ` (${plan.cropTypeName})`}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-stone-400">#{plan.id}</span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-500">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Thuốc sử dụng</p>
                    <p className="font-medium text-stone-700 mt-0.5">{plan.drugName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Liều lượng</p>
                    <p className="font-medium text-stone-700 mt-0.5">{formatDosage(plan)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">{formatDate(plan.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onViewDetail(plan)} 
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button 
                      onClick={() => onEdit(plan)} 
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => onDelete(plan)} 
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                    >
                      Xóa
                    </button>
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
              Hiển thị trang <span className="text-on-surface font-bold">{page + 1}</span> / {totalPages} (Tổng {totalElements})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-outline-variant/30 text-stone-600 hover:bg-surface-dim hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-outline-variant/30 text-stone-600 hover:bg-surface-dim hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TreatmentPlanTable;
