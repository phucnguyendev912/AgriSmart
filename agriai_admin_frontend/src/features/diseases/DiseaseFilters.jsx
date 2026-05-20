const DiseaseFilters = ({ cropTypes, filters, setFilters, size, setSize }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 mb-6">
      <div className="flex gap-2 w-full sm:w-auto">
        <select
          className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 w-full sm:w-auto font-medium text-on-surface"
          value={filters.cropTypeId || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, cropTypeId: e.target.value }))}
        >
          <option value="">Tất cả loại cây</option>
          {cropTypes.map(ct => (
            <option key={ct.id} value={ct.id}>{ct.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex gap-4 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Hiển thị</span>
          <select
            className="form-select text-sm rounded-lg border-outline-variant/30 bg-surface/50 font-medium text-on-surface"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DiseaseFilters;
