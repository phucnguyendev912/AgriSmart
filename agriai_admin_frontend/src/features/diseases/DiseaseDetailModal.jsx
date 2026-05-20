const DiseaseDetailModal = ({ isOpen, onClose, disease }) => {
  if (!isOpen || !disease) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-surface rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Chi tiết bệnh cây trồng</h2>
            <p className="text-stone-500 mt-1 text-sm font-medium">
              ID: #{disease.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-dim hover:bg-surface-dim/80 flex items-center justify-center text-stone-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mã bệnh</span>
              <p className="font-semibold text-on-surface">{disease.diseaseCode}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Loại cây trồng</span>
              <p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {disease.cropTypeName}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tên bệnh</span>
              <p className="font-medium text-on-surface">{disease.diseaseName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tên tiếng Anh</span>
              <p className="font-medium text-stone-600">{disease.diseaseNameEn || 'Không có'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mô tả</span>
            <div className="bg-surface-dim/30 p-4 rounded-xl border border-outline-variant/10">
              <p className="text-stone-700 whitespace-pre-wrap">{disease.description || 'Không có mô tả'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Triệu chứng</span>
            <div className="bg-surface-dim/30 p-4 rounded-xl border border-outline-variant/10">
              <p className="text-stone-700 whitespace-pre-wrap">{disease.symptoms || 'Không có thông tin triệu chứng'}</p>
            </div>
          </div>
          
          <div className="space-y-1 border-t border-outline-variant/10 pt-4">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Ngày tạo</span>
              <p className="font-medium text-stone-600">
                  {new Date(disease.createdAt).toLocaleString('vi-VN')}
              </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-stone-600 bg-surface hover:bg-surface-dim border border-outline-variant/20 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetailModal;
