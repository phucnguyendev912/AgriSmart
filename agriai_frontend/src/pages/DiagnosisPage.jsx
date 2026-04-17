import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DiagnosisPage = () => {
    // === STATE ===
    const { accessToken } = useAuth();
    const [cropTypes, setCropTypes] = useState([]);
    const [selectedCropTypeId, setSelectedCropTypeId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [gpsStatus, setGpsStatus] = useState('pending'); // pending | granted | denied
    const [coords, setCoords] = useState({ latitude: null, longitude: null });

    // === FETCH CROP TYPES ===
    useEffect(() => {
        const fetchCropTypes = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/crop-types`, {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
                    withCredentials: true
                });
                setCropTypes(res.data);
                if (res.data.length > 0) setSelectedCropTypeId(res.data[0].id);
            } catch (err) {
                console.error('Lỗi tải danh sách cây trồng:', err);
            }
        };
        fetchCropTypes();
    }, [accessToken]);

    // === REQUEST GPS ===
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    setGpsStatus('granted');
                },
                () => setGpsStatus('denied'),
                { timeout: 10000 }
            );
        } else {
            setGpsStatus('denied');
        }
    }, []);

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

    // === HANDLE DIAGNOSE ===
    const handleDiagnose = async () => {
        if (!selectedFile) { setError('Vui lòng chọn ảnh trước.'); return; }
        if (!selectedCropTypeId) { setError('Vui lòng chọn loại cây trồng.'); return; }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('cropTypeId', selectedCropTypeId);
        if (coords.latitude) formData.append('latitude', coords.latitude);
        if (coords.longitude) formData.append('longitude', coords.longitude);

        try {
            const res = await axios.post(`${API_URL}/api/diagnosis`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
                },
                withCredentials: true
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi chẩn đoán.');
        } finally {
            setLoading(false);
        }
    };

    // === HELPER ===
    const diseases = result?.diseases || [];
    const weather = result?.weather;
    const treatments = result?.treatments || [];
    const warnings = result?.warnings || [];

    const getSeverityClasses = (severity) => {
        if (severity === 'NANG') return "bg-error-container text-on-error-container";
        if (severity === 'TRUNG_BINH') return "bg-secondary-container text-on-secondary-container";
        return "bg-primary-container text-on-primary-container";
    };
    const getSeverityLabel = (severity) => {
        if (severity === 'NANG') return 'Nặng';
        if (severity === 'TRUNG_BINH') return 'Trung bình';
        if (severity === 'NHE') return 'Nhẹ';
        return severity || 'N/A';
    };

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
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
                                onChange={(e) => setSelectedCropTypeId(Number(e.target.value))}
                            >
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
                        {gpsStatus === 'denied' && (
                            <div className="hidden md:flex items-center gap-1 text-xs text-on-surface-variant font-bold">
                                <span className="material-symbols-outlined text-sm">location_off</span> GPS tắt
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Upload & Preview */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                            <div className="relative group overflow-hidden rounded-lg bg-surface-container lg:min-h-0 h-64 flex items-center justify-center">
                                {previewUrl ? (
                                    <img alt="Xem trước" className="w-full h-full object-cover" src={previewUrl} />
                                ) : (
                                    <div className="text-center text-on-surface-variant p-8">
                                        <span className="material-symbols-outlined text-5xl mb-2 block">add_photo_alternate</span>
                                        <p className="text-sm font-medium">Chọn ảnh hoặc chụp ảnh cây trồng</p>
                                    </div>
                                )}
                                {previewUrl && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-white/70 uppercase">Tệp phân tích:</p>
                                            <p className="text-sm font-bold text-white truncate">{selectedFile?.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-3 mt-4">
                                <label className="w-full py-3 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                                    <span className="material-symbols-outlined text-xl">file_upload</span> Chọn ảnh từ thiết bị
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            {/* Diagnose Button */}
                            <button
                                onClick={handleDiagnose}
                                disabled={loading || !selectedFile}
                                className={`w-full py-3 mt-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${loading || !selectedFile
                                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                                    : 'bg-tertiary text-on-tertiary hover:opacity-90'}`}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span> Đang chẩn đoán...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">biotech</span> Chẩn đoán ngay
                                    </>
                                )}
                            </button>
                            {error && (
                                <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">{error}</div>
                            )}
                        </div>
                    </div>

                    {/* Detection, Environment & Warnings */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Environment Info Grid */}
                        {weather && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-highest flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl">thermostat</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Nhiệt độ</p>
                                        <p className="text-xl font-bold text-on-surface">{weather.temperature != null ? `${Math.round(weather.temperature)}°C` : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-highest flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl">humidity_high</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Độ ẩm</p>
                                        <p className="text-xl font-bold text-on-surface">{weather.humidity != null ? `${Math.round(weather.humidity)}%` : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-highest flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl">rainy</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">Lượng mưa</p>
                                        <p className="text-xl font-bold text-on-surface">{weather.rainfall != null ? `${weather.rainfall}mm` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detection Results List */}
                        {result && (
                            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container-highest flex-grow">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-sm font-black text-on-surface uppercase tracking-wider flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl">biotech</span>
                                        Kết quả phát hiện ({diseases.length})
                                    </h3>
                                </div>
                                {diseases.length === 0 ? (
                                    result.isHealthy ? (
                                        <div className="text-center py-8">
                                            <span className="material-symbols-outlined text-5xl text-emerald-500 mb-2 block">eco</span>
                                            <p className="text-lg font-bold text-emerald-600">Cây khỏe mạnh!</p>
                                            <p className="text-sm text-on-surface-variant mt-1">Không có dấu hiệu tổn thương trên ảnh.</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <span className="material-symbols-outlined text-5xl text-slate-400 mb-2 block">search_off</span>
                                            <p className="text-lg font-bold text-slate-600">Không phát hiện bệnh</p>
                                            <p className="text-sm text-on-surface-variant mt-1">Vui lòng thử lại với một bức ảnh rõ nét hơn.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {diseases.map((disease, idx) => (
                                            <div key={idx} className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-black text-on-surface text-sm">{disease.diseaseName}</h4>
                                                        <span className={`${getSeverityClasses(disease.severity)} text-[8px] px-1.5 py-0.5 rounded font-black uppercase`}>
                                                            Mức độ: {getSeverityLabel(disease.severity)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xl font-black text-primary">{disease.confidence != null ? `${Math.round(disease.confidence * 100)}%` : 'N/A'}</span>
                                                </div>
                                                {disease.confidence != null && (
                                                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${disease.confidence * 100}%` }}></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Warnings */}
                                        {warnings.length > 0 && (
                                            <div className="col-span-1 md:col-span-2 p-4 bg-error/5 border border-error/20 rounded-xl flex gap-3 items-start">
                                                <span className="material-symbols-outlined text-error shrink-0">warning</span>
                                                <div className="flex-grow">
                                                    <p className="text-sm font-bold text-error">Cảnh báo</p>
                                                    {warnings.map((w, i) => (
                                                        <p key={i} className="text-xs text-on-surface-variant mt-1">{w}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Placeholder before diagnosis */}
                        {!result && !loading && (
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-highest flex-grow flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">search</span>
                                <p className="text-sm font-bold text-on-surface-variant">Chọn ảnh và nhấn "Chẩn đoán ngay" để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Treatment Section - Only show when we have actual results with diseases */}
                {result && treatments.length > 0 && (
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container-highest">
                        <div className="px-6 py-4 border-b border-surface-container-highest bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <span className="text-xl">🔬</span> {diseases.length === 1 ? "Phác đồ xử lý chi tiết" : "Phác đồ kết hợp"}
                            </h3>
                            <div className="flex items-center gap-3">
                                {diseases.length >= 2 && (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase flex items-center gap-1">⚠️ {diseases.length} BỆNH</span>
                                )}
                                <span className="bg-error-container text-on-error-container text-[10px] px-2.5 py-1 rounded-full font-black uppercase">ƯU TIÊN XỬ LÝ</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Weather badges */}
                            {weather && (
                                <div className="flex flex-wrap gap-2">
                                    {weather.temperature != null && (
                                        <div className="px-3 py-1.5 bg-tertiary/5 border border-tertiary/10 rounded-lg flex items-center gap-2">
                                            <span className="text-xs font-bold text-on-surface">{Math.round(weather.temperature)}°C</span>
                                            <span className="text-[10px] font-medium text-on-surface-variant uppercase border-l border-outline-variant/50 pl-2">Nhiệt độ</span>
                                        </div>
                                    )}
                                    {weather.humidity != null && (
                                        <div className="px-3 py-1.5 bg-tertiary/5 border border-tertiary/10 rounded-lg flex items-center gap-2">
                                            <span className="text-xs font-bold text-on-surface">{Math.round(weather.humidity)}%</span>
                                            <span className="text-[10px] font-medium text-on-surface-variant uppercase border-l border-outline-variant/50 pl-2">Độ ẩm</span>
                                        </div>
                                    )}
                                    {weather.rainfall != null && (
                                        <div className="px-3 py-1.5 bg-tertiary/5 border border-tertiary/10 rounded-lg flex items-center gap-2">
                                            <span className="text-xs font-bold text-on-surface">{weather.rainfall}mm</span>
                                            <span className="text-[10px] font-medium text-on-surface-variant uppercase border-l border-outline-variant/50 pl-2">Lượng mưa</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Medicine Cards */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
                                <div className="px-5 py-3 bg-surface-container-low border-b border-surface-container-highest">
                                    <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                        {diseases.length === 1 ? "THUỐC ĐẶC TRỊ ĐỀ XUẤT" : "THUỐC PHA CHUNG (BÌNH 16 LÍT)"}
                                    </h4>
                                </div>
                                <div className="divide-y divide-surface-container-highest">
                                    {treatments.map((t, idx) => (
                                        <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-on-surface text-lg">{t.drugName || t.treatmentName}</span>
                                                {t.diseaseName && <span className="text-xs text-slate-400 font-medium">({t.diseaseName})</span>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {t.dosage && <span className="text-[#2E7D32] font-black text-lg">{t.dosage}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {treatments[0]?.frequency && (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-surface-container-highest flex flex-col">
                                        <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">⏱ TẦN SUẤT</p>
                                        <p className="text-sm font-bold text-on-surface">{treatments[0].frequency}</p>
                                    </div>
                                )}
                                {treatments[0]?.applicationTime && (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-surface-container-highest flex flex-col">
                                        <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">🌅 THỜI ĐIỂM</p>
                                        <p className="text-sm font-bold text-on-surface">{treatments[0].applicationTime}</p>
                                    </div>
                                )}
                                {treatments[0]?.safetyNotes && (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-surface-container-highest flex flex-col">
                                        <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">⚠️ LƯU Ý</p>
                                        <p className="text-sm font-bold text-on-surface">{treatments[0].safetyNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cultivation & Guidance - only with results */}
                {result && (result.userGuidance || (result.cultivationMeasures && result.cultivationMeasures.length > 0) || (result.warnings && result.warnings.length > 0)) && (
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container-highest shadow-sm mb-20 md:mb-0">
                        <div className="space-y-4">
                            <h4 className="font-black text-on-surface flex items-center gap-2 text-xs uppercase tracking-widest border-l-4 border-[#2E7D32] pl-3">
                                BIỆN PHÁP CANH TÁC & CẢNH BÁO
                            </h4>
                            
                            {result.warnings && result.warnings.length > 0 && (
                                <ul className="space-y-3 mb-4">
                                    {result.warnings.map((w, i) => (
                                        <li key={`warning-${i}`} className="flex gap-3 items-start text-sm leading-relaxed text-error font-medium">
                                            <span className="material-symbols-outlined text-[18px] mt-0.5">warning</span>
                                            <span>{w}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {result.cultivationMeasures && result.cultivationMeasures.length > 0 && (
                                <ul className="space-y-4">
                                    {result.cultivationMeasures.map((m, i) => (
                                        <li key={`measure-${i}`} className="flex gap-3 items-start text-sm leading-relaxed text-on-surface">
                                            <span className="material-symbols-outlined text-[#2E7D32] text-[18px] mt-0.5">check_circle</span>
                                            <span>{m}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {result.userGuidance && (
                                <div className="p-4 mt-2 bg-surface-container rounded-xl border border-surface-container-highest relative">
                                    <span className="material-symbols-outlined absolute -top-3 -left-3 bg-white dark:bg-slate-800 text-primary p-1 rounded-full border border-surface-container-highest shadow-sm">lightbulb</span>
                                    <p className="text-sm leading-relaxed text-on-surface-variant italic">
                                        "{result.userGuidance}"
                                    </p>
                                </div>
                            )}

                            {(!result.cultivationMeasures || result.cultivationMeasures.length === 0) && (!result.userGuidance) && (!result.warnings || result.warnings.length === 0) && (
                                <p className="text-sm text-on-surface-variant italic">Chưa có biện pháp canh tác cụ thể.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
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

            {/* Floating Action Button */}
            <div className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50">
                <button className="w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group">
                    <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">Chat với AgriBot</span>
                </button>
            </div>
        </div>
    );
};

export default DiagnosisPage;
