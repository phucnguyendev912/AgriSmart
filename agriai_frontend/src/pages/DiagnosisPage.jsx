import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import { useLocationPermission } from '../context/LocationPermissionContext';

// Diagnosis sub-components
import DiagnoseUploadPanel from '../features/diagnosis/components/DiagnoseUploadPanel';
import DiagnoseWeatherCards from '../features/diagnosis/components/DiagnoseWeatherCards';
import DiagnoseResultPanel from '../features/diagnosis/components/DiagnoseResultPanel';
import DiagnoseSprayProgramsPanel from '../features/diagnosis/components/DiagnoseSprayProgramsPanel';
import DiagnoseInteractionWarnings from '../features/diagnosis/components/DiagnoseInteractionWarnings';
import DiagnoseCultivationMeasures from '../features/diagnosis/components/DiagnoseCultivationMeasures';
import DiagnoseAIGuidance from '../features/diagnosis/components/DiagnoseAIGuidance';
import DiagnosisRatingModal from '../features/diagnosis/components/DiagnosisRatingModal';
import { getCultivationMeasures as getDiagnosisCultivationMeasures } from '../features/diagnosis/utils/diagnosisDisplay';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/** Trả về danh sách biện pháp canh tác từ kết quả chẩn đoán */
// eslint-disable-next-line no-unused-vars
const getCultivationMeasures = (result) => {
    if (!result) return [];
    const { diagnosisType, sprayPrograms } = result;
    const strategy = sprayPrograms && sprayPrograms.length > 0 ? sprayPrograms[0].strategy : '';
    if (diagnosisType === 'HEALTHY') return ['Tiếp tục theo dõi lá và thân 2-3 ngày/lần, giữ ruộng thông thoáng.'];
    if (diagnosisType === 'UNKNOWN') return ['Ảnh chưa đủ rõ để xác định bệnh. Nên chụp gần vùng tổn thương và chụp rõ nét hơn.'];
    if (strategy === 'SEPARATE_SPRAY') return ['Đã tách lịch phun theo từng nhóm hoạt chất để tránh xung đột.'];
    return ['Có thể xử lý trong một đợt phun, nhưng cần đọc kỹ cảnh báo trước khi pha.'];
};

const DiagnosisPage = () => {
    // === STATE ===
    const { user } = useAuth(); // useAuth: lấy thông tin xác thực của người dùng từ Context toàn cục.
    const { coords, gpsStatus, hasCoords, requestLocation } = useLocationPermission();
    const hasRetriedDeniedLocation = useRef(false);
    const [cropTypes, setCropTypes] = useState([]); // useState: lưu danh sách loại cây trồng tải về từ API.
    const [selectedCropTypeId, setSelectedCropTypeId] = useState(''); // useState: lưu ID loại cây người dùng đang chọn.
    const [selectedFile, setSelectedFile] = useState(null); // useState: lưu file ảnh người dùng đã chọn để chẩn đoán.
    const [previewUrl, setPreviewUrl] = useState(null); // useState: lưu URL xem trước ảnh được tạo từ file đã chọn.
    const [loading, setLoading] = useState(false); // useState: trạng thái đang gọi API chẩn đoán.
    const [result, setResult] = useState(null); // useState: lưu kết quả chẩn đoán trả về từ backend.
    const [error, setError] = useState(''); // useState: lưu thông báo lỗi nếu chẩn đoán thất bại.
    // Rating modal state
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false); // useState: kiểm soát hiển thị modal đánh giá kết quả.
    const [showToast, setShowToast] = useState(false); // useState: điều khiển hiển thị thông báo cảm ơn sau khi đánh giá.

    // === FETCH CROP TYPES ===
    // useEffect: tự động tải danh sách loại cây trồng khi component mount.
    useEffect(() => {
        const fetchCropTypes = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/crop-types`, {
                    withCredentials: true
                });
                setCropTypes(res.data);
            } catch (err) {
                console.error('Lỗi tải danh sách cây trồng:', err);
            }
        };
        fetchCropTypes();
    }, []);

    useEffect(() => {
        if (!hasCoords && gpsStatus === 'denied' && !hasRetriedDeniedLocation.current) {
            hasRetriedDeniedLocation.current = true;
            requestLocation();
        }
    }, [gpsStatus, hasCoords, requestLocation]);

    // === HANDLE FILE SELECT ===
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const submitDiagnose = async () => {
        if (!selectedFile) { setError('Vui lòng chọn ảnh trước.'); return; }
        if (!selectedCropTypeId) { setError('Vui lòng chọn loại cây trồng trước khi chẩn đoán'); return; }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('cropTypeId', selectedCropTypeId);
        if (coords.latitude !== null && coords.latitude !== undefined) formData.append('latitude', coords.latitude);
        if (coords.longitude !== null && coords.longitude !== undefined) formData.append('longitude', coords.longitude);

        try {
            const res = await axios.post(`${API_URL}/api/diagnosis`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            setResult(res.data);
            if (!user) {
                toast.info('Vui lòng đăng nhập để có thể xem lại kết quả chẩn đoán sau khi chẩn đoán.');
            }
        } catch (err) {
            const message = err.response?.data?.message;
            setError(err.response?.status >= 500 ? 'Có lỗi xảy ra, vui lòng thử lại sau' : (message || 'Có lỗi xảy ra, vui lòng thử lại sau'));
        } finally {
            setLoading(false);
        }
    };

    // === HANDLE DIAGNOSE ===
    const handleDiagnose = async () => {
        await submitDiagnose();
    };

    // === HANDLE OPEN RATING MODAL ===
    const handleOpenRating = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá kết quả.');
            return;
        }
        setIsRatingModalOpen(true);
    };

    // === HANDLE RATING SUCCESS ===
    const handleRatingSuccess = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
            <SEO
                title="Chẩn đoán bệnh cây trồng"
                description="Sử dụng AI tiên tiến để chẩn đoán bệnh cây trồng tức thì. Tải ảnh lá cây trồng và nhận kết quả phân tích cùng phác đồ điều trị."
                keywords="chẩn đoán bệnh cây trồng, phát hiện bệnh cây, AI phân tích lá cây, bệnh lúa, bệnh cà phê"
                url="/diagnosis"
            />
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Chẩn đoán bệnh</h2>
                        <p className="text-on-surface-variant mt-2 text-base md:text-lg">Sử dụng AI tiên tiến để bảo vệ mùa màng.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-surface-container-highest flex items-center w-full md:w-auto">
                            <label className="px-4 text-xs font-bold text-on-surface-variant tracking-widest uppercase whitespace-nowrap">Loại cây:</label>
                            <select
                                className="bg-transparent border-none focus:ring-0 text-primary font-bold pr-8 w-full md:w-auto"
                                value={selectedCropTypeId}
                                onChange={(e) => setSelectedCropTypeId(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="" disabled hidden></option>
                                {cropTypes.map(ct => (
                                    <option key={ct.id} value={ct.id}>{ct.cropName}</option>
                                ))}
                            </select>
                        </div>
                        {gpsStatus === 'granted' && (
                            <div className="hidden md:flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                <span className="material-symbols-outlined text-sm">location_on</span> GPS bật
                            </div>
                        )}
                        {(gpsStatus === 'denied' || gpsStatus === 'unsupported') && (
                            <div className="hidden md:flex items-center gap-1 text-xs text-on-surface-variant font-bold">
                                <span className="material-symbols-outlined text-sm">location_off</span> GPS tắt
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Upload Panel */}
                    <DiagnoseUploadPanel
                        cropTypes={cropTypes}
                        selectedCropTypeId={selectedCropTypeId}
                        onCropTypeChange={setSelectedCropTypeId}
                        onFileChange={handleFileChange}
                        onDiagnose={handleDiagnose}
                        loading={loading}
                        selectedFile={selectedFile}
                        previewUrl={previewUrl}
                        error={error}
                        gpsStatus={gpsStatus}
                    />

                    {/* Right side: Weather + Results */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <DiagnoseWeatherCards weather={result?.weather} />

                        <DiagnoseResultPanel result={result} />

                        {/* Placeholder */}
                        {!result && !loading && (
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-highest flex-grow flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">search</span>
                                <p className="text-sm font-bold text-on-surface-variant">Chọn ảnh và nhấn "Chẩn đoán ngay" để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Section */}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Technical panels */}
                        <div className="lg:col-span-8 space-y-6">
                            <DiagnoseSprayProgramsPanel sprayPrograms={result.sprayPrograms} treatments={result.treatments} />
                            <DiagnoseInteractionWarnings interactionWarnings={result.interactionWarnings} />
                            <DiagnoseCultivationMeasures measures={getDiagnosisCultivationMeasures(result)} />

                            {/* Rating Button */}
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleOpenRating}
                                    className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-full font-bold shadow-sm flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">rate_review</span>
                                    Đánh giá kết quả chẩn đoán
                                </button>
                            </div>
                        </div>

                        {/* Right: AI Guidance sidebar */}
                        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
                            <DiagnoseAIGuidance guidance={result.userGuidance} />
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation (Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-variant/20 px-6 py-4 flex justify-between items-center z-50">
                <Link to="/farming-areas" className="flex flex-col items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined">grid_view</span>
                    <span className="text-[10px] font-medium">Khu vực</span>
                </Link>
                <Link to="/diagnosis" className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                    <span className="text-[10px] font-bold">Chẩn đoán</span>
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

            {/* Rating Modal */}
            {isRatingModalOpen && result && (
                <DiagnosisRatingModal
                    historyId={result.id}
                    onClose={() => setIsRatingModalOpen(false)}
                    onSuccess={handleRatingSuccess}
                />
            )}

            {/* Toast */}
            {showToast && (
                <div className="fixed top-20 right-6 z-[60] flex items-center gap-3 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-2xl animate-bounce-subtle">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-xs">done</span>
                    </div>
                    <span className="text-sm font-medium pr-2 whitespace-nowrap">Cảm ơn bạn đã đánh giá!</span>
                </div>
            )}
            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default DiagnosisPage;
