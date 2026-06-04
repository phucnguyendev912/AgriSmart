import { useState } from 'react';

const TreatmentPlanFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  plan = null, 
  diseases = [], 
  drugs = [] 
}) => {
  const [formData, setFormData] = useState(() => ({
    diseaseId: plan ? plan.diseaseId || '' : '',
    treatmentName: plan ? plan.treatmentName || '' : '',
    drugId: plan ? plan.drugId || '' : '',
    dosageType: plan ? plan.dosageType || 'PER_HA' : 'PER_HA',
    dosageValueMin: plan ? (plan.dosageValueMin !== null ? plan.dosageValueMin : '') : '',
    dosageValueMax: plan ? (plan.dosageValueMax !== null ? plan.dosageValueMax : '') : '',
    dosageUnit: plan ? plan.dosageUnit || '' : '',
    dosageAreaValue: plan ? (plan.dosageAreaValue !== null ? plan.dosageAreaValue : '') : '',
    dosageAreaUnit: plan ? plan.dosageAreaUnit || '' : '',
    mixingInstruction: plan ? plan.mixingInstruction || '' : '',
    waterVolumeMin: plan ? (plan.waterVolumeMin !== null ? plan.waterVolumeMin : '') : '',
    waterVolumeMax: plan ? (plan.waterVolumeMax !== null ? plan.waterVolumeMax : '') : '',
    waterVolumeUnit: plan ? plan.waterVolumeUnit || 'L' : 'L',
    sprayTimes: plan ? (plan.sprayTimes !== null ? plan.sprayTimes : '') : '',
    sprayInterval: plan ? plan.sprayInterval || '' : '',
    applicationMethod: plan ? plan.applicationMethod || '' : '',
    applicationTime: plan ? plan.applicationTime || '' : '',
    safetyNotes: plan ? plan.safetyNotes || '' : '',
    description: plan ? plan.description || '' : ''
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.treatmentName.trim()) {
      tempErrors.treatmentName = 'Tên phác đồ không được để trống';
    }
    if (!formData.diseaseId) {
      tempErrors.diseaseId = 'Vui lòng chọn bệnh điều trị';
    }
    if (!formData.dosageType) {
      tempErrors.dosageType = 'Vui lòng chọn loại liều lượng';
    }
    
    // Number validations if entered
    if (formData.dosageValueMin && isNaN(formData.dosageValueMin)) {
      tempErrors.dosageValueMin = 'Liều lượng phải là số';
    }
    if (formData.dosageValueMax && isNaN(formData.dosageValueMax)) {
      tempErrors.dosageValueMax = 'Liều lượng phải là số';
    }
    if (formData.dosageAreaValue && isNaN(formData.dosageAreaValue)) {
      tempErrors.dosageAreaValue = 'Diện tích phải là số';
    }
    if (formData.waterVolumeMin && isNaN(formData.waterVolumeMin)) {
      tempErrors.waterVolumeMin = 'Lượng nước phải là số';
    }
    if (formData.waterVolumeMax && isNaN(formData.waterVolumeMax)) {
      tempErrors.waterVolumeMax = 'Lượng nước phải là số';
    }
    if (formData.sprayTimes && (isNaN(formData.sprayTimes) || Number(formData.sprayTimes) < 0)) {
      tempErrors.sprayTimes = 'Số lần phun phải là số nguyên dương';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        diseaseId: Number(formData.diseaseId),
        treatmentName: formData.treatmentName,
        drugId: formData.drugId ? Number(formData.drugId) : null,
        dosageType: formData.dosageType,
        dosageValueMin: formData.dosageValueMin === '' ? null : Number(formData.dosageValueMin),
        dosageValueMax: formData.dosageValueMax === '' ? null : Number(formData.dosageValueMax),
        dosageUnit: formData.dosageUnit,
        dosageAreaValue: formData.dosageAreaValue === '' ? null : Number(formData.dosageAreaValue),
        dosageAreaUnit: formData.dosageAreaUnit,
        mixingInstruction: formData.mixingInstruction,
        waterVolumeMin: formData.waterVolumeMin === '' ? null : Number(formData.waterVolumeMin),
        waterVolumeMax: formData.waterVolumeMax === '' ? null : Number(formData.waterVolumeMax),
        waterVolumeUnit: formData.waterVolumeUnit,
        sprayTimes: formData.sprayTimes === '' ? null : Number(formData.sprayTimes),
        sprayInterval: formData.sprayInterval,
        applicationMethod: formData.applicationMethod,
        applicationTime: formData.applicationTime,
        safetyNotes: formData.safetyNotes,
        description: formData.description
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/20 flex flex-col transform scale-100 transition-transform duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center bg-stone-50 dark:bg-stone-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-on-surface">
              {plan ? 'Chỉnh sửa Phác đồ điều trị' : 'Thêm Phác đồ điều trị mới'}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5 font-medium">Điền đầy đủ thông tin cấu hình phác đồ bên dưới.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Nhóm 1: Thông tin chung */}
            <div>
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider mb-4">
                1. Thông tin chung phác đồ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Tên phác đồ <span className="text-error">*</span></label>
                  <input
                    type="text"
                    name="treatmentName"
                    value={formData.treatmentName}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.treatmentName ? 'border-error focus:border-error focus:ring-error' : ''}`}
                    placeholder="Nhập tên phác đồ điều trị..."
                  />
                  {errors.treatmentName && <p className="text-xs text-error mt-1 font-semibold">{errors.treatmentName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Bệnh cần điều trị <span className="text-error">*</span></label>
                  <select
                    name="diseaseId"
                    value={formData.diseaseId}
                    onChange={handleChange}
                    className={`form-select w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.diseaseId ? 'border-error focus:border-error' : ''}`}
                  >
                    <option value="">-- Chọn bệnh điều trị --</option>
                    {diseases.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.diseaseId && <p className="text-xs text-error mt-1 font-semibold">{errors.diseaseId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Thuốc sử dụng</label>
                  <select
                    name="drugId"
                    value={formData.drugId}
                    onChange={handleChange}
                    className="form-select w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">-- Không sử dụng thuốc cụ thể (Không) --</option>
                    {drugs.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Cấu hình Liều lượng */}
            <div>
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider mb-4">
                2. Cấu hình Liều lượng thuốc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Loại liều lượng <span className="text-error">*</span></label>
                  <select
                    name="dosageType"
                    value={formData.dosageType}
                    onChange={handleChange}
                    className="form-select w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="PER_HA">Theo hecta (PER_HA)</option>
                    <option value="PER_TANK">Theo bình phun (PER_TANK)</option>
                    <option value="PER_AREA">Theo diện tích (PER_AREA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Liều lượng nhỏ nhất (Min)</label>
                  <input
                    type="text"
                    name="dosageValueMin"
                    value={formData.dosageValueMin}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.dosageValueMin ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 10"
                  />
                  {errors.dosageValueMin && <p className="text-xs text-error mt-1">{errors.dosageValueMin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Liều lượng lớn nhất (Max)</label>
                  <input
                    type="text"
                    name="dosageValueMax"
                    value={formData.dosageValueMax}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.dosageValueMax ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 20"
                  />
                  {errors.dosageValueMax && <p className="text-xs text-error mt-1">{errors.dosageValueMax}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Đơn vị liều lượng</label>
                  <input
                    type="text"
                    name="dosageUnit"
                    value={formData.dosageUnit}
                    onChange={handleChange}
                    className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: ml, g, kg, L"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Giá trị diện tích áp dụng</label>
                  <input
                    type="text"
                    name="dosageAreaValue"
                    value={formData.dosageAreaValue}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.dosageAreaValue ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 1"
                  />
                  {errors.dosageAreaValue && <p className="text-xs text-error mt-1">{errors.dosageAreaValue}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Đơn vị diện tích</label>
                  <input
                    type="text"
                    name="dosageAreaUnit"
                    value={formData.dosageAreaUnit}
                    onChange={handleChange}
                    className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: ha, bình 16L, 1000m2"
                  />
                </div>
              </div>
            </div>

            {/* Nhóm 3: Lượng nước & Phun xịt */}
            <div>
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider mb-4">
                3. Cấu hình Lượng nước & Cách phun
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Lượng nước nhỏ nhất</label>
                  <input
                    type="text"
                    name="waterVolumeMin"
                    value={formData.waterVolumeMin}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.waterVolumeMin ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 300"
                  />
                  {errors.waterVolumeMin && <p className="text-xs text-error mt-1">{errors.waterVolumeMin}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Lượng nước lớn nhất</label>
                  <input
                    type="text"
                    name="waterVolumeMax"
                    value={formData.waterVolumeMax}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.waterVolumeMax ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 400"
                  />
                  {errors.waterVolumeMax && <p className="text-xs text-error mt-1">{errors.waterVolumeMax}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Đơn vị nước</label>
                  <input
                    type="text"
                    name="waterVolumeUnit"
                    value={formData.waterVolumeUnit}
                    onChange={handleChange}
                    className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Số lần phun</label>
                  <input
                    type="text"
                    name="sprayTimes"
                    value={formData.sprayTimes}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.sprayTimes ? 'border-error' : ''}`}
                    placeholder="Ví dụ: 2"
                  />
                  {errors.sprayTimes && <p className="text-xs text-error mt-1">{errors.sprayTimes}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Khoảng cách phun</label>
                  <input
                    type="text"
                    name="sprayInterval"
                    value={formData.sprayInterval}
                    onChange={handleChange}
                    className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: 7-10 ngày / lần"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Thời điểm phun thích hợp</label>
                  <input
                    type="text"
                    name="applicationTime"
                    value={formData.applicationTime}
                    onChange={handleChange}
                    className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: Phun khi vết bệnh chớm xuất hiện, sáng sớm hoặc chiều mát"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Phương pháp phun</label>
                  <textarea
                    name="applicationMethod"
                    value={formData.applicationMethod}
                    onChange={handleChange}
                    rows="2"
                    className="form-textarea w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Mô tả phương pháp phun xịt (phun ướt đều tán lá, phun gốc...)"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Nhóm 4: Hướng dẫn pha & Ghi chú */}
            <div>
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider mb-4">
                4. Hướng dẫn sử dụng & Ghi chú
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Hướng dẫn pha thuốc</label>
                  <textarea
                    name="mixingInstruction"
                    value={formData.mixingInstruction}
                    onChange={handleChange}
                    rows="3"
                    className="form-textarea w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: Pha 10ml thuốc với 16L nước, lắc đều trước khi phun..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Lưu ý an toàn (Thời gian cách ly, thiết bị bảo hộ...)</label>
                  <textarea
                    name="safetyNotes"
                    value={formData.safetyNotes}
                    onChange={handleChange}
                    rows="2"
                    className="form-textarea w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Ví dụ: Thời gian cách ly 7 ngày. Mang đồ bảo hộ khi phun thuốc..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Mô tả thêm về phác đồ</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className="form-textarea w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Nhập mô tả phác đồ..."
                  ></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-outline-variant/15 flex justify-end gap-3 bg-stone-50 dark:bg-stone-900 sticky bottom-0 z-10 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>Lưu phác đồ</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentPlanFormModal;
