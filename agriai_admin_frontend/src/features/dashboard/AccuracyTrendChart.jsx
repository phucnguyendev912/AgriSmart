import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AccuracyTrendChart({ data = [] }) {
  return (
    <div className="bento-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
      <h2 className="text-lg font-bold mb-6">Độ chính xác AI theo ngày</h2>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip labelFormatter={(label) => `Ngày: ${label}`} />
            <Legend formatter={(val) => val === 'accurate' ? 'Chính xác' : 'Không chính xác'} />
            <Bar dataKey="accurate" fill="#006b32" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inaccurate" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
