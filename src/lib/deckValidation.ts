import type { DeckCardEntry } from '../types';

export const MIN_DECK_SIZE = 60;
export const MAX_COPIES = 4;

export function getDeckSize(cards: DeckCardEntry[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0);
}

export function validateDeck(cards: DeckCardEntry[]): string[] {
  const errors: string[] = [];
  const size = getDeckSize(cards);
  if (size < MIN_DECK_SIZE) {
    errors.push(`Deck must contain at least ${MIN_DECK_SIZE} cards (currently ${size}).`);
  }
  const overLimit = cards.filter((card) => card.quantity > MAX_COPIES);
  if (overLimit.length > 0) {
    errors.push(`Cards over copy limit (${MAX_COPIES}): ${overLimit.map((c) => c.cardId).join(', ')}`);
  }
  return errors;
}
