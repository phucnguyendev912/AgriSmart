import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh',
  'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh',
  'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8080';

/**
 * Modal chỉnh sửa khu vực canh tác.
 *
 * @param {boolean}  isOpen       - Hiện/ẩn modal
 * @param {function} onClose      - Đóng modal
 * @param {object}   area         - Dữ liệu khu vực cần chỉnh sửa { id, areaName, province, address, areaSize, description }
 * @param {function} onEditSuccess - Callback sau khi cập nhật thành công, nhận về data mới
 */
const EditFarmingAreaModal = ({ isOpen, onClose, area, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    areaName: '',
    province: '',
    address: '',
    area: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Sync formData khi area prop thay đổi (bao gồm cả khi modal mở)
  useEffect(() => {
    if (isOpen && area) {
      setFormData({
        areaName: area.areaName ?? '',
        province: area.province ?? '',
        address: area.address ?? '',
        area: area.area ?? '',
        description: area.description ?? '',
      });
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, area]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.areaName.trim()) newErrors.areaName = 'Vui lòng nhập tên vườn';
    if (!formData.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    return newErrors;
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi của field đang sửa
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/api/areas/${area.id}`,
        {
          areaName: formData.areaName.trim(),
          province: formData.province,
          address: formData.address.trim(),
          area: parseFloat(formData.area) || 0,
          description: formData.description.trim(),
        },
        { withCredentials: true }
      );

      // Hiện toast thành công
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onEditSuccess?.(res.data);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Lỗi khi cập nhật khu vực:', err);
      setApiError(err.response?.data?.message ?? 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (!loading) onClose();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ── Toast thành công ── */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[130] flex items-center gap-3 bg-surface-container-lowest border-l-4 border-primary px-5 py-4 rounded-xl shadow-[0_12px_32px_rgba(25,28,29,0.1)] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <p className="text-sm font-semibold text-on-surface">
            ✅ Cập nhật khu vực thành công
          </p>
        </div>
      )}

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-[#191c1d]/30 backdrop-blur-sm z-[110]"
        onClick={handleBackdropClick}
      />

      {/* ── Modal ── */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 md:px-8 pt-8 pb-6 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">agriculture</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-on-background tracking-tight">
                Chỉnh sửa khu vực canh tác
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Cập nhật thông tin khu vực trồng trọt của bạn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant disabled:opacity-40"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 md:px-8 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">

            {/* API Error Alert */}
            {apiError && (
              <div className="flex gap-3 p-4 bg-error-container text-error rounded-xl border border-error/20">
                <span className="material-symbols-outlined flex-shrink-0">error</span>
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Tên vườn */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Tên vườn *
                </label>
                <input
                  name="areaName"
                  type="text"
                  value={formData.areaName}
                  onChange={handleChange}
                  placeholder="Ví dụ: Vườn cà chua Long Thành"
                  className={`w-full bg-white border px-4 py-3 rounded-lg focus:ring-2 focus:outline-none transition-all placeholder:text-on-surface-variant/50 ${
                    errors.areaName
                      ? 'border-error focus:ring-error/20'
                      : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {errors.areaName && (
                  <p className="text-xs text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.areaName}
                  </p>
                )}
              </div>

              {/* Tỉnh/Thành phố */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Tỉnh/Thành phố *
                </label>
                <div className="relative">
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={`w-full bg-white border px-4 py-3 rounded-lg focus:ring-2 focus:outline-none appearance-none transition-all ${
                      errors.province
                        ? 'border-error focus:ring-error/20'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                    }`}
                  >
                    <option value="" disabled>Chọn tỉnh/thành phố</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3.5 pointer-events-none text-on-surface-variant text-base">
                    expand_more
                  </span>
                </div>
                {errors.province && (
                  <p className="text-xs text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.province}
                  </p>
                )}
              </div>

              {/* Địa chỉ chi tiết */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Địa chỉ chi tiết
                </label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ví dụ: Thôn 3, xã Long Thành, huyện Long Thành"
                  className="w-full bg-white border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/50"
                />
              </div>
              {/* Mô tả */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ví dụ: Đất đỏ bazan, trồng cà phê 2ha..."
                  rows={4}
                  className="w-full bg-white border border-outline-variant px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none placeholder:text-on-surface-variant/50"
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 py-6 bg-surface-container-low/50 border-t border-surface-variant/20 flex flex-col-reverse md:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white border-2 border-outline-variant text-on-surface-variant py-3.5 px-8 rounded-xl font-bold hover:bg-surface-container-low transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-primary text-white py-3.5 px-8 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Cập nhật
              {!loading && (
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </>
  );
};

export default EditFarmingAreaModal;
