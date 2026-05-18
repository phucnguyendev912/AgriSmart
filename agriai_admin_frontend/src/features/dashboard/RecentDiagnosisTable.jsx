const STATUS_STYLE = {
  COMPLETED: 'bg-primary-fixed text-on-primary-fixed',
  PENDING:   'bg-secondary-container text-on-secondary-container',
  FAILED:    'bg-error-container text-on-error-container',
};

const STATUS_LABEL = {
  COMPLETED: 'Hoàn thành',
  PENDING:   'Đang xử lý',
  FAILED:    'Thất bại',
};

function Initials({ name = '' }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-[10px] font-bold shrink-0">
      {letters}
    </div>
  );
}

export default function RecentDiagnosisTable({ data = [] }) {
  return (
    <div className="bento-card rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="p-6 pb-3">
        <h2 className="text-lg font-bold">Hoạt động chẩn đoán gần đây</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Người dùng</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Loại cây / Bệnh</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">Chưa có dữ liệu</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">#{item.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Initials name={item.userName} />
                    <span className="font-medium">{item.userName || 'Khách'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{item.cropTypeName}</div>
                  <div className="text-xs text-on-surface-variant">{item.diseaseName} · {item.confidence.toFixed(1)}%</div>
                </td>
                <td className="px-6 py-4 text-xs text-on-surface-variant">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[item.status] || 'bg-surface-container text-on-surface-variant'}`}>
                    {STATUS_LABEL[item.status] || item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
