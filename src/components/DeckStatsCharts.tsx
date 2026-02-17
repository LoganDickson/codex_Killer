import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

interface Props {
  manaCurve: Array<{ cost: string; count: number }>;
  colorData: Array<{ name: string; value: number }>;
  typeData: Array<{ name: string; value: number }>;
}

const pieColors = ['#f59e0b', '#a78bfa', '#10b981', '#ef4444', '#3b82f6', '#94a3b8'];

export default function DeckStatsCharts({ manaCurve, colorData, typeData }: Props) {
  return (
    <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4 lg:grid-cols-3">
      <div className="h-52">
        <h3 className="text-sm font-medium">Mana Curve</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={manaCurve}>
            <XAxis dataKey="cost" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-52">
        <h3 className="text-sm font-medium">Ink Colors</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={colorData} dataKey="value" nameKey="name" outerRadius={70}>
              {colorData.map((_, idx) => (
                <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="h-52">
        <h3 className="text-sm font-medium">Card Types</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={typeData}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="value" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
