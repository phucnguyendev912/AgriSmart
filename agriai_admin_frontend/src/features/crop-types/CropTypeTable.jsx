import React from 'react';

const CropTypeTable = ({ 
  cropTypes, 
  page, 
  totalPages, 
  totalElements, 
  setPage, 
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
    } catch (e) {
      return dateString;
    }
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
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Tên loại cây</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Mô tả</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Ngày tạo</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {cropTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-stone-500">
                    Không tìm thấy loại cây trồng nào
                  </td>
                </tr>
              ) : (
                cropTypes.map((cropType) => (
                  <tr key={cropType.id} className="hover:bg-surface-dim/10 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium text-stone-400">#{cropType.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-on-surface">{cropType.cropName}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-sm">{cropType.description || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-xs">{formatDate(cropType.createdAt)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(cropType)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-primary/20 flex items-center justify-center text-stone-500 hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDelete(cropType)}
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
          {cropTypes.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              Không tìm thấy loại cây trồng nào
            </div>
          ) : (
            cropTypes.map((cropType) => (
              <div key={cropType.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-on-surface">
                      {cropType.cropName}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">{cropType.description || 'Không có mô tả'}</p>
                  </div>
                  <span className="font-mono text-xs text-stone-400">#{cropType.id}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-outline-variant/10">
                  <span className="text-[10px] text-stone-400">{formatDate(cropType.createdAt)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(cropType)} 
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => onDelete(cropType)} 
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
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

export default CropTypeTable;
