import { useState, useEffect } from 'react';
import { useDiseases } from '../features/diseases/useDiseases';
import DiseaseStats from '../features/diseases/DiseaseStats';
import DiseaseFilters from '../features/diseases/DiseaseFilters';
import DiseaseTable from '../features/diseases/DiseaseTable';
import DiseaseForm from '../features/diseases/DiseaseForm';
import DiseaseDetailModal from '../features/diseases/DiseaseDetailModal';

const DiseaseManagementPage = () => {
  const {
    diseases,
    stats,
    cropTypes,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    setPage,
    setSize,
    setFilters,
    createDisease,
    updateDisease,
    deleteDisease,
  } = useDiseases();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [viewingDisease, setViewingDisease] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenForm = (disease = null) => {
    setEditingDisease(disease);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDisease(null);
  };

  const handleOpenDetail = (disease) => {
    setViewingDisease(disease);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setViewingDisease(null);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    let result;
    if (editingDisease) {
      result = await updateDisease(editingDisease.id, formData);
    } else {
      result = await createDisease(formData);
    }
    
    if (result.success) {
      setSuccessMessage(editingDisease ? 'Cập nhật bệnh cây trồng thành công' : 'Thêm bệnh cây trồng mới thành công');
      handleCloseForm();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteDisease(id);
    if (result.success) {
      setSuccessMessage('Xóa bệnh cây trồng thành công');
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý bệnh cây trồng</h1>
          <p className="text-stone-500 mt-2 font-medium">Quản lý danh sách các loại bệnh, triệu chứng và cách điều trị.</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-on-primary-fixed bg-primary-fixed hover:bg-primary-fixed-dim shadow-md shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm Bệnh Mới
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-medium text-sm">{successMessage}</p>
        </div>
      )}

      {/* Stats Area */}
      <DiseaseStats 
        totalDiseases={stats.totalDiseases} 
        totalCropTypes={stats.totalCropTypes}
      />

      {/* Main Content Area */}
      <div className="mt-8 bg-surface rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách bệnh</h2>
          <span className="px-3 py-1 bg-surface-dim/50 rounded-lg text-xs font-bold text-stone-500 uppercase tracking-widest">
            {totalElements} Bệnh
          </span>
        </div>

        <DiseaseFilters 
          cropTypes={cropTypes}
          filters={filters} 
          setFilters={setFilters} 
          size={size} 
          setSize={setSize} 
        />

        {loading && diseases.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <DiseaseTable 
            diseases={diseases}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            setPage={setPage}
            onEdit={handleOpenForm}
            onView={handleOpenDetail}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      <DiseaseForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleSubmit}
        initialData={editingDisease}
        isSubmitting={isSubmitting}
        cropTypes={cropTypes}
      />

      <DiseaseDetailModal 
        isOpen={isDetailOpen} 
        onClose={handleCloseDetail} 
        disease={viewingDisease} 
      />
    </div>
  );
};

export default DiseaseManagementPage;
