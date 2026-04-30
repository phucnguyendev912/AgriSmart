import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const AddFarmingAreaModal = ({ isOpen, onClose, onAddSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        areaName: '',
        province: '',
        address: '',
        areaSize: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorText(null);
        setLoading(true);

        try {
            // Gọi API POST /api/areas
            const response = await axios.post(
                'http://localhost:8080/api/areas',
                {
                    areaName: formData.areaName,
                    province: formData.province,
                    address: formData.address,
                    areaSize: parseFloat(formData.areaSize) || 0,
                    description: formData.description
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            // Nếu thành công, đóng modal và gọi callback refresh data
            onAddSuccess(response.data);
            onClose();
        } catch (error) {
            console.error('Lỗi khi thêm khu vực mới:', error);
            setErrorText(error.response?.data?.message || 'Có lỗi xảy ra khi lưu khu vực. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-[#191c1d]/30 backdrop-blur-sm z-40" onClick={onClose}></div>

            {/* Main Modal Container */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-[1.25rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Modal Header */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-[#afefb4]/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#006e2f]">map</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#191c1d]">Thêm khu vực canh tác</h2>
                    </div>
                    <p className="text-[#3d4a3d] text-sm font-medium">Nhập thông tin khu vực trồng trọt của bạn</p>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">

                        {/* Alert Error State */}
                        {errorText && (
                            <div className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700">
                                <span className="material-symbols-outlined">error</span>
                                <p className="text-sm font-medium">{errorText}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 1. Tên vườn */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[0.75rem] font-bold text-[#3d4a3d] uppercase tracking-wider">Tên vườn *</label>
                                <div className="relative">
                                    <input
                                        name="areaName"
                                        value={formData.areaName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-[#f3f4f5] border-b-2 border-transparent focus:border-[#22C55E] px-4 py-3 rounded-t-lg transition-all outline-none text-[#191c1d] placeholder:text-[#6d7b6c]"
                                        placeholder="Ví dụ: Vườn cà chua Long Thành"
                                        type="text"
                                    />
                                </div>
                            </div>

                            {/* 2. Tỉnh/Thành phố */}
                            <div className="space-y-2">
                                <label className="text-[0.75rem] font-bold text-[#3d4a3d] uppercase tracking-wider">Tỉnh/Thành phố *</label>
                                <div className="relative">
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-[#f3f4f5] border-b-2 border-transparent focus:border-[#22C55E] px-4 py-3 rounded-t-lg appearance-none transition-all outline-none text-[#191c1d]"
                                    >
                                        <option disabled value="">Chọn tỉnh/thành phố</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                        <option value="Lâm Đồng">Lâm Đồng</option>
                                        <option value="Đồng Tháp">Đồng Tháp</option>
                                        <option value="Tiền Giang">Tiền Giang</option>
                                        <option value="Cần Thơ">Cần Thơ</option>
                                        {/* Thực tế sẽ lấy từ API tỉnh thành, tạm hardcode vài tỉnh */}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[#3d4a3d]">expand_more</span>
                                </div>
                            </div>

                            {/* 4. Diện tích */}
                            <div className="space-y-2">
                                <label className="text-[0.75rem] font-bold text-[#3d4a3d] uppercase tracking-wider">Diện tích (ha) *</label>
                                <div className="flex gap-2">
                                    <input
                                        name="areaSize"
                                        value={formData.areaSize}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        min="0.01"
                                        className="w-full bg-[#f3f4f5] border-b-2 border-transparent focus:border-[#22C55E] px-4 py-3 rounded-t-lg transition-all outline-none text-[#191c1d]"
                                        placeholder="0"
                                        type="number"
                                    />
                                    <select disabled className="w-24 bg-[#f3f4f5] border-b-2 border-transparent px-3 py-3 rounded-t-lg appearance-none outline-none text-[#191c1d] font-bold text-sm text-center">
                                        <option value="ha">ha</option>
                                        <option value="m2">m2</option>
                                    </select>
                                </div>
                            </div>

                            {/* 3. Địa chỉ chi tiết */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[0.75rem] font-bold text-[#3d4a3d] uppercase tracking-wider">Địa chỉ chi tiết</label>
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#f3f4f5] border-b-2 border-transparent focus:border-[#22C55E] px-4 py-3 rounded-t-lg transition-all outline-none text-[#191c1d] placeholder:text-[#6d7b6c]"
                                    placeholder="Ví dụ: Thôn 3, xã Long Thành"
                                    type="text"
                                />
                            </div>

                            {/* 5. Mô tả */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[0.75rem] font-bold text-[#3d4a3d] uppercase tracking-wider">Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-[#f3f4f5] border-b-2 border-transparent focus:border-[#22C55E] px-4 py-3 rounded-t-lg transition-all outline-none text-[#191c1d] placeholder:text-[#6d7b6c] resize-none"
                                    placeholder="Ví dụ: Đất đỏ bazan, trồng cà phê..."
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 bg-gray-50 flex flex-col-reverse md:flex-row items-center justify-end gap-4 rounded-b-[1.25rem]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-200 transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-10 py-3 bg-[#22C55E] text-white font-bold rounded-xl shadow-lg shadow-[#22C55E]/20 hover:bg-green-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddFarmingAreaModal;
