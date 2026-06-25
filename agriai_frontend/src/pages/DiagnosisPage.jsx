import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SEO from '../components/common/SEO';
import { useLocationPermission } from '../context/LocationPermissionContext';
import { getCropTypes, submitDiagnosis } from '../services/diagnosisService';
import { fileToBase64 } from '../utils/helpers';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

import {
    DiagnoseUploadPanel,
    DiagnoseWeatherCards,
    DiagnoseResultPanel,
    DiagnoseSprayProgramsPanel,
    DiagnoseInteractionWarnings,
    DiagnoseCultivationMeasures,
    DiagnoseAIGuidance,
    DiagnosisRatingModal,
    getCultivationMeasures as getDiagnosisCultivationMeasures
} from '../features/diagnosis';

// ─── LocalStorage keys ─────────────────────────────────────────────────────────
const LS_RESULT_KEY = 'agrismart_last_diagnosis_result';
const LS_INPUT_KEY = 'agrismart_last_diagnosis_input';

// ─── Module-level variable: giữ tham chiếu Promise chẩn đoán đang chạy ngầm ───
// Tồn tại suốt vòng đời SPA, không bị mất khi component unmount.
let activeDiagnosisPromise = null;
let activeAbortController = null;

// ─── Helper: Lưu kết quả và input vào LocalStorage ────────────────────────────
function saveResultToLS(result, inputData) {
    try {
        localStorage.setItem(LS_RESULT_KEY, JSON.stringify(result));
    } catch (e) {
        console.warn('[Diagnosis] Không thể lưu kết quả vào LocalStorage:', e);
    }
    if (inputData) {
        try {
            localStorage.setItem(LS_INPUT_KEY, JSON.stringify(inputData));
        } catch (e) {
            // Ảnh quá lớn — bỏ qua, kết quả vẫn đã lưu
            console.warn('[Diagnosis] Ảnh quá lớn, không lưu được ảnh vào LocalStorage:', e);
        }
    }
}

// ─── Helper: Xóa kết quả khỏi LocalStorage ────────────────────────────────────
function clearResultFromLS() {
    localStorage.removeItem(LS_RESULT_KEY);
    localStorage.removeItem(LS_INPUT_KEY);
}

// ─── Helper: Đọc kết quả từ LocalStorage ──────────────────────────────────────
function readResultFromLS() {
    try {
        const resultStr = localStorage.getItem(LS_RESULT_KEY);
        const inputStr = localStorage.getItem(LS_INPUT_KEY);
        if (!resultStr) return null;
        return {
            result: JSON.parse(resultStr),
            input: inputStr ? JSON.parse(inputStr) : null,
        };
    } catch (e) {
        return null;
    }
}

const DiagnosisPage = () => {
    const { user } = useAuth();
    const { gpsStatus, coords, requestLocation } = useLocationPermission();

    const [cropTypes, setCropTypes] = useState([]);
    const [selectedCropTypeId, setSelectedCropTypeId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewBase64, setPreviewBase64] = useState(null); // Base64 lưu sẵn để bảo vệ khi rời trang
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);

    const [diagnosisCoords, setDiagnosisCoords] = useState({ latitude: null, longitude: null, accuracy: null, timestamp: null });
    const [checkingLocation, setCheckingLocation] = useState(true);
    const locationPromiseRef = useRef(null);

    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Flag: người dùng đã chọn rời trang (để callback chạy ngầm biết cần lưu LS)
    const userHasLeftRef = useRef(false);

    // ─── useBlocker: chặn điều hướng nội bộ khi đang chẩn đoán ─────────────────
    const blocker = useBlocker(
        useCallback(({ currentLocation, nextLocation }) => {
            return loading && currentLocation.pathname !== nextLocation.pathname;
        }, [loading])
    );

    // ─── beforeunload: cảnh báo khi F5 / đóng tab ───────────────────────────────
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (loading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [loading]);

    // ─── Khôi phục kết quả hoặc lắng nghe Promise ngầm khi mount ────────────────
    useEffect(() => {
        // Ưu tiên 1: Có kết quả lưu sẵn trong LocalStorage
        const saved = readResultFromLS();
        if (saved) {
            setResult(saved.result);
            if (saved.input?.previewBase64) {
                setPreviewUrl(saved.input.previewBase64);
            }
            if (saved.input?.selectedCropTypeId) {
                setSelectedCropTypeId(saved.input.selectedCropTypeId);
            }
            return;
        }

        // Ưu tiên 2: Có request chạy ngầm, lắng nghe tiếp
        if (activeDiagnosisPromise) {
            setLoading(true);
            activeDiagnosisPromise
                .then((res) => {
                    setResult(res.data);
                    clearResultFromLS();
                    activeDiagnosisPromise = null;
                    activeAbortController = null;
                })
                .catch((err) => {
                    if (axios.isCancel(err)) {
                        console.log('Diagnosis request cancelled');
                    }
                    activeDiagnosisPromise = null;
                    activeAbortController = null;
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Click outside dropdown ──────────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ─── Tải danh sách loại cây ──────────────────────────────────────────────────
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

    // ─── Optimistic progress bar ─────────────────────────────────────────────────
    useEffect(() => {
        let interval;
        if (loading) {
            setProgress(0);
            const totalDuration = 9000;
            const updateInterval = 50;
            const targetProgress = 85;
            const incrementPerUpdate = targetProgress / (totalDuration / updateInterval);

            interval = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + incrementPerUpdate;
                    if (next >= targetProgress) {
                        clearInterval(interval);
                        return targetProgress;
                    }
                    return next;
                });
            }, updateInterval);
        } else {
            setProgress(0);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading]);

    // ─── Lấy vị trí GPS ─────────────────────────────────────────────────────────
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

    useEffect(() => {
        fetchFreshLocation();
    }, [fetchFreshLocation]);

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

    // ─── Xử lý chọn file ────────────────────────────────────────────
    const handleFileChange = async (e) => {
        let file = e.target.files[0];
        if (file) {
            setIsCompressing(true);
            try {
                // Kiểm tra nếu là HEIC thì convert sang JPEG
                if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    });
                    
                    // heic2any có thể trả về mảng Blob nếu có nhiều frame, lấy frame đầu
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    
                    file = new File([blob], file.name.replace(/\.heic$/i, '.jpeg'), {
                        type: 'image/jpeg'
                    });
                }
                
                // Nén ảnh xuống dưới 1MB
                const options = {
                    maxSizeMB: 0.8, // 800KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                file = await imageCompression(file, options);
            } catch (error) {
                console.error('[Diagnosis] Lỗi xử lý ảnh (heic2any hoặc compression):', error);
                // Nếu lỗi, vẫn dùng file gốc để tránh block user (backend sẽ validate sau)
            } finally {
                setIsCompressing(false);
            }

            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setResult(null);
            setError('');
            clearResultFromLS();

            // Chuyển ảnh sang Base64 ngay lập tức để sẵn sàng khi cần lưu LocalStorage
            try {
                const base64 = await fileToBase64(file);
                setPreviewBase64(base64);
            } catch (e) {
                console.warn('[Diagnosis] Không thể chuyển ảnh sang Base64:', e);
                setPreviewBase64(null);
            }
        }
    };

    // ─── Gửi chẩn đoán ──────────────────────────────────────────────────────────
    const submitDiagnose = async (overrideFile) => {
        const fileToUse = overrideFile || selectedFile;
        if (!fileToUse) { setError('Vui lòng chọn ảnh trước.'); return; }
        if (!selectedCropTypeId) { setError('Vui lòng chọn loại cây trồng trước khi chẩn đoán'); return; }

        setLoading(true);
        setError('');
        setResult(null);
        userHasLeftRef.current = false;

        let finalCoords = diagnosisCoords;

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
        formData.append('image', fileToUse);
        formData.append('cropTypeId', selectedCropTypeId);
        if (finalCoords.latitude !== null && finalCoords.latitude !== undefined) {
            formData.append('latitude', finalCoords.latitude);
        }
        if (finalCoords.longitude !== null && finalCoords.longitude !== undefined) {
            formData.append('longitude', finalCoords.longitude);
        }

        if (activeAbortController) {
            activeAbortController.abort();
        }
        const controller = new AbortController();
        activeAbortController = controller;

        // Lưu Promise vào biến module-level để giữ tham chiếu ngay cả khi component unmount
        const diagnosisPromise = submitDiagnosis(formData, controller.signal);
        activeDiagnosisPromise = diagnosisPromise;

        // Gắn callback lưu kết quả vào LocalStorage khi chạy ngầm xong
        diagnosisPromise
            .then((res) => {
                if (activeDiagnosisPromise !== diagnosisPromise) return; // ignore stale response
                if (userHasLeftRef.current) {
                    // Người dùng đã rời trang → lưu kết quả vào LocalStorage
                    const inputData = {
                        selectedCropTypeId,
                        previewBase64: previewBase64 || null,
                    };
                    saveResultToLS(res.data, inputData);
                } else {
                    // Người dùng vẫn đang xem trang → hiển thị trực tiếp
                    setResult(res.data);
                    clearResultFromLS();
                    if (!user) {
                        toast.info('Vui lòng đăng nhập để có thể xem lại kết quả chẩn đoán.');
                    }
                }
            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    console.log('Diagnosis request cancelled');
                    return;
                }
                if (activeDiagnosisPromise !== diagnosisPromise) return; // ignore stale response
                if (!userHasLeftRef.current) {
                    const message = err.response?.data?.message;
                    setError(err.response?.status >= 500
                        ? 'Có lỗi xảy ra, vui lòng thử lại sau'
                        : (message || 'Có lỗi xảy ra, vui lòng thử lại sau'));
                }
            })
            .finally(() => {
                if (activeDiagnosisPromise === diagnosisPromise) {
                    if (!userHasLeftRef.current) {
                        setLoading(false);
                    }
                    activeDiagnosisPromise = null;
                    activeAbortController = null;
                }
            });
    };

    const handleDiagnose = async () => {
        await submitDiagnose();
    };

    // ─── Xử lý Modal xác nhận rời trang ─────────────────────────────────────────
    const handleConfirmLeave = () => {
        userHasLeftRef.current = true;
        blocker.proceed();
    };

    const handleCancelLeave = () => {
        blocker.reset();
        // Người dùng ở lại → xóa LocalStorage phòng có dữ liệu cũ
        clearResultFromLS();
    };

    // ─── Hủy chẩn đoán / Chẩn đoán mới ─────────────────────────────────────────
    const handleReset = () => {
        if (activeAbortController) {
            activeAbortController.abort();
            activeAbortController = null;
        }
        setResult(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setPreviewBase64(null);
        setError('');
        setLoading(false);
        setProgress(0);
        clearResultFromLS();
        activeDiagnosisPromise = null;
        userHasLeftRef.current = false;
    };

    // ─── Rating ──────────────────────────────────────────────────────────────────
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

    // Kết quả được phục hồi từ LocalStorage (không phải từ lần chẩn đoán mới nhất trong session này)
    const isRestoredResult = result !== null && !loading && !selectedFile;

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
            <SEO
                title="Chẩn đoán bệnh cây trồng"
                description="Sử dụng AI tiên tiến để chẩn đoán bệnh cây trồng tức thì. Tải ảnh lá cây trồng và nhận kết quả phân tích cùng phác đồ điều trị."
                keywords="chẩn đoán bệnh cây trồng, phát hiện bệnh cây, AI phân tích lá cây, bệnh lúa, bệnh cà phê"
                url="/diagnosis"
            />
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-page-enter">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Chẩn đoán bệnh</h1>
                        <p className="text-on-surface-variant mt-2 text-base md:text-lg">Sử dụng AI tiên tiến để bảo vệ mùa màng.</p>
                    </div>
                    <div className="flex items-center gap-4" ref={dropdownRef}>
                        <div className="relative bg-surface-container-lowest p-1.5 rounded-xl shadow-sm border border-surface-container-highest flex items-center w-full md:w-auto select-none">
                            <span className="material-symbols-outlined text-primary text-xl pl-3 pr-1">grass</span>
                            <label className="text-xs font-bold text-on-surface-variant tracking-widest uppercase whitespace-nowrap">Loại cây:</label>

                            <div className="relative flex-grow md:flex-grow-0 min-w-[140px]">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center justify-between bg-transparent border-none text-primary font-black px-2 py-1.5 w-full cursor-pointer outline-none text-sm gap-2"
                                >
                                    <span className="truncate">
                                        {cropTypes.find(ct => ct.id === selectedCropTypeId)?.cropName || 'Chọn loại cây...'}
                                    </span>
                                    <span className={`material-symbols-outlined text-primary text-xl transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute left-0 right-0 md:left-auto md:right-0 mt-2.5 z-50 bg-surface-container-lowest border border-surface-container-highest shadow-xl rounded-2xl overflow-hidden min-w-[180px] py-1.5 animate-fade-in-down">
                                        {cropTypes.map(ct => (
                                            <button
                                                key={ct.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCropTypeId(ct.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 hover:bg-primary/5 active:scale-[0.98] ${
                                                    selectedCropTypeId === ct.id
                                                        ? 'text-primary font-extrabold bg-primary/10'
                                                        : 'text-on-surface hover:text-primary font-medium'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-transform ${selectedCropTypeId === ct.id ? 'scale-100' : 'scale-0'}`} />
                                                {ct.cropName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner: Kết quả được phục hồi */}
                {isRestoredResult && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleReset}
                            className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-all border border-primary/10 shadow-sm active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            Chẩn đoán mới
                        </button>
                    </div>
                )}

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
                        isCompressing={isCompressing}
                        selectedFile={selectedFile}
                        previewUrl={previewUrl}
                        error={error}
                        checkingLocation={checkingLocation}
                        hasLocation={Boolean(diagnosisCoords.latitude && diagnosisCoords.longitude)}
                    />

                    {/* Right side: Weather + Results */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <DiagnoseWeatherCards weather={result?.weather} />

                        <DiagnoseResultPanel key={result?.id || 'empty-result'} result={result} />

                        {/* Placeholder */}
                        {!result && !loading && (
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-highest flex-grow flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">search</span>
                                <p className="text-sm font-bold text-on-surface-variant">Chọn ảnh và nhấn "Chẩn đoán ngay" để bắt đầu</p>
                            </div>
                        )}

                        {/* Loading Progress */}
                        {!result && loading && (
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-highest flex-grow flex flex-col items-center justify-center text-center">
                                <div className="w-full max-w-md flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                                        <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ animationDuration: '2s' }}>
                                            biotech
                                        </span>
                                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
                                    </div>

                                    <h3 className="text-lg font-bold text-on-surface mb-2">Đang phân tích hình ảnh...</h3>
                                    <p className="text-sm text-on-surface-variant mb-8 text-center max-w-xs">
                                        AI của AgriSmart đang quét các đặc điểm bệnh lý trên lá cây. Quá trình này có thể mất vài giây.
                                    </p>

                                    <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden shadow-inner relative">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-75 ease-linear relative overflow-hidden"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div
                                                className="absolute inset-0 bg-white/20 w-1/2"
                                                style={{ animation: 'shimmer 2s infinite' }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between w-full mt-2">
                                        <span className="text-xs font-bold text-on-surface-variant">Tiến trình AI</span>
                                        <span className="text-xs font-bold text-primary">{Math.floor(progress)}%</span>
                                    </div>

                                    {/* Nút hủy chẩn đoán */}
                                    <button
                                        onClick={handleReset}
                                        className="mt-6 text-sm font-semibold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-base">cancel</span>
                                        Hủy chẩn đoán
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Section */}
                {result && (
                    <div key={result.id || 'details'} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-page-enter">
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

            {/* ─── Modal xác nhận rời trang ────────────────────────────────────────── */}
            {blocker.state === 'blocked' && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCancelLeave}
                    />
                    {/* Modal */}
                    <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-fade-in-down">
                        {/* Icon */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-on-surface">Chẩn đoán đang chạy</h3>
                                <p className="text-sm text-on-surface-variant">Bạn có chắc muốn rời khỏi trang này?</p>
                            </div>
                        </div>

                        {/* Body */}
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            Tiến trình chẩn đoán vẫn sẽ <span className="font-bold text-on-surface">tiếp tục chạy</span> và kết quả sẽ được <span className="font-bold text-primary">tự động lưu lại</span>. Khi bạn quay lại trang Chẩn đoán, kết quả sẽ hiển thị ngay.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelLeave}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-all"
                            >
                                Ở lại trang
                            </button>
                            <button
                                onClick={handleConfirmLeave}
                                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:brightness-110 active:scale-95 transition-all"
                            >
                                Đồng ý, rời trang
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(250%) skewX(-20deg); }
                }
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.15s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default DiagnosisPage;
