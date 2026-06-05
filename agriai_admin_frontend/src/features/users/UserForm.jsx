import { useState, useEffect } from 'react';
import { userService } from './userService';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  roleId: '',
  isActive: true,
};

// Simple inline validation
const validate = (form, isEdit) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Họ tên không được để trống';
  if (!isEdit) {
    if (!form.email.trim()) errors.email = 'Email không được để trống';
    if (!form.password.trim()) errors.password = 'Mật khẩu không được để trống';
  }
  if (!form.roleId) errors.roleId = 'Vui lòng chọn vai trò';
  return errors;
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-on-surface-variant mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-error mt-1">{error}</p>}
  </div>
);

const inputCls =
  'w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all';

const UserForm = ({ user, onClose, onSuccess }) => {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        roleId: user.roleId ? String(user.roleId) : '',
        isActive: user.isActive ?? true,
      });
    }
  }, [user, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        roleId: Number(form.roleId),
        isActive: form.isActive,
      };
      if (isEdit) {
        await userService.updateUser(user.id, payload);
      } else {
        await userService.createUser({ ...payload, email: form.email, password: form.password });
      }
      onSuccess();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-on-surface">
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <span className="material-symbols-outlined text-stone-500">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          <Field label="Họ tên *" error={errors.fullName}>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={inputCls}
            />
          </Field>

          {!isEdit && (
            <>
              <Field label="Email *" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@agriai.vn"
                  className={inputCls}
                />
              </Field>

              <Field label="Mật khẩu *" error={errors.password}>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </Field>
            </>
          )}

          <Field label="Số điện thoại">
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="0987 654 321"
              className={inputCls}
            />
          </Field>

          <Field label="Vai trò *" error={errors.roleId}>
            <select name="roleId" value={form.roleId} onChange={handleChange} className={inputCls}>
              <option value="">Chọn vai trò</option>
              <option value="1">Admin</option>
              <option value="2">Người dùng</option>
            </select>
          </Field>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
            <span className="text-sm font-medium text-on-surface">Tài khoản hoạt động</span>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
