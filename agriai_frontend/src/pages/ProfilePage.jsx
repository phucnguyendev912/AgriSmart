import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <SEO 
        title="Hồ sơ cá nhân - AgriAI" 
        description="Quản lý và cập nhật hồ sơ cá nhân của bạn trên AgriAI." 
        url="/profile" 
      />

      <main className="pt-28 pb-20 px-4 flex-1">
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
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                  {/* Avatar Upload Zone */}
                  <div className="flex flex-col items-center gap-4 shrink-0">
                    <div className="relative group cursor-pointer">
                      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-surface-container-low ring-4 ring-primary/5">
                        <img
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwkEWu0WqyU31yxNoHWyVC82LrK4BfXAIXw1A8-vz91lLgiACubnrtdJ7hgsI8ENOLmSZnoltZ6DFf_Kbv5xAw_KTR5OOvGsOCPtxNg2y_mogusneSgR1yaPNtxvc_wEGaPLGFDuzaB9cgmudQ5W0aP4oxpeDbDb7yiiApRffsFtO1PR42H5UnS7N-PGNduluQ42uMxPh05NMpi-Bx0YRBhtKs89D1aR5403FlbD4XKhw1UQL_QkoOl0FuzhIYvT1r36WpqrObgHSh"
                        />
                      </div>
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">
                          photo_camera
                        </span>
                      </div>
                      <button className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-xl hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm font-bold">
                          edit
                        </span>
                      </button>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">
                        Định dạng: JPG, PNG (Max 2MB)
                      </span>
                    </div>
                  </div>

                  {/* Basic Info Form */}
                  <div className="flex-1 w-full space-y-8">
                    <div>
                      <h3 className="text-2xl font-black text-on-surface mb-2">Thông tin cơ bản</h3>
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
                          className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                          Email
                        </label>
                        <input
                          className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                          Số điện thoại
                        </label>
                        <input
                          className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 text-on-surface focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                      <button className="bg-primary hover:bg-primary-container text-white font-bold px-10 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-xl">save</span>
                        Lưu thay đổi
                      </button>
                      <button className="text-stone-500 hover:text-on-surface font-bold px-8 py-4 rounded-xl transition-all border border-stone-200">
                        Hủy bỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
