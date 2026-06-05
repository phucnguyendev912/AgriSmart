import { useState, useEffect } from 'react';

const IngredientFormModal = ({ isOpen, onClose, onSubmit, ingredient }) => {
  const isEdit = !!ingredient;
  const [formData, setFormData] = useState({ ingredientName: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (ingredient) {
      setFormData({
        ingredientName: ingredient.ingredientName || '',
        description: ingredient.description || '',
      });
    } else {
      setFormData({ ingredientName: '', description: '' });
    }
    setFormError('');
  }, [ingredient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ingredientName.trim()) {
      setFormError('Tên hoạt chất không được để trống');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg border border-outline-variant/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-teal-600 text-[20px]">science</span>
            </div>
            <h2 className="text-lg font-black text-on-surface">
              {isEdit ? 'Cập nhật hoạt chất' : 'Thêm hoạt chất mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-dim flex items-center justify-center text-stone-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Tên hoạt chất <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="ingredientName"
              value={formData.ingredientName}
              onChange={handleChange}
              placeholder="Ví dụ: Chlorpyrifos, Abamectin..."
              className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả về hoạt chất, công dụng, lưu ý..."
              className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-teal-500 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-stone-600 font-semibold hover:bg-surface-dim transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientFormModal;
