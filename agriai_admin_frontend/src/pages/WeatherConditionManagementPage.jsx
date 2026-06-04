import { useState, useEffect } from 'react';
import { useWeatherConditions } from '../features/weather-conditions/useWeatherConditions';
import WeatherConditionStats from '../features/weather-conditions/WeatherConditionStats';
import WeatherConditionTable from '../features/weather-conditions/WeatherConditionTable';
import WeatherConditionFormModal from '../features/weather-conditions/WeatherConditionFormModal';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

const WeatherConditionManagementPage = () => {
  const {
    conditions, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createCondition, updateCondition, deleteCondition,
  } = useWeatherConditions();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [diseaseList, setDiseaseList] = useState([]);

  // Load disease list for dropdown
  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_DISEASES_SIMPLE)
      .then((res) => setDiseaseList(res.data || []))
      .catch((err) => console.error('Lỗi tải danh sách bệnh', err));
  }, []);

  // Filter by disease
  useEffect(() => {
    setFilters((prev) => ({ ...prev, diseaseId: selectedDiseaseId }));
    setPage(0);
  }, [selectedDiseaseId, setFilters, setPage]);

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 3500); return () => clearTimeout(t); }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) { const t = setTimeout(() => setErrorMessage(''), 4500); return () => clearTimeout(t); }
  }, [errorMessage]);

  const handleAddClick = () => { setSelectedCondition(null); setIsFormOpen(true); };
  const handleEditClick = (item) => { setSelectedCondition(item); setIsFormOpen(true); };

  const handleDeleteClick = async (item) => {
    if (window.confirm(`Bạn có chắc muốn xóa điều kiện thời tiết ID #${item.id} của bệnh "${item.diseaseName}"?`)) {
      try {
        await deleteCondition(item.id);
        setSuccessMessage('Xóa điều kiện thời tiết thành công');
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Không thể xóa điều kiện này');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    if (selectedCondition) {
      await updateCondition(selectedCondition.id, data);
      setSuccessMessage('Cập nhật điều kiện thành công');
    } else {
      await createCondition(data);
      setSuccessMessage('Thêm điều kiện thành công');
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-sky-700 font-medium">Quản lý điều kiện thời tiết</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Điều kiện Thời tiết Gây bệnh</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Cấu hình các điều kiện thời tiết kích hoạt cảnh báo nguy cơ bùng phát bệnh.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm điều kiện mới
        </button>
      </div>

      {/* Notifications */}
      {(error || errorMessage) && (
        <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium text-sm">{error || errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-emerald-700">check_circle</span>
          <p className="font-medium text-sm">{successMessage}</p>
        </div>
      )}

      <WeatherConditionStats totalConditions={stats.totalConditions} activeConditions={stats.activeConditions} />

      {/* Table Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách điều kiện thời tiết</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="w-full md:max-w-xs">
            <select
              className="form-select w-full rounded-lg text-sm border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
            >
              <option value="">-- Tất cả bệnh --</option>
              {diseaseList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hiển thị</span>
            <select
              className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-sky-500 focus:ring-sky-500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading && conditions.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-sky-600/30 border-t-sky-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <WeatherConditionTable
            conditions={conditions}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            setPage={setPage}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {isFormOpen && (
        <WeatherConditionFormModal
          key={selectedCondition ? `edit-${selectedCondition.id}` : 'create'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          condition={selectedCondition}
          diseases={diseaseList}
        />
      )}
    </div>
  );
};

export default WeatherConditionManagementPage;
