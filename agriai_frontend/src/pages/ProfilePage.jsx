import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import { updateProfile } from '../services/userService';
import { uploadAttachment } from '../services/attachmentService';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user, updateUserContext } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarAttachmentId, setAvatarAttachmentId] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhoneNumber(user?.phoneNumber || '');
    setErrors({});
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }
    
    const phoneRegex = /^(?!.*(\d)\1{4})(03|05|07|08|09)\d{8}$/;
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Số điện thoại không được để trống.';
    } else if (!phoneRegex.test(phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ. Phải gồm 10 chữ số, bắt đầu bằng đầu số hợp lệ (03, 05, 07, 08, 09) và không chứa 5 chữ số trùng nhau liên tiếp.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 10MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await uploadAttachment(file, 'AVATAR');
      const attachment = response.data;
      setAvatarUrl(attachment.fileUrl);
      setAvatarAttachmentId(attachment.id);
      toast.success('Tải ảnh đại diện lên thành công! Nhấn lưu thay đổi để hoàn tất.');
    } catch (error) {
      console.error('Lỗi upload avatar:', error);
      toast.error(error.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || '');
    setPhoneNumber(user?.phoneNumber || '');
    setAvatarUrl(user?.avatarUrl || '');
    setAvatarAttachmentId(null);
    setErrors({});
  };

  const handleUpdateProfile = async () => {
    if (!validate()) return;
    setIsUpdating(true);
    try {
      const payload = { fullName, phoneNumber };
      if (avatarAttachmentId) {
        payload.avatarAttachmentId = avatarAttachmentId;
      }
      const response = await updateProfile(payload);
      updateUserContext(response.data);
      toast.success('Cập nhật thông tin thành công!');
      setAvatarAttachmentId(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      toast.error('Cập nhật thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsUpdating(false);
    }
  };

  const profileLoading = !user;

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <SEO 
        title="Hồ sơ cá nhân" 
        description="Quản lý và cập nhật hồ sơ cá nhân của bạn trên AgriSmart." 
        url="/profile"
        noIndex
      />

      <main className="pt-28 pb-20 px-4 flex-1 animate-page-enter">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-stone-400 uppercase">
            <Link to="/home" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface">Hồ sơ cá nhân</span>
          </nav>

          <div className="w-full">
            <section>
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-stone-200/40 overflow-hidden p-6 md:p-10">
                {profileLoading ? (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* User Avatar & Name Skeleton */}
                    <div className="flex flex-col items-center gap-4 shrink-0 animate-pulse">
                      <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-slate-50 ring-4 ring-slate-100/5"></div>
                      <div className="h-5 bg-slate-100 rounded w-24"></div>
                      <div className="h-3 bg-slate-100 rounded w-32 mt-1"></div>
                    </div>

                    {/* Basic Info Form Skeleton */}
                    <div className="flex-1 w-full space-y-8 animate-pulse">
                      <div>
                        <div className="h-7 bg-slate-100 rounded-lg w-48 mb-3"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-full mb-1.5"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <div className="h-3 bg-slate-100 rounded w-16 mb-2"></div>
                          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                        </div>
                        <div>
                          <div className="h-3 bg-slate-100 rounded w-12 mb-2"></div>
                          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                        </div>
                        <div>
                          <div className="h-3 bg-slate-100 rounded w-24 mb-2"></div>
                          <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex gap-4">
                        <div className="h-14 bg-slate-100 rounded-xl w-36"></div>
                        <div className="h-14 bg-slate-100 rounded-xl w-24"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* User Avatar & Name */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                      <div 
                        onClick={() => !isUploadingAvatar && document.getElementById('avatar-file-input').click()}
                        className="w-36 h-36 rounded-full bg-primary/10 border-4 border-surface-container-low ring-4 ring-primary/5 flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all hover:scale-[1.02]">
                        {isUploadingAvatar ? (
                          <div className="flex flex-col items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl animate-spin">refresh</span>
                            <span className="text-[10px] font-black tracking-wider uppercase mt-1">Đang tải...</span>
                          </div>
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-black text-primary select-none group-hover:opacity-30 transition-opacity">
                            {(fullName || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                        
                        {!isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                          </div>
                        )}
                      </div>
                      <input 
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                      <div className="text-center">
                        <p className="text-lg font-black text-on-surface">{user?.fullName || ''}</p>
                        <p className="text-xs text-stone-400 font-medium mt-0.5">{user?.email || ''}</p>
                      </div>
                    </div>

                    {/* Basic Info Form */}
                    <div className="flex-1 w-full space-y-8">
                      <div>
                        <h3 className="text-2xl font-black text-on-surface mb-2">Thông tin cá nhân</h3>
                        <p className="text-sm text-stone-500 font-medium">
                          Cập nhật thông tin của bạn để chúng tôi có thể cung cấp các chẩn đoán cây trồng
                          chính xác hơn dựa trên vị trí và lịch sử của bạn.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 group">
                          <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                            Họ và tên
                          </label>
                          <input
                            className={`w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold ${errors.fullName ? 'ring-2 ring-error/50' : ''}`}
                            type="text"
                            value={fullName}
                            onChange={(e) => { setFullName(e.target.value); setErrors({...errors, fullName: null}) }}
                          />
                          {errors.fullName && <p className="text-error text-xs font-bold mt-2 ml-1">{errors.fullName}</p>}
                        </div>
                        <div className="group">
                          <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                            Email
                          </label>
                          <input
                            className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold opacity-70 cursor-not-allowed"
                            type="email"
                            value={user?.email || ''}
                            disabled
                          />
                        </div>
                        <div className="group">
                          <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                            Số điện thoại
                          </label>
                          <input
                            className={`w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold ${errors.phoneNumber ? 'ring-2 ring-error/50' : ''}`}
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => { setPhoneNumber(e.target.value); setErrors({...errors, phoneNumber: null}) }}
                          />
                          {errors.phoneNumber && <p className="text-error text-xs font-bold mt-2 ml-1">{errors.phoneNumber}</p>}
                        </div>
                      </div>
                      
                      <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="bg-primary hover:bg-primary-container text-white font-bold px-10 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isUpdating ? (
                            <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                          ) : (
                            <span className="material-symbols-outlined text-xl">save</span>
                          )}
                          {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button onClick={handleCancel} className="text-stone-500 hover:text-on-surface font-bold px-8 py-4 rounded-xl transition-all border border-stone-200">
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
