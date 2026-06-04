const SEVERITY_STYLES = {
  DANGER: 'bg-red-50 text-red-700 border border-red-200',
  HIGH: 'bg-red-50 text-red-700 border border-red-200',
  WARNING: 'bg-amber-50 text-amber-700 border border-amber-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  INFO: 'bg-blue-50 text-blue-700 border border-blue-200',
};

const getSeverityStyle = (severity) => {
  if (!severity) return 'bg-stone-100 text-stone-600';
  const key = severity.toUpperCase();
  return SEVERITY_STYLES[key] || 'bg-stone-100 text-stone-600';
};

const DrugInteractionStats = ({ totalInteractions = 0 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bento-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-orange-600 text-[24px]">warning</span>
        </div>
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tổng tương tác</p>
          <p className="text-2xl font-black text-on-surface mt-0.5">{totalInteractions}</p>
        </div>
      </div>
    </div>
  );
};

export { getSeverityStyle };
export default DrugInteractionStats;
