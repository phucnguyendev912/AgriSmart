import React from 'react';

/**
 * Panel upload ảnh, chọn loại cây, nút chẩn đoán.
 * Props: cropTypes, selectedCropTypeId, onCropTypeChange, onFileChange, onDiagnose,
 *        loading, selectedFile, previewUrl, error
 */
const DiagnoseUploadPanel = ({
    cropTypes,
    selectedCropTypeId,
    onCropTypeChange,
    onFileChange,
    onDiagnose,
    loading,
    selectedFile,
    previewUrl,
    error,
    gpsStatus
}) => {
    return (
        <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                {/* Preview */}
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

                {/* Upload button */}
                <div className="grid grid-cols-1 gap-3 mt-4">
                    <label className="w-full py-3 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                        <span className="material-symbols-outlined text-xl">file_upload</span> Chọn ảnh từ thiết bị
                        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                    </label>
                </div>

                {/* Diagnose button */}
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
                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span> Đang chẩn đoán...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">biotech</span> Chẩn đoán ngay
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
