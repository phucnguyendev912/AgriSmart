import React, { useState, useEffect } from 'react';
import { useCropTypes } from '../features/crop-types/useCropTypes';
import CropTypeStats from '../features/crop-types/CropTypeStats';
import CropTypeTable from '../features/crop-types/CropTypeTable';

const CropTypeManagementPage = () => {
  const {
    cropTypes,
    stats,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    setPage,
    setSize,
    setFilters
  } = useCropTypes();

  const [infoMessage, setInfoMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle auto search with input debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ cropName: searchTerm });
      setPage(0); // Reset page to 0 on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, setFilters, setPage]);

  // Clear info message after 3 seconds
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  const handleAddClick = () => {
    setInfoMessage('Tính năng Thêm mới loại cây trồng đang được phát triển');
  };

  const handleEditClick = (cropType) => {
    setInfoMessage(`Tính năng Chỉnh sửa thông tin loại cây trồng (${cropType.cropName}) đang được phát triển`);
  };

  const handleDeleteClick = (cropType) => {
    setInfoMessage(`Tính năng Xóa loại cây trồng (${cropType.cropName}) đang được phát triển`);
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-emerald-700 font-medium">Quản lý loại cây</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý loại cây trồng</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Xem và cấu hình danh mục các loại cây trồng hỗ trợ chẩn đoán hình ảnh.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Loại Cây Mới
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
      {infoMessage && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined">info</span>
          <p className="font-medium text-sm">{infoMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8">
        <CropTypeStats totalCropTypes={stats.totalCropTypes} />
      </div>

      {/* Main Table Area */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách loại cây</h2>
          <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-800 uppercase tracking-widest">
            {totalElements} loại cây
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">search</span>
            </span>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Tìm kiếm theo tên cây..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
        {loading && cropTypes.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <CropTypeTable
            cropTypes={cropTypes}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            setPage={setPage}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
};

export default CropTypeManagementPage;
