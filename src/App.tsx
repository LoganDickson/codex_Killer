import { NavLink, Route, Routes } from 'react-router-dom';
import DeckBuilderPage from './pages/DeckBuilderPage';
import MatchupAnalyzerPage from './pages/MatchupAnalyzerPage';

const tabs = [
  { to: '/', label: 'Deck Builder' },
  { to: '/matchup', label: 'Matchup Analyzer' }
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Lorcana Deck Lab</h1>
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'}`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">
        <Routes>
          <Route path="/" element={<DeckBuilderPage />} />
          <Route path="/matchup" element={<MatchupAnalyzerPage />} />
        </Routes>
      </main>
    </div>
  );
}
