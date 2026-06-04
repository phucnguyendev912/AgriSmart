import { useState, useEffect } from 'react';

const WEATHER_FACTORS = [
  { value: 'TEMPERATURE', label: 'Nhiệt độ', defaultUnit: '°C' },
  { value: 'HUMIDITY', label: 'Độ ẩm', defaultUnit: '%' },
  { value: 'RAINFALL', label: 'Lượng mưa', defaultUnit: 'mm' },
];

const OPERATORS = [
  { value: 'GREATER_THAN', label: 'Lớn hơn (>)', needsMin: true, needsMax: false },
  { value: 'LESS_THAN', label: 'Nhỏ hơn (<)', needsMin: false, needsMax: true },
  { value: 'BETWEEN', label: 'Trong khoảng (≤ x ≤)', needsMin: true, needsMax: true },
  { value: 'EQUALS', label: 'Bằng (=)', needsMin: true, needsMax: false },
];

const WeatherConditionFormModal = ({ isOpen, onClose, onSubmit, condition, diseases = [] }) => {
  const isEdit = !!condition;
  const [formData, setFormData] = useState({
    diseaseId: '',
    conditionGroup: '',
    weatherFactor: '',
    operator: '',
    minValue: '',
    maxValue: '',
    recommendationNote: '',
    unit: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedOperator = OPERATORS.find((op) => op.value === formData.operator);

  useEffect(() => {
    if (condition) {
      setFormData({
        diseaseId: condition.diseaseId || '',
        conditionGroup: condition.conditionGroup || '',
        weatherFactor: condition.weatherFactor || '',
        operator: condition.operator || '',
        minValue: condition.minValue ?? '',
        maxValue: condition.maxValue ?? '',
        recommendationNote: condition.recommendationNote || '',
        unit: condition.unit || '',
        isActive: condition.isActive ?? true,
      });
    } else {
      setFormData({ diseaseId: '', conditionGroup: '', weatherFactor: '', operator: '', minValue: '', maxValue: '', recommendationNote: '', unit: '', isActive: true });
    }
    setFormError('');
  }, [condition, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'weatherFactor') {
      const factor = WEATHER_FACTORS.find((f) => f.value === value);
      setFormData((prev) => ({ ...prev, weatherFactor: value, unit: factor?.defaultUnit || prev.unit }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diseaseId || !formData.weatherFactor || !formData.operator || !formData.conditionGroup) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    if (formData.operator === 'BETWEEN' && (!formData.minValue || !formData.maxValue)) {
      setFormError('Toán tử BETWEEN yêu cầu cả giá trị tối thiểu và tối đa');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        diseaseId: parseInt(formData.diseaseId),
        minValue: formData.minValue !== '' ? parseFloat(formData.minValue) : null,
        maxValue: formData.maxValue !== '' ? parseFloat(formData.maxValue) : null,
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
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-sky-600 text-[20px]">cloud</span>
            </div>
            <h2 className="text-lg font-black text-on-surface">
              {isEdit ? 'Cập nhật điều kiện thời tiết' : 'Thêm điều kiện thời tiết'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Bệnh <span className="text-error">*</span>
              </label>
              <select
                name="diseaseId"
                value={formData.diseaseId}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">-- Chọn bệnh --</option>
                {diseases.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Nhóm điều kiện <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="conditionGroup"
                value={formData.conditionGroup}
                onChange={handleChange}
                placeholder="Ví dụ: group_1, high_risk..."
                className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Yếu tố thời tiết <span className="text-error">*</span>
              </label>
              <select
                name="weatherFactor"
                value={formData.weatherFactor}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">-- Chọn yếu tố --</option>
                {WEATHER_FACTORS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                Toán tử <span className="text-error">*</span>
              </label>
              <select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                className="form-select w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="">-- Chọn toán tử --</option>
                {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dynamic min/max inputs */}
          {selectedOperator && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-sky-50/50 rounded-xl p-4 border border-sky-100">
              <p className="col-span-full text-xs font-bold text-sky-700 uppercase tracking-widest">Giá trị ngưỡng</p>
              {selectedOperator.needsMin && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">
                    {formData.operator === 'BETWEEN' ? 'Giá trị tối thiểu' : 'Giá trị'}
                  </label>
                  <input
                    type="number"
                    name="minValue"
                    value={formData.minValue}
                    onChange={handleChange}
                    step="0.01"
                    className="form-input w-full rounded-xl border-outline-variant/30 bg-white font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              )}
              {selectedOperator.needsMax && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">Giá trị tối đa</label>
                  <input
                    type="number"
                    name="maxValue"
                    value={formData.maxValue}
                    onChange={handleChange}
                    step="0.01"
                    className="form-input w-full rounded-xl border-outline-variant/30 bg-white font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Đơn vị</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="°C, %, mm..."
                  className="form-input w-full rounded-xl border-outline-variant/30 bg-white font-medium text-on-surface placeholder-stone-400 focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Ghi chú khuyến nghị</label>
            <textarea
              name="recommendationNote"
              value={formData.recommendationNote}
              onChange={handleChange}
              rows={3}
              placeholder="Khuyến nghị cho nông dân khi gặp điều kiện này..."
              className="form-input w-full rounded-xl border-outline-variant/30 bg-surface/50 font-medium text-on-surface placeholder-stone-400 focus:border-sky-500 focus:ring-sky-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-sky-600"
            />
            <span className="text-sm font-semibold text-on-surface">Kích hoạt điều kiện này</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-stone-600 font-semibold hover:bg-surface-dim transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeatherConditionFormModal;
