import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SimulationResult } from '../types';

interface Props {
  result: SimulationResult;
}

export default function SimulationResults({ result }: Props) {
  const winRateData = [
    { deck: 'Deck A', winRate: Number(result.deckAWinRate.toFixed(2)) },
    { deck: 'Deck B', winRate: Number(result.deckBWinRate.toFixed(2)) }
  ];

  const turnData = Object.entries(result.turnDistribution)
    .map(([turn, count]) => ({ turn, count }))
    .sort((a, b) => Number(a.turn) - Number(b.turn));

  return (
    <section className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4 lg:grid-cols-2">
      <div className="h-64">
        <h3 className="text-sm font-medium">Win Rates</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={winRateData}>
            <XAxis dataKey="deck" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="winRate" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-64">
        <h3 className="text-sm font-medium">Turn Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={turnData}>
            <XAxis dataKey="turn" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded bg-slate-800 p-3 text-sm lg:col-span-2">
        Avg turns: {result.averageTurns.toFixed(2)} · First player win rate: {result.firstPlayerWinRate.toFixed(2)}%
      </div>
    </section>
  );
}
