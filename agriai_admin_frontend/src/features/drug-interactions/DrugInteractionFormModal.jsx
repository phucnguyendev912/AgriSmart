import { useState, useEffect } from 'react';

const INTERACTION_TYPES = ['ANTAGONISTIC', 'SYNERGISTIC', 'INCOMPATIBLE', 'COMPETITIVE', 'OTHER'];
const SEVERITY_OPTIONS = ['DANGER', 'HIGH', 'WARNING', 'MEDIUM', 'LOW', 'INFO'];
const ACTION_RULES = ['DO_NOT_MIX', 'USE_SEPARATELY', 'CONSULT_EXPERT', 'MONITOR', 'SAFE_WITH_INTERVAL'];

const DrugInteractionFormModal = ({ isOpen, onClose, onSubmit, interaction, ingredients = [] }) => {
  const isEdit = !!interaction;
  const [formData, setFormData] = useState({
    ingredientAId: '',
    ingredientBId: '',
    interactionType: '',
    severity: '',
    warningMessage: '',
    actionRule: '',
    intervalDays: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (interaction) {
      setFormData({
        ingredientAId: interaction.ingredientAId || '',
        ingredientBId: interaction.ingredientBId || '',
        interactionType: interaction.interactionType || '',
        severity: interaction.severity || '',
        warningMessage: interaction.warningMessage || '',
        actionRule: interaction.actionRule || '',
        intervalDays: interaction.intervalDays ?? '',
      });
    } else {
      setFormData({ ingredientAId: '', ingredientBId: '', interactionType: '', severity: '', warningMessage: '', actionRule: '', intervalDays: '' });
    }
    setFormError('');
  }, [interaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ingredientAId || !formData.ingredientBId) {
      setFormError('Vui lòng chọn đủ 2 hoạt chất');
      return;
    }
    if (formData.ingredientAId === formData.ingredientBId) {
      setFormError('Hoạt chất A và B không được trùng nhau');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        ingredientAId: parseInt(formData.ingredientAId),
        ingredientBId: parseInt(formData.ingredientBId),
        intervalDays: formData.intervalDays !== '' ? parseInt(formData.intervalDays) : null,
      };
      await onSubmit(payload);
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
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl border border-outline-variant/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600 text-[20px]">warning</span>
            </div>
            <h2 className="text-lg font-black text-on-surface">
              {isEdit ? 'Cập nhật tương tác' : 'Thêm tương tác mới'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-dim flex items-center justify-center text-stone-500 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {formError}
            </div>
          )}

          {/* Ingredient selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Hoạt chất A <span className="text-error">*</span>
              </label>
              <select
                name="ingredientAId"
                value={formData.ingredientAId}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">-- Chọn hoạt chất A --</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Hoạt chất B <span className="text-error">*</span>
              </label>
              <select
                name="ingredientBId"
                value={formData.ingredientBId}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">-- Chọn hoạt chất B --</option>
                {ingredients.filter((i) => String(i.id) !== String(formData.ingredientAId)).map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Loại tương tác <span className="text-error">*</span>
              </label>
              <select
                name="interactionType"
                value={formData.interactionType}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">-- Chọn loại --</option>
                {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Mức độ nghiêm trọng <span className="text-error">*</span>
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">-- Chọn mức độ --</option>
                {SEVERITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Thông báo cảnh báo <span className="text-error">*</span>
            </label>
            <textarea
              name="warningMessage"
              value={formData.warningMessage}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả chi tiết về nguy cơ khi kết hợp 2 hoạt chất này..."
              className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-orange-500 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Quy tắc xử lý</label>
              <select
                name="actionRule"
                value={formData.actionRule}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">-- Chọn quy tắc --</option>
                {ACTION_RULES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Số ngày cách ly (nếu phun riêng)
              </label>
              <input
                type="number"
                name="intervalDays"
                value={formData.intervalDays}
                onChange={handleChange}
                min="0"
                placeholder="Ví dụ: 3"
                className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-stone-600 font-semibold hover:bg-surface-dim transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrugInteractionFormModal;
