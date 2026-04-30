import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AddFarmingAreaModal from '../features/farmingArea/components/AddFarmingAreaModal';

const FarmingAreaPage = () => {
    const { user } = useAuth(); // useAuth: check authentication
    const [areas, setAreas] = useState([]); // useState: lưu danh sách khu vực canh tác tải về từ API.
    const [loading, setLoading] = useState(true); // useState: trạng thái đang tải dữ liệu khu vực canh tác.
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // useState: kiểm soát hiển thị modal thêm khu vực canh tác mới.

    // useCallback: ghi nhớ hàm fetchAreas để tránh tạo lại vô ích khi re-render.
    const fetchAreas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/areas', {
                withCredentials: true
            });
            setAreas(response.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khu vực canh tác:', error);
            setAreas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect: gọi fetchAreas khi component mount hoặc khi hàm fetchAreas thay đổi.
    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    const handleAddSuccess = (newArea) => {
        setAreas((prev) => [newArea, ...prev]);
    };

    return (
        <div className="pt-20 min-h-screen bg-background relative">
            <AddFarmingAreaModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddSuccess={handleAddSuccess}
            />

            {/* HEADER SYSTEM */}
            <main className="max-w-7xl mx-auto px-8 py-10">
                {/* Dashboard Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-[#00A651]">Khu vực canh tác</h1>
                        <p className="text-on-surface-variant text-sm">Quản lý không gian nông nghiệp và theo dõi tăng trưởng</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="signature-gradient text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <span className="material-symbols-outlined">eco</span>
                        Thêm khu vực canh tác
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-8 mb-20 md:mb-0">
                    {/* Table Section */}
                    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                                        <th className="px-6 py-5 whitespace-nowrap">Tên khu vực</th>
                                        <th className="px-6 py-5 whitespace-nowrap">Tỉnh</th>
                                        <th className="px-6 py-5 whitespace-nowrap">Địa chỉ</th>
                                        <th className="px-6 py-5 whitespace-nowrap">Mô tả</th>
                                        <th className="px-6 py-5 text-center whitespace-nowrap">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-variant/30">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : areas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-slate-500 font-medium">Chưa có khu vực canh tác nào.</td>
                                        </tr>
                                    ) : (
                                        areas.map((area) => (
                                            <tr key={area.id} className="hover:bg-surface-container-low/50 transition-colors">
                                                
                                                <td className="px-6 py-4 font-semibold whitespace-nowrap">{area.areaName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{area.province}</td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant min-w-[200px]">{area.address}</td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant italic min-w-[250px] truncate max-w-xs">{area.description}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button className="w-8 h-8 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] flex items-center justify-center hover:bg-[#00BFFF] hover:text-white transition-all" title="Chỉnh sửa">
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button className="w-8 h-8 rounded-lg bg-error-container/50 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all" title="Xóa">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-variant/20 px-6 py-4 flex justify-between items-center z-50">
                <Link to="/farming-areas" className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                    <span className="text-[10px] font-bold">Khu vực</span>
                </Link>
                <Link to="/diagnosis" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">search</span>
                    <span className="text-[10px] font-medium">Chẩn đoán</span>
                </Link>
                <Link to="/history" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">history</span>
                    <span className="text-[10px] font-medium">Lịch sử</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">account_circle</span>
                    <span className="text-[10px] font-medium">Cá nhân</span>
                </Link>
            </div>
        </div>
    );
};

export default FarmingAreaPage;
