import { useMemo, useRef, useState } from 'react';
import SimulationResults from '../components/SimulationResults';
import { useDeckStore } from '../store/deckStore';
import type { SimulationResult } from '../types';

const DEFAULT_ITERATIONS = 1000;

export default function MatchupAnalyzerPage() {
  const { savedDecks } = useDeckStore();
  const [deckAId, setDeckAId] = useState('');
  const [deckBId, setDeckBId] = useState('');
  const [iterations, setIterations] = useState(DEFAULT_ITERATIONS);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const hasWarning = iterations > 10000;
  const selectableDecks = useMemo(() => savedDecks.filter((deck) => deck.cards.length > 0), [savedDecks]);

  const runSimulation = () => {
    const deckA = selectableDecks.find((deck) => deck.id === deckAId);
    const deckB = selectableDecks.find((deck) => deck.id === deckBId);
    if (!deckA || !deckB) return;

    setIsRunning(true);
    setProgress(0);
    setResult(null);

    workerRef.current?.terminate();
    const worker = new Worker(new URL('../workers/simulationWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'progress') {
        setProgress((message.completed / message.total) * 100);
      }
      if (message.type === 'done') {
        setResult(message.result);
        setIsRunning(false);
        worker.terminate();
      }
      if (message.type === 'cancelled') {
        setIsRunning(false);
        worker.terminate();
      }
    };

    worker.postMessage({ type: 'start', deckA: deckA.cards, deckB: deckB.cards, iterations });
  };

  const cancelSimulation = () => {
    workerRef.current?.postMessage({ type: 'cancel' });
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          Deck A
          <select value={deckAId} onChange={(e) => setDeckAId(e.target.value)} className="mt-1 w-full rounded bg-slate-800 p-2">
            <option value="">Select deck</option>
            {selectableDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Deck B
          <select value={deckBId} onChange={(e) => setDeckBId(e.target.value)} className="mt-1 w-full rounded bg-slate-800 p-2">
            <option value="">Select deck</option>
            {selectableDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>{deck.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Simulations
          <input
            type="number"
            min={1}
            max={10000}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="mt-1 w-full rounded bg-slate-800 p-2"
          />
        </label>
        <div className="flex items-end gap-2">
          <button onClick={runSimulation} disabled={isRunning || hasWarning} className="rounded bg-indigo-500 px-4 py-2 text-sm disabled:opacity-40">
            Run Simulation
          </button>
          <button onClick={cancelSimulation} disabled={!isRunning} className="rounded bg-red-700 px-4 py-2 text-sm disabled:opacity-40">
            Cancel
          </button>
        </div>
      </section>

      {hasWarning && <p className="rounded border border-amber-500/50 bg-amber-900/30 p-2 text-sm">Maximum is 10,000 iterations.</p>}

      {isRunning && (
        <section className="rounded border border-slate-800 bg-slate-900 p-4">
          <p className="mb-2 text-sm">Simulation Progress: {progress.toFixed(1)}%</p>
          <div className="h-3 overflow-hidden rounded bg-slate-700">
            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </div>
        </section>
      )}

      {result && <SimulationResults result={result} />}
    </div>
  );
}
