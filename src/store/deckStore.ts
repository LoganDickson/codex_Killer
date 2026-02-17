import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeckCardEntry, SavedDeck } from '../types';

interface DeckState {
  activeDeck: DeckCardEntry[];
  activeDeckName: string;
  savedDecks: SavedDeck[];
  setDeckName: (name: string) => void;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  setCardQuantity: (cardId: string, quantity: number) => void;
  clearDeck: () => void;
  saveDeck: () => void;
  loadDeck: (deckId: string) => void;
  deleteDeck: (deckId: string) => void;
  importDeck: (name: string, cards: DeckCardEntry[]) => void;
}

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      activeDeck: [],
      activeDeckName: 'Untitled Deck',
      savedDecks: [],
      setDeckName: (name) => set({ activeDeckName: name }),
      addCard: (cardId) => {
        const existing = get().activeDeck.find((entry) => entry.cardId === cardId);
        if (existing && existing.quantity >= 4) return;
        set({
          activeDeck: existing
            ? get().activeDeck.map((entry) =>
                entry.cardId === cardId ? { ...entry, quantity: entry.quantity + 1 } : entry
              )
            : [...get().activeDeck, { cardId, quantity: 1 }]
        });
      },
      removeCard: (cardId) =>
        set({
          activeDeck: get().activeDeck
            .map((entry) => (entry.cardId === cardId ? { ...entry, quantity: entry.quantity - 1 } : entry))
            .filter((entry) => entry.quantity > 0)
        }),
      setCardQuantity: (cardId, quantity) =>
        set({
          activeDeck: get().activeDeck
            .map((entry) => (entry.cardId === cardId ? { ...entry, quantity } : entry))
            .filter((entry) => entry.quantity > 0)
        }),
      clearDeck: () => set({ activeDeck: [], activeDeckName: 'Untitled Deck' }),
      saveDeck: () => {
        const now = Date.now();
        const id = `${now}`;
        const deck: SavedDeck = {
          id,
          name: get().activeDeckName,
          cards: get().activeDeck,
          createdAt: now,
          updatedAt: now
        };
        set({ savedDecks: [...get().savedDecks, deck] });
      },
      loadDeck: (deckId) => {
        const found = get().savedDecks.find((deck) => deck.id === deckId);
        if (!found) return;
        set({ activeDeck: found.cards, activeDeckName: found.name });
      },
      deleteDeck: (deckId) => set({ savedDecks: get().savedDecks.filter((deck) => deck.id !== deckId) }),
      importDeck: (name, cards) => set({ activeDeckName: name, activeDeck: cards })
    }),
    { name: 'lorcana-decklab-store' }
  )
);
