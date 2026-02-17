import type { DeckCardEntry, LorcanaCard, SimulationResult } from '../types';

interface SimulationDeckCard extends LorcanaCard {
  quantity: number;
}

interface PlayerState {
  hand: SimulationDeckCard[];
  drawPile: SimulationDeckCard[];
  inkPool: number;
  lore: number;
}

const TARGET_LORE = 20;

function expandDeck(deck: DeckCardEntry[], cardMap: Map<string, LorcanaCard>): SimulationDeckCard[] {
  return deck
    .flatMap((entry) => {
      const card = cardMap.get(entry.cardId);
      return card ? Array.from({ length: entry.quantity }, () => ({ ...card, quantity: 1 })) : [];
    })
    .slice(0, 60);
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function scoreCard(card: SimulationDeckCard, availableInk: number): number {
  if (card.inkCost > availableInk) return -999;
  const lore = card.loreValue ?? 0;
  const power = card.strength ?? 0;
  const tempo = card.cardType === 'Action' ? 1 : 0;
  const inkFlex = card.isInkable ? 0.5 : 0;
  return lore * 3 + power * 1.5 + tempo + inkFlex - card.inkCost * 0.5;
}

function takeTurn(player: PlayerState, turn: number): void {
  if (player.drawPile.length > 0) {
    const drawn = player.drawPile.pop();
    if (drawn) player.hand.push(drawn);
  }

  if (turn > 0) {
    const inkCardIndex = player.hand.findIndex((c) => c.isInkable);
    if (inkCardIndex >= 0) {
      player.hand.splice(inkCardIndex, 1);
      player.inkPool += 1;
    }
  }

  let availableInk = player.inkPool;
  while (availableInk > 0) {
    const bestIdx = player.hand
      .map((card, idx) => ({ idx, score: scoreCard(card, availableInk) }))
      .sort((a, b) => b.score - a.score)[0];

    if (!bestIdx || bestIdx.score < 0) break;
    const [played] = player.hand.splice(bestIdx.idx, 1);
    availableInk -= played.inkCost;
    player.lore += played.loreValue ?? 0;
    if (played.cardType === 'Character') {
      player.lore += Math.max(0, Math.floor((played.strength ?? 0) / 4));
    }
  }

  player.lore += Math.min(3, Math.floor(availableInk / 2));
}

export function simulateMatchups(
  deckA: DeckCardEntry[],
  deckB: DeckCardEntry[],
  allCards: LorcanaCard[],
  iterations: number,
  random: () => number = Math.random
): SimulationResult {
  const cardMap = new Map(allCards.map((card) => [card.id, card]));
  const listA = expandDeck(deckA, cardMap);
  const listB = expandDeck(deckB, cardMap);

  let deckAWins = 0;
  let deckBWins = 0;
  let firstPlayerWins = 0;
  let totalTurns = 0;
  const turnDistribution: Record<number, number> = {};

  for (let i = 0; i < iterations; i += 1) {
    const aFirst = i % 2 === 0;
    const playerA: PlayerState = {
      drawPile: shuffle(listA, random),
      hand: [],
      inkPool: 0,
      lore: 0
    };
    const playerB: PlayerState = {
      drawPile: shuffle(listB, random),
      hand: [],
      inkPool: 0,
      lore: 0
    };

    playerA.hand = playerA.drawPile.splice(0, 7);
    playerB.hand = playerB.drawPile.splice(0, 7);

    let turn = 1;
    while (turn < 40) {
      if (aFirst) {
        takeTurn(playerA, turn);
        if (playerA.lore >= TARGET_LORE) break;
        takeTurn(playerB, turn);
      } else {
        takeTurn(playerB, turn);
        if (playerB.lore >= TARGET_LORE) break;
        takeTurn(playerA, turn);
      }
      if (playerA.lore >= TARGET_LORE || playerB.lore >= TARGET_LORE) break;
      turn += 1;
    }

    totalTurns += turn;
    turnDistribution[turn] = (turnDistribution[turn] ?? 0) + 1;

    const winnerA = playerA.lore >= playerB.lore;
    if (winnerA) {
      deckAWins += 1;
      if (aFirst) firstPlayerWins += 1;
    } else {
      deckBWins += 1;
      if (!aFirst) firstPlayerWins += 1;
    }
  }

  return {
    deckAWinRate: (deckAWins / iterations) * 100,
    deckBWinRate: (deckBWins / iterations) * 100,
    averageTurns: totalTurns / iterations,
    firstPlayerWinRate: (firstPlayerWins / iterations) * 100,
    turnDistribution
  };
}
