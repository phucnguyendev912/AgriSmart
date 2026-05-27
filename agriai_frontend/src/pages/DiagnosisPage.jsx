import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import { useLocationPermission } from '../context/LocationPermissionContext';
import { getCropTypes, submitDiagnosis } from '../services/diagnosisService';

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

/**
 * Returns a list of cultivation measures based on the diagnosis result.
 * @param {Object} result - The diagnosis result from the backend.
 * @returns {string[]} Array of recommendation strings.
 */
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

/**
 * DiagnosisPage Component
 * Handles new crop disease diagnosis requests. Users upload leaf photos,
 * select crop type, and receive AI classification, local weather context,
 * spray program schedule, and rating options.
 */
const DiagnosisPage = () => {
    // === AUTH & LOCATION ===
    const { user } = useAuth();
    const { gpsStatus, coords, requestLocation } = useLocationPermission();

    // === DIAGNOSIS STATE ===
    const [cropTypes, setCropTypes] = useState([]);
    const [selectedCropTypeId, setSelectedCropTypeId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // === LOCAL LOCATION STATE FOR DIAGNOSIS ===
    const [diagnosisCoords, setDiagnosisCoords] = useState({ latitude: null, longitude: null, accuracy: null, timestamp: null });
    const [checkingLocation, setCheckingLocation] = useState(true);
    const locationPromiseRef = useRef(null);

    // === RATING STATE ===
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Fetch crop types on component mount
    useEffect(() => {
        const fetchCropTypes = async () => {
            try {
                const res = await getCropTypes();
                setCropTypes(res.data);
            } catch (err) {
                console.error('Failed to load crop types:', err);
            }
        };
        fetchCropTypes();
    }, []);

    // Fetch fresh GPS coordinates
    const fetchFreshLocation = useCallback(async () => {
        setCheckingLocation(true);

        const promise = requestLocation({
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
        });
        locationPromiseRef.current = promise;

        try {
            const res = await promise;
            if (res.ok && res.coords) {
                setDiagnosisCoords({
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude,
                    accuracy: res.coords.accuracy,
                    timestamp: res.coords.timestamp,
                });
            } else {
                setDiagnosisCoords({ latitude: null, longitude: null, accuracy: null, timestamp: null });
            }
        } catch (err) {
            console.error('Lỗi khi lấy vị trí định vị:', err);
            setDiagnosisCoords({ latitude: null, longitude: null, accuracy: null, timestamp: null });
        } finally {
            setCheckingLocation(false);
        }
    }, [requestLocation]);

    // Check location permission and fetch fresh GPS coordinates on component mount
    useEffect(() => {
        fetchFreshLocation();
    }, [fetchFreshLocation]);

    // Sync with global GPS status changes (e.g. user toggles settings in browser)
    useEffect(() => {
        if (gpsStatus === 'denied' || gpsStatus === 'unsupported') {
            setDiagnosisCoords({ latitude: null, longitude: null, accuracy: null, timestamp: null });
            setCheckingLocation(false);
        } else if (gpsStatus === 'granted') {
            if (coords.latitude && coords.longitude) {
                setDiagnosisCoords({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    timestamp: coords.timestamp,
                });
                setCheckingLocation(false);
            } else {
                fetchFreshLocation();
            }
        }
    }, [gpsStatus, coords, fetchFreshLocation]);

    // Handle image file selection and generate preview URL
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    // Submit image, crop type ID, and location for AI diagnosis
    const submitDiagnose = async () => {
        if (!selectedFile) { setError('Vui lòng chọn ảnh trước.'); return; }
        if (!selectedCropTypeId) { setError('Vui lòng chọn loại cây trồng trước khi chẩn đoán'); return; }

        setLoading(true);
        setError('');
        setResult(null);

        let finalCoords = diagnosisCoords;

        // If location is currently checking, wait for the request to resolve/timeout
        if (checkingLocation && locationPromiseRef.current) {
            try {
                const res = await locationPromiseRef.current;
                if (res.ok && res.coords) {
                    finalCoords = {
                        latitude: res.coords.latitude,
                        longitude: res.coords.longitude,
                        accuracy: res.coords.accuracy,
                        timestamp: res.coords.timestamp,
                    };
                    setDiagnosisCoords(finalCoords);
                }
            } catch (err) {
                console.error('Lỗi khi chờ GPS:', err);
            }
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('cropTypeId', selectedCropTypeId);
        if (finalCoords.latitude !== null && finalCoords.latitude !== undefined) {
            formData.append('latitude', finalCoords.latitude);
        }
        if (finalCoords.longitude !== null && finalCoords.longitude !== undefined) {
            formData.append('longitude', finalCoords.longitude);
        }

        try {
            const res = await submitDiagnosis(formData);
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

    const handleDiagnose = async () => {
        await submitDiagnose();
    };

    const handleOpenRating = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá kết quả.');
            return;
        }
        if (!result?.id) {
            toast.info('Vui lòng chờ kết quả được lưu xong trước khi đánh giá.');
            return;
        }
        setIsRatingModalOpen(true);
    };

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
                        checkingLocation={checkingLocation}
                        hasLocation={Boolean(diagnosisCoords.latitude && diagnosisCoords.longitude)}
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
                            <DiagnoseSprayProgramsPanel
                                sprayPrograms={result.sprayPrograms}
                                treatments={result.treatments}
                            />
                            <DiagnoseInteractionWarnings interactionWarnings={result.interactionWarnings} />
                            <DiagnoseCultivationMeasures measures={getDiagnosisCultivationMeasures(result)} />

                            {/* Rating Button */}
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleOpenRating}
                                    className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all"
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
