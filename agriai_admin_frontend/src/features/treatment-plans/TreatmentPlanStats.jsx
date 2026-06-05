const StatCard = ({ icon, label, value, iconBg, iconColor }) => (
  <div className="bento-card p-5 rounded-xl flex items-center gap-4 shadow-sm border border-outline-variant/10">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-on-surface">{value.toLocaleString('vi-VN')}</p>
    </div>
  </div>
);

const TreatmentPlanStats = ({ totalTreatmentPlans }) => (
  <div className="grid grid-cols-1 gap-4">
    <StatCard 
      icon="medical_services" 
      label="Tổng số phác đồ điều trị" 
      value={totalTreatmentPlans || 0} 
      iconBg="bg-emerald-100" 
      iconColor="text-emerald-700" 
    />
  </div>
);

export default TreatmentPlanStats;
