import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DiagnosisTrendChart({ data = [] }) {
  return (
    <div className="bento-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
      <h2 className="text-lg font-bold mb-6">Xu hướng lượt chẩn đoán</h2>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="diagGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006b32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#006b32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              formatter={(val) => [val, 'Lượt chẩn đoán']}
              labelFormatter={(label) => `Ngày: ${label}`}
            />
            <Area type="monotone" dataKey="count" stroke="#006b32" fill="url(#diagGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
