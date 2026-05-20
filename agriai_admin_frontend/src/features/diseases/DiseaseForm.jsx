import { useState, useEffect } from 'react';

const DiseaseForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting, cropTypes }) => {
  const [formData, setFormData] = useState({
    cropTypeId: '',
    diseaseName: '',
    diseaseNameEn: '',
    diseaseCode: '',
    description: '',
    symptoms: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          cropTypeId: initialData.cropTypeId || '',
          diseaseName: initialData.diseaseName || '',
          diseaseNameEn: initialData.diseaseNameEn || '',
          diseaseCode: initialData.diseaseCode || '',
          description: initialData.description || '',
          symptoms: initialData.symptoms || ''
        });
      } else {
        setFormData({
          cropTypeId: '',
          diseaseName: '',
          diseaseNameEn: '',
          diseaseCode: '',
          description: '',
          symptoms: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.cropTypeId) newErrors.cropTypeId = 'Vui lòng chọn loại cây trồng';
    if (!formData.diseaseName) newErrors.diseaseName = 'Tên bệnh không được để trống';
    if (!formData.diseaseCode) newErrors.diseaseCode = 'Mã bệnh không được để trống';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, cropTypeId: Number(formData.cropTypeId) });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-surface rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <h2 className="text-2xl font-black text-on-surface">
              {initialData ? 'Sửa bệnh cây trồng' : 'Thêm bệnh cây trồng mới'}
            </h2>
            <p className="text-stone-500 mt-1 text-sm font-medium">
              Vui lòng điền đầy đủ thông tin bên dưới
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-dim hover:bg-surface-dim/80 flex items-center justify-center text-stone-500 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600">
                  Loại cây trồng <span className="text-error">*</span>
                </label>
                <select
                  name="cropTypeId"
                  value={formData.cropTypeId}
                  onChange={handleChange}
                  className={`w-full form-select bg-surface border rounded-xl px-4 py-3 text-on-surface transition-all ${
                    errors.cropTypeId ? 'border-error focus:ring-error/20' : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20'
                  }`}
                >
                  <option value="">-- Chọn loại cây trồng --</option>
                  {cropTypes.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
                {errors.cropTypeId && <p className="text-error text-xs font-medium mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> {errors.cropTypeId}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600">
                  Mã bệnh <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="diseaseCode"
                  value={formData.diseaseCode}
                  onChange={handleChange}
                  className={`w-full form-input bg-surface border rounded-xl px-4 py-3 text-on-surface transition-all ${
                    errors.diseaseCode ? 'border-error focus:ring-error/20' : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="VD: LM-01"
                />
                {errors.diseaseCode && <p className="text-error text-xs font-medium mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> {errors.diseaseCode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600">
                  Tên bệnh <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="diseaseName"
                  value={formData.diseaseName}
                  onChange={handleChange}
                  className={`w-full form-input bg-surface border rounded-xl px-4 py-3 text-on-surface transition-all ${
                    errors.diseaseName ? 'border-error focus:ring-error/20' : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="Nhập tên bệnh"
                />
                {errors.diseaseName && <p className="text-error text-xs font-medium mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> {errors.diseaseName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  name="diseaseNameEn"
                  value={formData.diseaseNameEn}
                  onChange={handleChange}
                  className="w-full form-input bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-primary/20 transition-all"
                  placeholder="Nhập tên tiếng Anh (nếu có)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-600">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full form-textarea bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-primary/20 transition-all resize-none"
                placeholder="Nhập mô tả về bệnh..."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-600">
                Triệu chứng
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="3"
                className="w-full form-textarea bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-primary/20 transition-all resize-none"
                placeholder="Nhập triệu chứng của bệnh..."
              ></textarea>
            </div>

          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-bold text-stone-600 bg-surface hover:bg-surface-dim border border-outline-variant/20 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold text-on-primary-fixed bg-primary-fixed hover:bg-primary-fixed-dim shadow-md transition-all active:scale-[0.98] flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin"></div>
              ) : (
                initialData ? 'Lưu Thay Đổi' : 'Thêm Bệnh'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiseaseForm;
