import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/common/SEO';
import DiagnoseWeatherCards from '../features/diagnosis/components/DiagnoseWeatherCards';
import DiagnoseResultPanel from '../features/diagnosis/components/DiagnoseResultPanel';
import DiagnoseSprayProgramsPanel from '../features/diagnosis/components/DiagnoseSprayProgramsPanel';
import DiagnoseInteractionWarnings from '../features/diagnosis/components/DiagnoseInteractionWarnings';
import DiagnoseWeatherAlertsPanel from '../features/diagnosis/components/DiagnoseWeatherAlertsPanel';
import DiagnoseCultivationMeasures from '../features/diagnosis/components/DiagnoseCultivationMeasures';
import DiagnoseAIGuidance from '../features/diagnosis/components/DiagnoseAIGuidance';
import { getCultivationMeasures } from '../features/diagnosis/utils/diagnosisDisplay';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const DiagnosisHistoryDetailPage = () => {
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`${API_URL}/api/diagnosis/${id}`, {
                    withCredentials: true
                });
                setResult(response.data);
            } catch (err) {
                setResult(null);
                setError(err.response?.status === 401 || err.response?.status === 404
                    ? 'Không tìm thấy lịch sử chẩn đoán hoặc bạn chưa đăng nhập.'
                    : 'Không thể tải chi tiết chẩn đoán. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low">
            <SEO
                title="Chi tiết lịch sử chẩn đoán"
                description="Xem lại chi tiết kết quả chẩn đoán bệnh cây trồng."
                keywords="chi tiết chẩn đoán, lịch sử chẩn đoán, AgriAI"
                url={`/history/${id}`}
            />

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <Link to="/history" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1 mb-3">
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            Quay lại lịch sử
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Chi tiết chẩn đoán</h1>
                        <p className="text-on-surface-variant mt-2">Kết quả đã lưu từ lần chẩn đoán trước.</p>
                    </div>

                </div>

                {loading && (
                    <div className="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant font-medium border border-surface-container-highest">
                        Đang tải chi tiết chẩn đoán...
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-error/10 border border-error/20 rounded-xl p-4 text-error text-sm font-medium">
                        {error}
                    </div>
                )}

                {!loading && result && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                            <div className="lg:col-span-5">
                                <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                                    <div className="overflow-hidden rounded-lg bg-surface-container h-72 flex items-center justify-center">
                                        {result.originalImageUrl ? (
                                            <img src={result.originalImageUrl} alt="Ảnh chẩn đoán" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-on-surface-variant">
                                                <span className="material-symbols-outlined text-5xl block mb-2">image_not_supported</span>
                                                <p className="text-sm font-medium">Không có ảnh</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <DiagnoseWeatherCards weather={result.weather} />
                                <DiagnoseResultPanel result={result} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            <div className="lg:col-span-8 space-y-6">
                                <DiagnoseSprayProgramsPanel sprayPrograms={result.sprayPrograms} treatments={result.treatments} />
                                <DiagnoseInteractionWarnings interactionWarnings={result.interactionWarnings} />
                                <DiagnoseWeatherAlertsPanel weatherAlerts={result.weatherAlerts} diseaseWeatherRisks={result.diseaseWeatherRisks} />
                                <DiagnoseCultivationMeasures measures={getCultivationMeasures(result)} />
                            </div>

                            <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
                                <DiagnoseAIGuidance guidance={result.userGuidance} />
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DiagnosisHistoryDetailPage;
