const WeatherConditionStats = ({ totalConditions = 0, activeConditions = 0 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bento-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-sky-600 text-[24px]">cloud</span>
        </div>
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tổng điều kiện</p>
          <p className="text-2xl font-black text-on-surface mt-0.5">{totalConditions}</p>
        </div>
      </div>
      <div className="bento-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-emerald-600 text-[24px]">check_circle</span>
        </div>
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Đang hoạt động</p>
          <p className="text-2xl font-black text-on-surface mt-0.5">{activeConditions}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherConditionStats;
