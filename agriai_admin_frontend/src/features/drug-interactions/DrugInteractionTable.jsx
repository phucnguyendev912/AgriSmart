import { getSeverityStyle } from './DrugInteractionStats';

const DrugInteractionTable = ({ interactions, page, totalPages, totalElements, setPage, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Hoạt chất A</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Hoạt chất B</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Loại tương tác</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Mức độ</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Ngày tạo</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {interactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-stone-500">
                    Không tìm thấy tương tác nào
                  </td>
                </tr>
              ) : (
                interactions.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-dim/10 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium text-stone-400">#{item.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">science</span>
                        {item.ingredientAName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">science</span>
                        {item.ingredientBName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-600 text-sm font-medium">{item.interactionType || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getSeverityStyle(item.severity)}`}>
                        {item.severity || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-xs">{formatDate(item.createdAt)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-primary/20 flex items-center justify-center text-stone-500 hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(item)}
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

        {/* Mobile */}
        <div className="lg:hidden divide-y divide-outline-variant/10">
          {interactions.length === 0 ? (
            <div className="p-8 text-center text-stone-500">Không tìm thấy tương tác nào</div>
          ) : (
            interactions.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold w-fit">
                      {item.ingredientAName}
                    </span>
                    <span className="text-stone-400 text-xs font-bold ml-1">↔</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold w-fit">
                      {item.ingredientBName}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityStyle(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{item.interactionType}</p>
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

export default DrugInteractionTable;
