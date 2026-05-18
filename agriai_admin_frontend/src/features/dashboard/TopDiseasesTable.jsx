export default function TopDiseasesTable({ data = [] }) {
  return (
    <div className="bento-card rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="p-6 pb-3">
        <h2 className="text-lg font-bold">Bệnh phổ biến nhất</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Tên bệnh</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase">Lượt</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase">Tin cậy TB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">Chưa có dữ liệu</td></tr>
            ) : data.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-on-surface-variant">{i + 1}</td>
                <td className="px-6 py-3 font-medium">{item.diseaseName}</td>
                <td className="px-6 py-3 text-right">{item.count.toLocaleString('vi-VN')}</td>
                <td className="px-6 py-3 text-right">{item.averageConfidence.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
