import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#006b32', '#5adf82', '#ffdf90', '#4ade80', '#86efac', '#bbf7d0'];

export default function CropDistributionChart({ data = [] }) {
  const chartData = data.map((item) => ({ name: item.cropTypeName, value: item.count }));

  return (
    <div className="bento-card p-6 rounded-xl shadow-sm border border-outline-variant/10">
      <h2 className="text-lg font-bold mb-6">Phân bổ loại cây trồng</h2>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-on-surface-variant text-sm">Chưa có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val, name) => [val, name]} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
