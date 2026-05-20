import { useState } from 'react';

const DiseaseTable = ({ diseases, page, totalPages, totalElements, setPage, onEdit, onView, onDelete }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    onDelete(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
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
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Mã bệnh</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Tên bệnh</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Tên tiếng Anh</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Loại cây</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {diseases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">
                    Không tìm thấy bệnh cây trồng nào
                  </td>
                </tr>
              ) : (
                diseases.map((disease) => (
                  <tr key={disease.id} className="hover:bg-surface-dim/10 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium text-stone-400">#{disease.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-on-surface">{disease.diseaseCode}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-on-surface">{disease.diseaseName}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-500 text-sm">{disease.diseaseNameEn || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                        {disease.cropTypeName || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(disease)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-tertiary-fixed flex items-center justify-center text-stone-500 hover:text-on-tertiary-fixed transition-colors"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onEdit(disease)}
                          className="w-8 h-8 rounded-full bg-surface hover:bg-primary/20 flex items-center justify-center text-stone-500 hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(disease.id)}
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
          {diseases.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              Không tìm thấy bệnh cây trồng nào
            </div>
          ) : (
            diseases.map((disease) => (
              <div key={disease.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-on-surface flex items-center gap-2">
                      {disease.diseaseName}
                    </h3>
                    <p className="text-sm text-stone-500">{disease.diseaseCode}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {disease.cropTypeName}
                  </span>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-outline-variant/10">
                  <button onClick={() => onView(disease)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface hover:bg-tertiary-fixed text-stone-600 transition-colors">
                    Chi tiết
                  </button>
                  <button onClick={() => onEdit(disease)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Sửa
                  </button>
                  <button onClick={() => confirmDelete(disease.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors">
                    Xóa
                  </button>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-error text-[24px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Xóa bệnh cây trồng?</h3>
            <p className="text-stone-600 mb-6">
              Bạn có chắc chắn muốn xóa bệnh cây trồng này? Hành động này sẽ ẩn bệnh cây khỏi hệ thống.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-5 py-2.5 rounded-xl font-semibold text-stone-600 hover:bg-surface-dim transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold bg-error text-white hover:bg-error/90 shadow-md transition-all active:scale-95"
              >
                Xóa Bệnh Cây
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiseaseTable;
