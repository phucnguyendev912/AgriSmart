import { useDashboard } from '../features/dashboard/useDashboard';
import DashboardStatCards from '../features/dashboard/DashboardStatCards';
import DiagnosisTrendChart from '../features/dashboard/DiagnosisTrendChart';
import AccuracyTrendChart from '../features/dashboard/AccuracyTrendChart';
import CropDistributionChart from '../features/dashboard/CropDistributionChart';
import TopDiseasesTable from '../features/dashboard/TopDiseasesTable';
import RecentDiagnosisTable from '../features/dashboard/RecentDiagnosisTable';
import LatestReviewsPanel from '../features/dashboard/LatestReviewsPanel';
import DashboardQuickActions from '../features/dashboard/DashboardQuickActions';

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-primary animate-spin text-5xl"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>
          progress_activity
        </span>
        <p className="text-on-surface-variant text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-red-500 text-5xl"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>
          error
        </span>
        <p className="text-on-surface-variant text-sm">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, retry } = useDashboard(30);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-on-surface">Tổng quan hệ thống</h1>
        <p className="text-on-surface-variant mt-1">Dữ liệu 30 ngày gần nhất · Cập nhật theo thời gian thực</p>
      </header>

      {/* Thẻ thống kê */}
      <DashboardStatCards summary={data?.summary} />

      {/* Biểu đồ xu hướng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DiagnosisTrendChart data={data?.diagnosisTrend} />
        <AccuracyTrendChart data={data?.accuracyTrend} />
      </div>

      {/* Biểu đồ cây + Thao tác nhanh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CropDistributionChart data={data?.cropDistribution} />
        </div>
        <DashboardQuickActions />
      </div>

      {/* Bảng bệnh phổ biến + Đánh giá */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <TopDiseasesTable data={data?.topDiseases} />
        </div>
        <LatestReviewsPanel data={data?.latestReviews} />
      </div>

      {/* Bảng hoạt động gần đây */}
      <RecentDiagnosisTable data={data?.recentDiagnoses} />
    </div>
  );
}
