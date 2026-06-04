const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 p-3 bg-surface-dim/20 rounded-xl border border-outline-variant/5">
    {icon && (
      <span className="material-symbols-outlined text-emerald-700 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center text-[18px] shrink-0 mt-0.5">
        {icon}
      </span>
    )}
    <div>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-stone-800 text-sm mt-0.5 break-words">{value !== null && value !== undefined && value !== '' ? value : '-'}</p>
    </div>
  </div>
);

const TreatmentPlanDetailModal = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getDosageTypeLabel = (type) => {
    switch (type) {
      case 'PER_HA': return 'Theo hecta (Per Ha)';
      case 'PER_TANK': return 'Theo bình (Per Tank)';
      case 'PER_AREA': return 'Theo diện tích cụ thể (Per Area)';
      default: return type || '-';
    }
  };

  const formatDosage = () => {
    if (plan.dosageValueMin === null && plan.dosageValueMax === null) return '-';
    let range;
    if (plan.dosageValueMin !== null && plan.dosageValueMax !== null) {
      range = `${plan.dosageValueMin} - ${plan.dosageValueMax}`;
    } else {
      range = plan.dosageValueMin !== null ? plan.dosageValueMin : plan.dosageValueMax;
    }
    return `${range} ${plan.dosageUnit || ''}`;
  };

  const formatArea = () => {
    if (!plan.dosageAreaValue) return '-';
    return `${plan.dosageAreaValue} ${plan.dosageAreaUnit || ''}`;
  };

  const formatWaterVolume = () => {
    if (plan.waterVolumeMin === null && plan.waterVolumeMax === null) return '-';
    let range;
    if (plan.waterVolumeMin !== null && plan.waterVolumeMax !== null) {
      range = `${plan.waterVolumeMin} - ${plan.waterVolumeMax}`;
    } else {
      range = plan.waterVolumeMin !== null ? plan.waterVolumeMin : plan.waterVolumeMax;
    }
    return `${range} ${plan.waterVolumeUnit || ''}`;
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/20 flex flex-col transform scale-100 transition-transform duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/15 flex justify-between items-center bg-stone-50 dark:bg-stone-900 sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
              Chi tiết phác đồ #{plan.id}
            </span>
            <h2 className="text-xl font-black text-on-surface mt-1">{plan.treatmentName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Section 1: General Info */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Bệnh điều trị" value={plan.diseaseName} icon="coronavirus" />
              <DetailItem label="Mã bệnh" value={plan.diseaseCode} icon="qr_code" />
              <DetailItem label="Loại cây trồng" value={plan.cropTypeName} icon="potted_plant" />
              <DetailItem label="Thuốc sử dụng" value={plan.drugName} icon="medication" />
              <DetailItem label="Ngày tạo phác đồ" value={formatDate(plan.createdAt)} icon="calendar_today" />
            </div>
          </div>

          {/* Section 2: Dosage & Water */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Cấu hình Liều lượng & Lượng nước
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem label="Loại liều lượng" value={getDosageTypeLabel(plan.dosageType)} icon="analytics" />
              <DetailItem label="Liều lượng thuốc" value={formatDosage()} icon="scale" />
              <DetailItem label="Diện tích áp dụng" value={formatArea()} icon="crop_free" />
              <DetailItem label="Lượng nước khuyên dùng" value={formatWaterVolume()} icon="water_drop" />
            </div>
          </div>

          {/* Section 3: Usage & Spraying */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Cách dùng & Cấu hình Phun xịt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailItem label="Phương pháp phun" value={plan.applicationMethod} icon="spray" />
              <DetailItem label="Thời điểm phun thích hợp" value={plan.applicationTime} icon="schedule" />
              <DetailItem label="Số lần phun khuyến cáo" value={plan.sprayTimes ? `${plan.sprayTimes} lần` : '-'} icon="repeat" />
              <DetailItem label="Khoảng cách giữa các lần" value={plan.sprayInterval} icon="hourglass_empty" />
            </div>
          </div>

          {/* Section 4: Details & Safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">science</span>
                Hướng dẫn pha thuốc
              </div>
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                {plan.mixingInstruction || 'Chưa có hướng dẫn pha chế.'}
              </p>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px] text-error">gavel</span>
                Lưu ý an toàn
              </div>
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                {plan.safetyNotes || 'Chưa có lưu ý an toàn cụ thể.'}
              </p>
            </div>
          </div>

          {plan.description && (
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px] text-stone-600">description</span>
                Mô tả phác đồ
              </div>
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">
                {plan.description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/15 flex justify-end bg-stone-50 dark:bg-stone-900 sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanDetailModal;
