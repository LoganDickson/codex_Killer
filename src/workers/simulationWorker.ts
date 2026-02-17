/// <reference lib="webworker" />
import cards from '../data/cards.json';
import { simulateMatchups } from '../lib/simulation';
import type { DeckCardEntry, SimulationResult } from '../types';

type WorkerRequest =
  | { type: 'start'; deckA: DeckCardEntry[]; deckB: DeckCardEntry[]; iterations: number }
  | { type: 'cancel' };

let cancelled = false;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  if (message.type === 'cancel') {
    cancelled = true;
    return;
  }

  cancelled = false;
  const iterations = Math.min(Math.max(message.iterations, 1), 10000);
  const chunkSize = 250;
  let completed = 0;
  let aggregate: SimulationResult | null = null;

  while (completed < iterations && !cancelled) {
    const run = Math.min(chunkSize, iterations - completed);
    const result = simulateMatchups(message.deckA, message.deckB, cards, run);

    if (!aggregate) {
      aggregate = result;
    } else {
      const total = completed + run;
      aggregate.deckAWinRate = ((aggregate.deckAWinRate * completed) + (result.deckAWinRate * run)) / total;
      aggregate.deckBWinRate = ((aggregate.deckBWinRate * completed) + (result.deckBWinRate * run)) / total;
      aggregate.averageTurns = ((aggregate.averageTurns * completed) + (result.averageTurns * run)) / total;
      aggregate.firstPlayerWinRate = ((aggregate.firstPlayerWinRate * completed) + (result.firstPlayerWinRate * run)) / total;
      Object.entries(result.turnDistribution).forEach(([turn, count]) => {
        aggregate!.turnDistribution[turn as unknown as number] =
          (aggregate!.turnDistribution[turn as unknown as number] ?? 0) + count;
      });
    }

    completed += run;
    self.postMessage({ type: 'progress', completed, total: iterations });
  }

  if (cancelled) {
    self.postMessage({ type: 'cancelled' });
    return;
  }

  self.postMessage({ type: 'done', result: aggregate });
};

export {};
