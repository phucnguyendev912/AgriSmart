import React, { useState, useEffect, useCallback } from 'react';
import { getAttachments, deleteAttachment, restoreAttachment, uploadAttachment } from '../services/attachmentService';

const AttachmentManagementPage = () => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'active', 'deleted'
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    deleted: 0,
  });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('OTHER');
  const [isUploading, setIsUploading] = useState(false);

  // Helper to format file size
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get file type icon
  const getFileIcon = (mimeType, fileName) => {
    if (!mimeType) return 'insert_drive_file';
    const mime = mimeType.toLowerCase();
    const ext = fileName?.split('.').pop().toLowerCase();
    
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf' || ext === 'pdf') return 'picture_as_pdf';
    if (
      mime.includes('excel') || 
      mime.includes('spreadsheet') || 
      ext === 'xlsx' || 
      ext === 'xls' || 
      ext === 'csv'
    ) return 'table_chart';
    if (
      mime.includes('word') || 
      mime.includes('document') || 
      ext === 'docx' || 
      ext === 'doc'
    ) return 'description';
    
    return 'attachment';
  };

  // Fetch stats count using filtered requests
  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, activeRes, deletedRes] = await Promise.all([
        getAttachments({ page: 0, size: 1 }),
        getAttachments({ page: 0, size: 1, isDelete: false }),
        getAttachments({ page: 0, size: 1, isDelete: true }),
      ]);
      
      setStats({
        total: totalRes.totalElements,
        active: activeRes.totalElements,
        deleted: deletedRes.totalElements,
      });
    } catch (err) {
      console.error('Lỗi khi tải thống kê tệp đính kèm:', err);
    }
  }, []);

  // Fetch paginated & filtered data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size,
        search: searchTerm || null,
        fileType: fileType || null,
        category: category || null,
      };

      if (statusFilter === 'active') params.isDelete = false;
      if (statusFilter === 'deleted') params.isDelete = true;

      const data = await getAttachments(params);
      setAttachments(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Lỗi khi tải danh sách tệp đính kèm:', err);
      setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchTerm, fileType, category, statusFilter]);

  // Load data & stats
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handlers for search/filters
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setPage(0);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  // Actions
  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mềm tệp "${fileName}"?`)) return;
    
    try {
      setError('');
      await deleteAttachment(id);
      setSuccessMessage('Xóa mềm tệp đính kèm thành công!');
      fetchData();
      fetchStats();
    } catch (err) {
      console.error('Lỗi khi xóa tệp đính kèm:', err);
      setError(err.response?.data?.message || 'Không thể xóa tệp đính kèm.');
    }
  };

  const handleRestore = async (id, fileName) => {
    try {
      setError('');
      await restoreAttachment(id);
      setSuccessMessage('Khôi phục tệp đính kèm thành công!');
      fetchData();
      fetchStats();
    } catch (err) {
      console.error('Lỗi khi khôi phục tệp đính kèm:', err);
      setError(err.response?.data?.message || 'Không thể khôi phục tệp đính kèm.');
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!uploadFile) return;

    if (uploadFile.size > 10 * 1024 * 1024) {
      setError('Dung lượng tệp tối đa cho phép là 10MB.');
      return;
    }

    const allowed = ['csv', 'xlsx', 'xls', 'pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'];
    const ext = uploadFile.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Định dạng tệp không được hỗ trợ.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      await uploadAttachment(uploadFile, uploadCategory);
      setSuccessMessage('Tải tệp đính kèm lên thành công!');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadCategory('OTHER');
      fetchData();
      fetchStats();
    } catch (err) {
      console.error('Lỗi tải tệp lên phía admin:', err);
      setError(err.response?.data?.message || 'Không thể tải tệp lên.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface p-4 sm:p-6 lg:p-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-emerald-700 font-medium">Quản lý tệp đính kèm</span>
          </nav>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Quản lý tệp đính kèm</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Giám sát, tìm kiếm, xem và xóa mềm hoặc khôi phục các tệp tin trong hệ thống AgriSmart.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
          Tải Tệp Mới Lên
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
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-850 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <p className="font-medium text-sm">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bento-card p-6 rounded-2xl bg-white border border-outline-variant/15 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">folder</span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tổng số tệp</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
          </div>
        </div>

        <div className="bento-card p-6 rounded-2xl bg-white border border-outline-variant/15 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">cloud_done</span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Đang hoạt động</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</h3>
          </div>
        </div>

        <div className="bento-card p-6 rounded-2xl bg-white border border-outline-variant/15 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">delete_sweep</span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Đã xóa mềm</p>
            <h3 className="text-2xl font-black text-rose-700 mt-1">{stats.deleted}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-4 sm:p-6">
        
        {/* Table Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/10 pb-6 mb-6">
          <h2 className="text-xl font-black text-on-surface">Danh sách tệp tin</h2>
          <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-800 uppercase tracking-widest">
            {totalElements} kết quả
          </span>
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search bar */}
          <div className="relative w-full lg:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-stone-400 text-[20px]">search</span>
            </span>
            <input
              type="text"
              className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-slate-50/50 w-full font-medium text-on-surface placeholder-stone-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="Tìm theo tên tệp..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* File Type Filter */}
          <select
            className="px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-slate-50/50 font-medium text-on-surface focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            value={fileType}
            onChange={handleFileTypeChange}
          >
            <option value="">Loại tệp (Tất cả)</option>
            <option value="IMAGE">Ảnh (IMAGE)</option>
            <option value="DOCUMENT">Tài liệu (DOCUMENT)</option>
            <option value="OTHER">Khác (OTHER)</option>
          </select>

          {/* Category Filter */}
          <select
            className="px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-slate-50/50 font-medium text-on-surface focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">Danh mục (Tất cả)</option>
            <option value="AVATAR">Ảnh đại diện (AVATAR)</option>
            <option value="CHAT">Khung Chat (CHAT)</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-slate-50/50 font-medium text-on-surface focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="active">Đang hoạt động</option>
            <option value="deleted">Đã xóa mềm</option>
          </select>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <span className="material-symbols-outlined text-5xl">folder_off</span>
            <p className="mt-2 text-sm font-semibold">Không tìm thấy tệp đính kèm nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-4 px-4">Tên tệp</th>
                  <th className="py-4 px-4">Loại tệp</th>
                  <th className="py-4 px-4">Mục đích</th>
                  <th className="py-4 px-4">Dung lượng</th>
                  <th className="py-4 px-4">Thực thể gốc</th>
                  <th className="py-4 px-4">Ngày tải lên</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm font-medium text-slate-700">
                {attachments.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-4 max-w-xs md:max-w-sm">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl text-slate-400 shrink-0 select-none">
                          {getFileIcon(file.mimeType, file.fileName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate" title={file.fileName}>
                            {file.fileName}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate" title={file.mimeType}>
                            {file.mimeType || 'unknown mime'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                        file.fileType === 'IMAGE' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {file.fileType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-600">
                        {file.category === 'AVATAR' ? 'Ảnh đại diện' : file.category === 'CHAT' ? 'Hội thoại' : file.category || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      {formatBytes(file.fileSize)}
                    </td>
                    <td className="py-4 px-4">
                      {file.referenceType ? (
                        <div className="text-xs">
                          <span className="font-bold text-slate-600 block">{file.referenceType}</span>
                          <span className="text-stone-400">ID: {file.referenceId}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-500">
                      {formatDate(file.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        file.isDelete 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${file.isDelete ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                        {file.isDelete ? 'Đã xóa mềm' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Open/Download */}
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Xem / Tải xuống tệp gốc"
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-lg">download</span>
                        </a>

                        {/* Delete or Restore */}
                        {file.isDelete ? (
                          <button
                            onClick={() => handleRestore(file.id, file.fileName)}
                            title="Khôi phục tệp đính kèm"
                            className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-lg">settings_backup_restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(file.id, file.fileName)}
                            title="Xóa mềm tệp đính kèm"
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all active:scale-90"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                Trước
              </button>
              
              {/* Simple page numbers */}
              <div className="flex items-center gap-0.5">
                {[...Array(totalPages).keys()].slice(Math.max(0, page - 2), Math.min(totalPages, page + 3)).map((pIndex) => (
                  <button
                    key={pIndex}
                    onClick={() => setPage(pIndex)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                      pIndex === page 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                        : 'border border-stone-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {pIndex + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                Sau
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal Popup */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 relative border border-slate-100 animate-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadCategory('OTHER');
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">cloud_upload</span>
              Tải lên tệp đính kèm mới
            </h3>

            <div className="space-y-4">
              {/* File input */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Chọn tệp tin</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer border border-stone-200 rounded-xl p-2 bg-slate-50/50 focus:outline-none"
                />
              </div>

              {/* Category select */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Danh mục tệp</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-slate-50/50 font-medium text-on-surface focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="OTHER">Tài liệu khác (OTHER)</option>
                  <option value="AVATAR">Ảnh đại diện (AVATAR)</option>
                  <option value="CHAT">Khung Chat (CHAT)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadCategory('OTHER');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-500 hover:bg-slate-50 transition-all text-sm active:scale-95 disabled:opacity-40"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isUploading || !uploadFile}
                  onClick={handleUpload}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Đang tải...
                    </>
                  ) : (
                    'Bắt đầu tải lên'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManagementPage;
