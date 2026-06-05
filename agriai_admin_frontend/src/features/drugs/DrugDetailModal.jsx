const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 p-3 bg-surface-dim/20 rounded-xl border border-outline-variant/5">
    {icon && (
      <span className="material-symbols-outlined text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center text-[18px] shrink-0 mt-0.5">
        {icon}
      </span>
    )}
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-stone-800 text-sm mt-0.5 break-words">{value !== null && value !== undefined && value !== '' ? value : '-'}</p>
    </div>
  </div>
);

const DrugDetailModal = ({ isOpen, onClose, drug }) => {
  if (!isOpen || !drug) return null;

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

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/20 flex flex-col transform scale-100 transition-transform duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center bg-stone-50 dark:bg-stone-900 sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
              Chi tiết thuốc #{drug.id}
            </span>
            <h2 className="text-xl font-black text-on-surface mt-1">{drug.drugName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Section 1: General Info */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem label="Tên thuốc" value={drug.drugName} icon="medication" />
              <DetailItem label="Dạng thuốc" value={drug.formulation} icon="science" />
              <DetailItem label="Nhà sản xuất" value={drug.manufacturer} icon="factory" />
              <DetailItem 
                label="Trạng thái" 
                value={drug.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'} 
                icon={drug.isActive ? 'check_circle' : 'cancel'} 
              />
              <DetailItem label="Ngày tạo" value={formatDate(drug.createdAt)} icon="calendar_today" />
              <DetailItem label="Ngày cập nhật" value={formatDate(drug.updatedAt)} icon="edit_calendar" />
            </div>
          </div>

          {/* Section 2: Ingredients */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Danh sách hoạt chất thành phần (Active Ingredients)
            </h3>
            
            <div className="border border-outline-variant/10 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dim/30 border-b border-outline-variant/15">
                    <th className="p-3 text-xs font-bold text-stone-500 uppercase tracking-wider">Tên hoạt chất</th>
                    <th className="p-3 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Nồng độ / Hàm lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {!drug.ingredients || drug.ingredients.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="p-4 text-center text-sm text-stone-500">
                        Không có hoạt chất nào được liên kết
                      </td>
                    </tr>
                  ) : (
                    drug.ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-surface-dim/5">
                        <td className="p-3">
                          <span className="font-semibold text-stone-800">{ing.ingredientName}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                            {ing.concentrationValue !== null && ing.concentrationValue !== undefined 
                              ? `${ing.concentrationValue} ${ing.concentrationUnit || ''}` 
                              : (ing.rawConcentration || '-')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/15 flex justify-end bg-stone-50 dark:bg-stone-900 sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugDetailModal;
