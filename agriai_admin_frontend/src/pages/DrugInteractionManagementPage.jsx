import { useState, useEffect } from 'react';
import { useDrugInteractions } from '../features/drug-interactions/useDrugInteractions';
import DrugInteractionStats from '../features/drug-interactions/DrugInteractionStats';
import DrugInteractionTable from '../features/drug-interactions/DrugInteractionTable';
import DrugInteractionFormModal from '../features/drug-interactions/DrugInteractionFormModal';
import api from '../services/api';
import { ENDPOINTS } from '../services/endpoints';

const DrugInteractionManagementPage = () => {
  const {
    interactions, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createInteraction, updateInteraction, deleteInteraction,
  } = useDrugInteractions();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [ingredientList, setIngredientList] = useState([]);

  // Load ingredient list for dropdown
  useEffect(() => {
    api.get(ENDPOINTS.ADMIN_DRUG_INGREDIENTS_SIMPLE)
      .then((res) => setIngredientList(res.data || []))
      .catch((err) => console.error('Lỗi tải hoạt chất', err));
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: searchQuery }));
      setPage(0);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchQuery, setFilters, setPage]);

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => setSuccessMessage(''), 3500); return () => clearTimeout(t); }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) { const t = setTimeout(() => setErrorMessage(''), 4500); return () => clearTimeout(t); }
  }, [errorMessage]);

  const handleAddClick = () => { setSelectedInteraction(null); setIsFormOpen(true); };
  const handleEditClick = (item) => { setSelectedInteraction(item); setIsFormOpen(true); };

  const handleDeleteClick = async (item) => {
    if (window.confirm(`Bạn có chắc muốn xóa tương tác giữa "${item.ingredientAName}" và "${item.ingredientBName}"?`)) {
      try {
        await deleteInteraction(item.id);
        setSuccessMessage('Xóa tương tác thành công');
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Không thể xóa tương tác này');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    if (selectedInteraction) {
      await updateInteraction(selectedInteraction.id, data);
      setSuccessMessage('Cập nhật tương tác thành công');
    } else {
      await createInteraction(data);
      setSuccessMessage('Thêm tương tác mới thành công');
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
            <span className="text-orange-700 font-medium">Quản lý tương tác hoạt chất</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý Tương tác Hoạt chất</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Cấu hình các cặp hoạt chất có tương tác, mức độ nguy hiểm và khuyến cáo xử lý.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm tương tác mới
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

      <DrugInteractionStats totalInteractions={stats.totalInteractions} />

      {/* Table Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách tương tác hoạt chất</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">search</span>
            </span>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-orange-500 focus:ring-orange-500"
              placeholder="Tìm theo tên hoạt chất..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hiển thị</span>
            <select
              className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-orange-500 focus:ring-orange-500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading && interactions.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <DrugInteractionTable
            interactions={interactions}
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
        <DrugInteractionFormModal
          key={selectedInteraction ? `edit-${selectedInteraction.id}` : 'create'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          interaction={selectedInteraction}
          ingredients={ingredientList}
        />
      )}
    </div>
  );
};

export default DrugInteractionManagementPage;
