import { useState, useEffect } from 'react';
import { useDrugs } from '../features/drugs/useDrugs';
import DrugStats from '../features/drugs/DrugStats';
import DrugTable from '../features/drugs/DrugTable';
import DrugDetailModal from '../features/drugs/DrugDetailModal';
import DrugFormModal from '../features/drugs/DrugFormModal';

const DrugManagementPage = () => {
  const {
    drugs,
    stats,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    simpleIngredients,
    setPage,
    setSize,
    setFilters,
    createDrug,
    updateDrug,
    deleteDrug
  } = useDrugs();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchManufacturer, setSearchManufacturer] = useState('');
  const [selectedIsActive, setSelectedIsActive] = useState('');

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Debounced filters setting
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        drugName: searchName,
        manufacturer: searchManufacturer,
        isActive: selectedIsActive
      }));
      setPage(0); // Reset page on new filters
    }, 450);

    return () => clearTimeout(handler);
  }, [searchName, searchManufacturer, selectedIsActive, setFilters, setPage]);

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleAddClick = () => {
    setSelectedDrug(null);
    setIsFormOpen(true);
  };

  const handleViewDetailClick = (drugItem) => {
    setSelectedDrug(drugItem);
    setIsDetailOpen(true);
  };

  const handleEditClick = (drugItem) => {
    setSelectedDrug(drugItem);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (drugItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thuốc "${drugItem.drugName}" không?`)) {
      try {
        await deleteDrug(drugItem.id);
        setSuccessMessage('Xóa thuốc thành công');
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Không thể xóa thuốc này');
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedDrug) {
        await updateDrug(selectedDrug.id, data);
        setSuccessMessage('Cập nhật thuốc thành công');
      } else {
        await createDrug(data);
        setSuccessMessage('Thêm mới thuốc thành công');
      }
      setIsFormOpen(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin thuốc');
      throw err;
    }
  };

  const formattedIngredients = simpleIngredients.map(i => ({ id: i.id, name: i.name }));

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-emerald-700 font-medium">Quản lý danh mục thuốc</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý thuốc</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Quản lý danh sách các loại thuốc, hoạt chất thành phần và cấu hình sử dụng trong nông nghiệp.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Thuốc Mới
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
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-700">check_circle</span>
          <p className="font-medium text-sm">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8">
        <DrugStats totalDrugs={stats.totalDrugs} />
      </div>

      {/* Main Table Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách thuốc bảo vệ thực vật</h2>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
            {/* Search Name Input */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-stone-400 text-[20px]">search</span>
              </span>
              <input
                type="text"
                className="form-input pl-10 pr-4 py-2 text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Tìm kiếm theo tên thuốc..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            {/* Search Manufacturer Input */}
            <div className="relative w-full sm:w-56">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-stone-400 text-[20px]">factory</span>
              </span>
              <input
                type="text"
                className="form-input pl-10 pr-4 py-2 text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Nhà sản xuất..."
                value={searchManufacturer}
                onChange={(e) => setSearchManufacturer(e.target.value)}
              />
            </div>

            {/* Active Status Filter */}
            <div className="relative w-full sm:w-44">
              <select
                className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface focus:border-emerald-500 focus:ring-emerald-500"
                value={selectedIsActive}
                onChange={(e) => setSelectedIsActive(e.target.value)}
              >
                <option value="">-- Trạng thái --</option>
                <option value="true">Hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hiển thị</span>
            <select
              className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 font-medium text-on-surface focus:border-emerald-500 focus:ring-emerald-500"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* List Data Table */}
        {loading && drugs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <DrugTable
            drugs={drugs}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            setPage={setPage}
            onViewDetail={handleViewDetailClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modals */}
      <DrugDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        drug={selectedDrug}
      />

      {isFormOpen && (
        <DrugFormModal
          key={selectedDrug ? `edit-${selectedDrug.id}` : 'create'}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          drug={selectedDrug}
          ingredients={formattedIngredients}
        />
      )}
    </div>
  );
};

export default DrugManagementPage;
