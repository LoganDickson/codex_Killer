import { useMemo, useState } from 'react';
import cards from '../data/cards.json';
import CardCatalog from '../components/CardCatalog';
import CardFilters from '../components/CardFilters';
import DeckPanel from '../components/DeckPanel';
import DeckStatsCharts from '../components/DeckStatsCharts';
import { useDeckStore } from '../store/deckStore';
import type { DeckCardEntry, DeckFilters, LorcanaCard } from '../types';
import { getDeckSize, validateDeck } from '../lib/deckValidation';

const initialFilters: DeckFilters = {
  inkColors: [],
  inkCostMin: 0,
  inkCostMax: 10,
  inkableOnly: false,
  legality: 'All',
  cardTypes: [],
  searchText: ''
};

export default function DeckBuilderPage() {
  const [filters, setFilters] = useState<DeckFilters>(initialFilters);
  const { activeDeck, activeDeckName, savedDecks, addCard, removeCard, setDeckName, saveDeck, loadDeck, deleteDeck, clearDeck, importDeck } =
    useDeckStore();

  const typedCards = cards as LorcanaCard[];
  const cardMap = useMemo(() => new Map(typedCards.map((card) => [card.id, card])), [typedCards]);

  const filteredCards = useMemo(
    () =>
      typedCards.filter((card) => {
        if (filters.inkColors.length && !filters.inkColors.includes(card.inkColor)) return false;
        if (card.inkCost < filters.inkCostMin || card.inkCost > filters.inkCostMax) return false;
        if (filters.inkableOnly && !card.isInkable) return false;
        if (filters.legality !== 'All' && card.legality !== filters.legality) return false;
        if (filters.cardTypes.length && !filters.cardTypes.includes(card.cardType)) return false;
        if (
          filters.searchText &&
          !`${card.name} ${card.abilities ?? ''}`.toLowerCase().includes(filters.searchText.toLowerCase())
        )
          return false;
        return true;
      }),
    [filters, typedCards]
  );

  const deckSize = getDeckSize(activeDeck);
  const validationErrors = validateDeck(activeDeck);

  const manaCurve = useMemo(() => {
    const curve: Record<number, number> = {};
    activeDeck.forEach((entry) => {
      const card = cardMap.get(entry.cardId);
      if (card) curve[card.inkCost] = (curve[card.inkCost] ?? 0) + entry.quantity;
    });
    return Object.entries(curve).map(([cost, count]) => ({ cost, count }));
  }, [activeDeck, cardMap]);

  const colorData = useMemo(() => {
    const colorCount: Record<string, number> = {};
    activeDeck.forEach((entry) => {
      const card = cardMap.get(entry.cardId);
      if (card) colorCount[card.inkColor] = (colorCount[card.inkColor] ?? 0) + entry.quantity;
    });
    return Object.entries(colorCount).map(([name, value]) => ({ name, value }));
  }, [activeDeck, cardMap]);

  const typeData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    activeDeck.forEach((entry) => {
      const card = cardMap.get(entry.cardId);
      if (card) typeCount[card.cardType] = (typeCount[card.cardType] ?? 0) + entry.quantity;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [activeDeck, cardMap]);

  const handleExport = () => {
    const text = activeDeck
      .map((entry) => {
        const card = cardMap.get(entry.cardId);
        return card ? `${entry.quantity} ${card.name}` : '';
      })
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert('Deck copied to clipboard.');
  };

  const handleImport = (text: string) => {
    const imported: DeckCardEntry[] = [];
    text.split('\n').forEach((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) return;
      const qty = Number(match[1]);
      const name = match[2].trim().toLowerCase();
      const card = typedCards.find((c) => c.name.toLowerCase() === name);
      if (card) imported.push({ cardId: card.id, quantity: Math.min(4, qty) });
    });
    importDeck(`${activeDeckName} (Imported)`, imported);
  };

  return (
    <div className="space-y-4">
      <p className="rounded border border-slate-800 bg-slate-900 p-3 text-sm">Deck size: {deckSize} cards</p>
      {validationErrors.length > 0 && (
        <div className="rounded border border-red-500/50 bg-red-900/30 p-3 text-sm">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr_20rem]">
        <CardFilters filters={filters} onChange={setFilters} />
        <CardCatalog cards={filteredCards} onAdd={addCard} />
        <DeckPanel
          deckName={activeDeckName}
          deckCards={activeDeck}
          cardMap={cardMap}
          savedDecks={savedDecks}
          onNameChange={setDeckName}
          onAdd={addCard}
          onRemove={removeCard}
          onSave={saveDeck}
          onLoad={loadDeck}
          onDelete={deleteDeck}
          onClear={clearDeck}
          onImport={handleImport}
          onExport={handleExport}
        />
      </div>
      <DeckStatsCharts manaCurve={manaCurve} colorData={colorData} typeData={typeData} />
    </div>
  );
}
