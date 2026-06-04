import { useState } from 'react';

const DrugFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  drug = null, 
  ingredients = [] 
}) => {
  const [formData, setFormData] = useState(() => {
    if (drug) {
      return {
        drugName: drug.drugName || '',
        formulation: drug.formulation || '',
        manufacturer: drug.manufacturer || '',
        isActive: drug.isActive !== undefined ? drug.isActive : true,
        ingredients: drug.ingredients ? drug.ingredients.map(ing => ({
          ingredientId: ing.ingredientId || '',
          concentrationValue: ing.concentrationValue !== null ? ing.concentrationValue : '',
          concentrationUnit: ing.concentrationUnit || 'g/L'
        })) : []
      };
    }
    return {
      drugName: '',
      formulation: '',
      manufacturer: '',
      isActive: true,
      ingredients: []
    };
  });

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

  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: value
      };
      return { ...prev, ingredients: newIngredients };
    });

    if (errors[`ingredients_${index}`]) {
      setErrors(prev => ({ ...prev, [`ingredients_${index}`]: null }));
    }
  };

  const addIngredientRow = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { ingredientId: '', concentrationValue: '', concentrationUnit: 'g/L' }
      ]
    }));
  };

  const removeIngredientRow = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.drugName.trim()) {
      tempErrors.drugName = 'Tên thuốc không được để trống';
    } else if (formData.drugName.length > 150) {
      tempErrors.drugName = 'Tên thuốc không được vượt quá 150 ký tự';
    }

    if (formData.formulation.length > 20) {
      tempErrors.formulation = 'Dạng thuốc không được vượt quá 20 ký tự';
    }

    if (formData.manufacturer.length > 150) {
      tempErrors.manufacturer = 'Nhà sản xuất không được vượt quá 150 ký tự';
    }

    // Validate ingredient rows
    formData.ingredients.forEach((ing, index) => {
      if (!ing.ingredientId) {
        tempErrors[`ingredients_${index}`] = 'Vui lòng chọn hoạt chất';
      }
      if (ing.concentrationValue && isNaN(ing.concentrationValue)) {
        tempErrors[`ingredients_val_${index}`] = 'Nồng độ phải là một số';
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        drugName: formData.drugName,
        formulation: formData.formulation,
        manufacturer: formData.manufacturer,
        isActive: formData.isActive,
        ingredients: formData.ingredients.map(ing => ({
          ingredientId: Number(ing.ingredientId),
          concentrationValue: ing.concentrationValue === '' ? null : Number(ing.concentrationValue),
          concentrationUnit: ing.concentrationUnit
        }))
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
      <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/20 flex flex-col transform scale-100 transition-transform duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center bg-stone-50 dark:bg-stone-900 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-on-surface">
              {drug ? 'Chỉnh sửa Thuốc bảo vệ thực vật' : 'Thêm Thuốc bảo vệ thực vật mới'}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5 font-medium">Cung cấp các thông số thuốc và các hoạt chất cấu thành thuốc.</p>
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
            
            {/* Nhóm 1: Thông tin cơ bản */}
            <div>
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider mb-4">
                1. Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Tên thương mại thuốc <span className="text-error">*</span></label>
                  <input
                    type="text"
                    name="drugName"
                    value={formData.drugName}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.drugName ? 'border-error focus:border-error focus:ring-error' : ''}`}
                    placeholder="Nhập tên thuốc (ví dụ: Anvil 5SC, Regent 800WG...)"
                  />
                  {errors.drugName && <p className="text-xs text-error mt-1 font-semibold">{errors.drugName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Dạng thuốc (Formulation)</label>
                  <input
                    type="text"
                    name="formulation"
                    value={formData.formulation}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.formulation ? 'border-error' : ''}`}
                    placeholder="Ví dụ: EC, SC, WG, WP..."
                  />
                  {errors.formulation && <p className="text-xs text-error mt-1">{errors.formulation}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1.5">Nhà sản xuất (Manufacturer)</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors.manufacturer ? 'border-error' : ''}`}
                    placeholder="Nhập tên nhà sản xuất..."
                  />
                  {errors.manufacturer && <p className="text-xs text-error mt-1">{errors.manufacturer}</p>}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="form-checkbox text-emerald-600 border-outline-variant/30 focus:ring-emerald-500 rounded-lg w-5 h-5"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-stone-600 cursor-pointer">
                    Trạng thái hoạt động (Khuyên dùng)
                  </label>
                </div>
              </div>
            </div>

            {/* Nhóm 2: Hoạt chất thành phần */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded inline-block uppercase tracking-wider">
                  2. Hoạt chất thành phần (Active Ingredients)
                </h3>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Thêm hoạt chất
                </button>
              </div>

              {formData.ingredients.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-outline-variant/20 rounded-xl text-stone-400 text-sm">
                  Chưa có hoạt chất nào được thêm. Click "Thêm hoạt chất" để gán thành phần cho thuốc.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-outline-variant/10 items-start sm:items-center">
                      
                      {/* Chọn Hoạt chất */}
                      <div className="flex-1 w-full">
                        <select
                          value={ing.ingredientId}
                          onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                          className={`form-select w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors[`ingredients_${index}`] ? 'border-error' : ''}`}
                        >
                          <option value="">-- Chọn hoạt chất --</option>
                          {ingredients.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                        {errors[`ingredients_${index}`] && (
                          <p className="text-[10px] text-error mt-1 font-semibold">{errors[`ingredients_${index}`]}</p>
                        )}
                      </div>

                      {/* Giá trị Nồng độ */}
                      <div className="w-full sm:w-36">
                        <input
                          type="text"
                          value={ing.concentrationValue}
                          onChange={(e) => handleIngredientChange(index, 'concentrationValue', e.target.value)}
                          className={`form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500 ${errors[`ingredients_val_${index}`] ? 'border-error' : ''}`}
                          placeholder="Nồng độ (ví dụ: 5)"
                        />
                        {errors[`ingredients_val_${index}`] && (
                          <p className="text-[10px] text-error mt-1">{errors[`ingredients_val_${index}`]}</p>
                        )}
                      </div>

                      {/* Đơn vị Nồng độ */}
                      <div className="w-full sm:w-28">
                        <input
                          type="text"
                          value={ing.concentrationUnit}
                          onChange={(e) => handleIngredientChange(index, 'concentrationUnit', e.target.value)}
                          className="form-input w-full rounded-xl text-sm font-medium border-outline-variant/30 focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Đơn vị (g/L, %)"
                        />
                      </div>

                      {/* Nút xóa dòng */}
                      <button
                        type="button"
                        onClick={() => removeIngredientRow(index)}
                        className="w-10 h-10 shrink-0 rounded-xl bg-error/10 hover:bg-error/20 flex items-center justify-center text-error transition-colors self-end sm:self-center"
                        title="Xóa hoạt chất"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                <>Lưu thuốc</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrugFormModal;
