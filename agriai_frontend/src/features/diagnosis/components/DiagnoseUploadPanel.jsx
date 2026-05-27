import React from 'react';

/**
 * DiagnoseUploadPanel Component
 * Provides UI controls for uploading crop images, previewing selected images,
 * initiating diagnostic analysis, and indicating GPS/location services status.
 *
 * @param {Object} props - Component properties.
 * @param {Function} props.onFileChange - Handler for file input change.
 * @param {Function} props.onDiagnose - Handler to submit image for diagnosis.
 * @param {boolean} props.loading - Indicates if diagnostic API call is running.
 * @param {File} props.selectedFile - Currently selected image file.
 * @param {string} props.previewUrl - Object URL for previewing selected image.
 * @param {string} props.error - Diagnostic error message, if any.
 * @param {boolean} props.checkingLocation - Indicates if geolocation lookup is in progress.
 * @param {boolean} props.hasLocation - Indicates if fresh GPS coordinates are available.
 * @param {string} props.locationError - Geolocation error message, if any.
 */
const DiagnoseUploadPanel = ({
    onFileChange,
    onDiagnose,
    loading,
    selectedFile,
    previewUrl,
    error
}) => {
    const isUploadDisabled = loading;

    return (
        <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                <div className="relative group overflow-hidden rounded-lg bg-surface-container lg:min-h-0 h-64 flex items-center justify-center">
                    {previewUrl ? (
                        <img alt="Xem trước" className="w-full h-full object-cover" src={previewUrl} />
                    ) : (
                        <div className="text-center text-on-surface-variant p-8">
                            <span className="material-symbols-outlined text-5xl mb-2 block">add_photo_alternate</span>
                            <p className="text-sm font-medium">Chọn ảnh hoặc chụp ảnh cây trồng</p>
                        </div>
                    )}

                    {previewUrl && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium text-white/70 uppercase">Tệp phân tích:</p>
                                <p className="text-sm font-bold text-white truncate">{selectedFile?.name}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 mt-4">
                    <label
                        aria-disabled={isUploadDisabled}
                        className={`w-full py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                            isUploadDisabled
                                ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                                : 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">file_upload</span>
                        {isUploadDisabled ? 'Đang chẩn đoán...' : 'Chọn ảnh từ thiết bị'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileChange}
                            disabled={isUploadDisabled}
                        />
                    </label>
                </div>

                <button
                    onClick={onDiagnose}
                    disabled={loading || !selectedFile}
                    className={`w-full py-3 mt-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                        loading || !selectedFile
                            ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                            : 'bg-tertiary text-on-tertiary hover:opacity-90'
                    }`}
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                            Đang chẩn đoán...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">biotech</span>
                            Chẩn đoán ngay
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">{error}</div>
                )}
            </div>
        </div>
    );
};

export default DiagnoseUploadPanel;
