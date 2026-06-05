import { useState, useEffect } from 'react';
import { useIngredients } from '../features/ingredients/useIngredients';
import IngredientStats from '../features/ingredients/IngredientStats';
import IngredientTable from '../features/ingredients/IngredientTable';
import IngredientFormModal from '../features/ingredients/IngredientFormModal';

const IngredientManagementPage = () => {
  const {
    ingredients, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createIngredient, updateIngredient, deleteIngredient,
  } = useIngredients();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, name: searchName }));
      setPage(0);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchName, setFilters, setPage]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(''), 4500);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const handleAddClick = () => {
    setSelectedIngredient(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedIngredient(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (item) => {
    if (window.confirm(`Bạn có chắc muốn xóa hoạt chất "${item.ingredientName}" không?`)) {
      try {
        await deleteIngredient(item.id);
        setSuccessMessage('Xóa hoạt chất thành công');
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Không thể xóa hoạt chất này');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    if (selectedIngredient) {
      await updateIngredient(selectedIngredient.id, data);
      setSuccessMessage('Cập nhật hoạt chất thành công');
    } else {
      await createIngredient(data);
      setSuccessMessage('Thêm hoạt chất mới thành công');
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
            <span className="text-teal-700 font-medium">Quản lý hoạt chất</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý Hoạt chất</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Quản lý danh mục hoạt chất dùng trong các loại thuốc bảo vệ thực vật.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Hoạt chất mới
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

      {/* Stats */}
      <IngredientStats totalIngredients={stats.totalIngredients} />

      {/* Table Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách hoạt chất</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">search</span>
            </span>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-teal-500 focus:ring-teal-500"
              placeholder="Tìm kiếm theo tên hoạt chất..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hiển thị</span>
            <select
              className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-teal-500 focus:ring-teal-500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading && ingredients.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <IngredientTable
            ingredients={ingredients}
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
        <IngredientFormModal
          key={selectedIngredient ? `edit-${selectedIngredient.id}` : 'create'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          ingredient={selectedIngredient}
        />
      )}
    </div>
  );
};

export default IngredientManagementPage;
