import React, { useState } from 'react';

/**
 * DiagnoseUploadPanel Component
 * Provides UI controls for uploading crop images, previewing selected images,
 * initiating diagnostic analysis, and indicating GPS/location services status.
 */
const DiagnoseUploadPanel = ({
    onFileChange,
    onDiagnose,
    loading,
    selectedFile,
    previewUrl,
    error,
    checkingLocation,
    hasLocation,
    isCompressing
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const isUploadDisabled = loading || isCompressing;

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUploadDisabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isUploadDisabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Construct a synthetic event matching what the file input change handler expects
                const syntheticEvent = {
                    target: {
                        files: [file]
                    }
                };
                onFileChange(syntheticEvent);
            }
        }
    };

    return (
        <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-highest">
                <div 
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative group overflow-hidden rounded-lg bg-surface-container lg:min-h-0 h-64 flex items-center justify-center transition-all ${
                        isDragging ? 'border-primary border-2 bg-primary/5 scale-[0.99] shadow-inner' : ''
                    }`}
                >
                    {previewUrl ? (
                        <img alt="Xem trước" className="w-full h-full object-cover" src={previewUrl} />
                    ) : (
                        <div className="text-center text-on-surface-variant p-8 select-none">
                            <span className="material-symbols-outlined text-5xl mb-2 block">add_photo_alternate</span>
                            <p className="text-sm font-medium">Chọn ảnh hoặc chụp ảnh cây trồng</p>
                            <p className="text-xs text-on-surface-variant/60 mt-1.5 font-medium">hoặc kéo thả ảnh vào đây</p>
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
                        {isUploadDisabled ? (isCompressing ? 'Đang xử lý ảnh...' : 'Đang chẩn đoán...') : 'Chọn ảnh từ thiết bị'}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileChange}
                            disabled={isUploadDisabled}
                        />
                    </label>

                    {/* Camera Button for Mobile Only */}
                    <label
                        aria-disabled={isUploadDisabled}
                        className={`w-full py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm md:hidden ${
                            isUploadDisabled
                                ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 cursor-pointer'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">photo_camera</span>
                        Chụp ảnh ngay
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
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
                    ) : isCompressing ? (
                        <>
                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                            Đang xử lý ảnh...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-xl">biotech</span>
                            Chẩn đoán ngay
                        </>
                    )}
                </button>

                {!checkingLocation && !hasLocation && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-medium flex items-start gap-2">
                        <span className="material-symbols-outlined text-base mt-0.5 text-amber-600">location_off</span>
                        <span>Không lấy được vị trí hiện tại, chẩn đoán vẫn tiếp tục nhưng thiếu dữ liệu thời tiết/khu vực</span>
                    </div>
                )}

                {error && (
                    <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">{error}</div>
                )}
            </div>
        </div>
    );
};

export default DiagnoseUploadPanel;
