import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DiagnoseWeatherCards from '../features/diagnosis/components/DiagnoseWeatherCards';
import DiagnoseResultPanel from '../features/diagnosis/components/DiagnoseResultPanel';
import DiagnoseSprayProgramsPanel from '../features/diagnosis/components/DiagnoseSprayProgramsPanel';
import DiagnoseInteractionWarnings from '../features/diagnosis/components/DiagnoseInteractionWarnings';
import DiagnoseCultivationMeasures from '../features/diagnosis/components/DiagnoseCultivationMeasures';
import DiagnoseAIGuidance from '../features/diagnosis/components/DiagnoseAIGuidance';
import { getCultivationMeasures } from '../features/diagnosis/utils/diagnosisDisplay';

const API_URL = "";

const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem lịch sử chẩn đoán.';

const DiagnosisHistoryDetailPage = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchDetail = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await axios.get(`${API_URL}/api/diagnosis/${id}`, {
                    withCredentials: true
                });

                if (isActive) {
                    setResult(res.data);
                }
            } catch (err) {
                if (!isActive) return;

                const message = err.response?.status === 401
                    ? SESSION_EXPIRED_MESSAGE
                    : err.response?.data?.message || 'Không thể lấy dữ liệu chi tiết lịch sử.';

                setResult(null);
                setError(message);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        if (authLoading) {
            setLoading(true);
            return () => {
                isActive = false;
            };
        }

        if (!user) {
            setResult(null);
            setError(SESSION_EXPIRED_MESSAGE);
            setLoading(false);
            return () => {
                isActive = false;
            };
        }

        fetchDetail();

        return () => {
            isActive = false;
        };
    }, [authLoading, id, user]);

    if (loading) {
        return (
            <div className="pt-24 lg:pt-32 pb-12 px-4 md:px-6 min-h-screen flex justify-center items-center bg-surface-container-low">
                <div className="text-on-surface-variant flex items-center space-x-2 font-bold">
                    <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                    <span>Đang tải dữ liệu chi tiết...</span>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="pt-24 lg:pt-32 pb-12 px-4 md:px-6 min-h-screen flex justify-center items-center bg-surface-container-low">
                <div className="bg-error/10 text-error p-8 rounded-2xl border border-error/20 flex flex-col items-center text-center max-w-md">
                    <span className="material-symbols-outlined text-5xl mb-3">error</span>
                    <p className="font-bold text-lg">{error || 'Không tìm thấy dữ liệu.'}</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {!user && (
                            <Link to="/login" className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">
                                Đăng nhập
                            </Link>
                        )}
                        <Link to="/history" className="px-6 py-2 bg-surface-container-lowest text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors">
                            Quay lại lịch sử
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 min-h-screen bg-surface-container-low relative">
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                <div className="flex flex-col gap-4">
                    <Link to="/history" className="inline-flex items-center text-primary text-sm font-bold hover:underline gap-1 self-start">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Quay lại lịch sử
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Chi tiết chẩn đoán</h2>
                            <p className="text-on-surface-variant mt-2 text-base md:text-lg">
                                Xem lại kết quả và phác đồ điều trị cho mẫu vật #{id}.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                            <div className="relative group overflow-hidden rounded-lg bg-surface-container h-80 flex items-center justify-center">
                                <img
                                    alt="Ảnh mẫu chẩn đoán"
                                    className="w-full h-full object-cover"
                                    src={result.originalImageUrl || 'https://placehold.co/400x400?text=No+Image'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <DiagnoseWeatherCards weather={result.weather} />
                        <DiagnoseResultPanel result={result} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
                    <div className="lg:col-span-8 space-y-6">
                        <DiagnoseSprayProgramsPanel
                            sprayPrograms={result.sprayPrograms}
                            treatments={result.treatments}
                        />
                        <DiagnoseInteractionWarnings interactionWarnings={result.interactionWarnings} />
                        <DiagnoseCultivationMeasures measures={getCultivationMeasures(result)} />
                    </div>

                    <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
                        <DiagnoseAIGuidance guidance={result.userGuidance} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DiagnosisHistoryDetailPage;
