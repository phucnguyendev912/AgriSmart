import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAreas, deleteArea } from '../services/farmingAreaService';

import { AddFarmingAreaModal, EditFarmingAreaModal } from '../features/farming-area';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SkeletonRow from '../components/ui/SkeletonRow';
import EmptyState from '../components/ui/EmptyState';

// Tọa độ trung tâm của các tỉnh/thành phố Việt Nam
const PROVINCE_COORDS = [
    { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
    { name: 'Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
    { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
    { name: 'Đà Nẵng', lat: 16.0471, lon: 108.2068 },
    { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
    { name: 'An Giang', lat: 10.3561, lon: 105.4352 },
    { name: 'Bà Rịa - Vũng Tàu', lat: 10.4113, lon: 107.1369 },
    { name: 'Bắc Giang', lat: 21.2731, lon: 106.1947 },
    { name: 'Bắc Kạn', lat: 22.1474, lon: 105.8348 },
    { name: 'Bạc Liêu', lat: 9.2941, lon: 105.7278 },
    { name: 'Bắc Ninh', lat: 21.1861, lon: 106.0763 },
    { name: 'Ẩn Tre', lat: 10.2434, lon: 106.3756 },
    { name: 'Bình Định', lat: 13.7820, lon: 109.2197 },
    { name: 'Bình Dương', lat: 11.3254, lon: 106.4770 },
    { name: 'Bình Phước', lat: 11.7512, lon: 106.7235 },
    { name: 'Bình Thuận', lat: 11.0904, lon: 108.0721 },
    { name: 'Cà Mau', lat: 9.1769, lon: 105.1500 },
    { name: 'Cao Bằng', lat: 22.6657, lon: 106.2522 },
    { name: 'Đắc Lậk', lat: 12.7100, lon: 108.2378 },
    { name: 'Đắc Nông', lat: 12.2646, lon: 107.6098 },
    { name: 'Điện Biên', lat: 21.3860, lon: 103.0230 },
    { name: 'Đồng Nai', lat: 11.0686, lon: 107.1676 },
    { name: 'Đồng Tháp', lat: 10.4938, lon: 105.6882 },
    { name: 'Gia Lai', lat: 13.9833, lon: 108.0000 },
    { name: 'Hà Giang', lat: 22.8025, lon: 104.9784 },
    { name: 'Hà Nam', lat: 20.5835, lon: 105.9230 },
    { name: 'Hà Tĩnh', lat: 18.3559, lon: 105.8877 },
    { name: 'Hải Dương', lat: 20.9373, lon: 106.3147 },
    { name: 'Hậu Giang', lat: 9.7579, lon: 105.6413 },
    { name: 'Hòa Bình', lat: 20.8133, lon: 105.3383 },
    { name: 'Hưng Yên', lat: 20.6464, lon: 106.0511 },
    { name: 'Khánh Hòa', lat: 12.2388, lon: 109.1967 },
    { name: 'Kiên Giang', lat: 9.8249, lon: 105.1259 },
    { name: 'Kon Tum', lat: 14.3545, lon: 108.0097 },
    { name: 'Lai Châu', lat: 22.3964, lon: 103.4592 },
    { name: 'Lâm Đồng', lat: 11.5753, lon: 108.1429 },
    { name: 'Lạng Sơn', lat: 21.8537, lon: 106.7615 },
    { name: 'Lào Cai', lat: 22.4809, lon: 103.9753 },
    { name: 'Long An', lat: 10.5354, lon: 106.4113 },
    { name: 'Nam Định', lat: 20.4388, lon: 106.1621 },
    { name: 'Nghệ An', lat: 19.2342, lon: 104.9200 },
    { name: 'Ninh Bình', lat: 20.2506, lon: 105.9745 },
    { name: 'Ninh Thuận', lat: 11.6739, lon: 108.8629 },
    { name: 'Phú Thọ', lat: 21.3989, lon: 105.2289 },
    { name: 'Phú Yên', lat: 13.0882, lon: 109.0929 },
    { name: 'Quảng Bình', lat: 17.4689, lon: 106.5990 },
    { name: 'Quảng Nam', lat: 15.5394, lon: 108.0191 },
    { name: 'Quảng Ngãi', lat: 15.1214, lon: 108.8042 },
    { name: 'Quảng Ninh', lat: 21.0064, lon: 107.2925 },
    { name: 'Quảng Trị', lat: 16.7500, lon: 107.1852 },
    { name: 'Sóc Trăng', lat: 9.6025, lon: 105.9800 },
    { name: 'Sơn La', lat: 21.3256, lon: 103.9188 },
    { name: 'Tây Ninh', lat: 11.3100, lon: 106.0980 },
    { name: 'Thái Bình', lat: 20.4463, lon: 106.3366 },
    { name: 'Thái Nguyên', lat: 21.5944, lon: 105.8412 },
    { name: 'Thanh Hóa', lat: 19.8077, lon: 105.7764 },
    { name: 'Huế', lat: 16.4637, lon: 107.5909 },
    { name: 'Tiền Giang', lat: 10.4493, lon: 106.3421 },
    { name: 'Trà Vinh', lat: 9.8127, lon: 106.2993 },
    { name: 'Tuyên Quang', lat: 21.8236, lon: 105.2180 },
    { name: 'Vĩnh Long', lat: 10.2397, lon: 105.9572 },
    { name: 'Vĩnh Phúc', lat: 21.3609, lon: 105.6047 },
    { name: 'Yên Bái', lat: 21.7051, lon: 104.9056 },
    { name: 'Hương Thủy', lat: 16.3731, lon: 107.6294 },
    { name: 'Huế', lat: 16.4637, lon: 107.5909 },
];

const findNearestProvince = (lat, lon) => {
    if (!lat || !lon) return null;
    let nearest = null;
    let minDist = Infinity;
    for (const p of PROVINCE_COORDS) {
        const d = Math.hypot(lat - p.lat, lon - p.lon);
        if (d < minDist) { minDist = d; nearest = p.name; }
    }
    return nearest;
};

// Lọc ra các giá trị cấp dưới tỉnh (phường, xã, quận, huyện)
const SUB_PROVINCE_PREFIXES = ['Phường', 'Xã', 'Thị trấn', 'Quận', 'Huyện', 'Thị xã'];
const isValidProvince = (province) => {
    if (!province || !province.trim()) return false;
    return !SUB_PROVINCE_PREFIXES.some((prefix) => province.startsWith(prefix));
};

const getProvinceDisplay = (area) => {
    if (isValidProvince(area.province)) return area.province;
    return findNearestProvince(area.latitude, area.longitude) || '—';
};

const FarmingAreaPage = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, areaId: null });

    const fetchAreas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAreas();
            setAreas(response.data);
        } catch (error) {
            console.error('Error fetching farming areas:', error);
            setAreas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    const handleAddSuccess = (newArea) => {
        setAreas((prev) => [newArea, ...prev]);
    };

    const handleEditSuccess = (updatedArea) => {
        setAreas((prev) => prev.map((a) => (a.id === updatedArea.id ? updatedArea : a)));
    };

    const handleDeleteClick = (areaId) => {
        setConfirmDialog({ open: true, areaId });
    };

    const handleConfirmDelete = async () => {
        const { areaId } = confirmDialog;
        if (!areaId) return;
        try {
            await deleteArea(areaId);
            setAreas((prev) => prev.filter((a) => a.id !== areaId));
        } catch (err) {
            console.error('Lỗi khi xóa:', err);
        } finally {
            setConfirmDialog({ open: false, areaId: null });
        }
    };

    return (
        <div className="pt-20 min-h-screen bg-background relative animate-page-enter">
            <AddFarmingAreaModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddSuccess={handleAddSuccess}
            />
            <EditFarmingAreaModal
                isOpen={!!isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                area={isEditModalOpen || null}
                onEditSuccess={handleEditSuccess}
            />

            <ConfirmDialog
                isOpen={confirmDialog.open}
                title="Xóa khu vực canh tác"
                message="Bạn có chắc chắn muốn xóa khu vực này? Hành động này không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ open: false, areaId: null })}
                isDestructive={true}
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
                                        <SkeletonRow cols={5} rows={3} />
                                    ) : areas.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10">
                                                <EmptyState
                                                    icon="eco"
                                                    title="Chưa có khu vực canh tác"
                                                    description="Thêm khu vực đầu tiên để bắt đầu theo dõi."
                                                    action={{
                                                        label: 'Thêm khu vực',
                                                        onClick: () => setIsAddModalOpen(true)
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        areas.map((area) => (
                                            <tr key={area.id} className="hover:bg-surface-container-low/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold whitespace-nowrap">{area.areaName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getProvinceDisplay(area)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant min-w-[200px]">{area.address}</td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant italic min-w-[250px] truncate max-w-xs">{area.description}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] flex items-center justify-center hover:bg-[#00BFFF] hover:text-white transition-all"
                                                            title="Chỉnh sửa"
                                                            onClick={() => setIsEditModalOpen(area)}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            className="w-8 h-8 rounded-lg bg-error-container/50 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all"
                                                            title="Xóa"
                                                            onClick={() => handleDeleteClick(area.id)}
                                                        >
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
