import type { DeckCardEntry, LorcanaCard, SavedDeck } from '../types';

interface Props {
  deckName: string;
  deckCards: DeckCardEntry[];
  cardMap: Map<string, LorcanaCard>;
  savedDecks: SavedDeck[];
  onNameChange: (name: string) => void;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
  onSave: () => void;
  onLoad: (deckId: string) => void;
  onDelete: (deckId: string) => void;
  onClear: () => void;
  onImport: (text: string) => void;
  onExport: () => void;
}

export default function DeckPanel(props: Props) {
  const {
    deckName,
    deckCards,
    cardMap,
    savedDecks,
    onNameChange,
    onAdd,
    onRemove,
    onSave,
    onLoad,
    onDelete,
    onClear,
    onImport,
    onExport
  } = props;

  return (
    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">Deck Builder</h2>
      <input
        className="w-full rounded border border-slate-700 bg-slate-800 p-2"
        value={deckName}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button onClick={onSave} className="rounded bg-indigo-500 px-3 py-1 text-sm">Save</button>
        <button onClick={onClear} className="rounded bg-slate-700 px-3 py-1 text-sm">Clear</button>
        <button onClick={onExport} className="rounded bg-slate-700 px-3 py-1 text-sm">Export</button>
      </div>
      <textarea
        placeholder="Import plain text decklist: 4 Card Name"
        className="h-20 w-full rounded border border-slate-700 bg-slate-800 p-2 text-sm"
        onBlur={(e) => e.target.value.trim() && onImport(e.target.value)}
      />
      <div className="max-h-64 space-y-2 overflow-auto pr-1">
        {deckCards.map((entry) => {
          const card = cardMap.get(entry.cardId);
          if (!card) return null;
          return (
            <div key={entry.cardId} className="flex items-center justify-between rounded bg-slate-800 px-2 py-1 text-sm">
              <span>{entry.quantity}x {card.name}</span>
              <div className="flex gap-1">
                <button onClick={() => onRemove(entry.cardId)} className="rounded bg-slate-700 px-2">-</button>
                <button onClick={() => onAdd(entry.cardId)} className="rounded bg-slate-700 px-2">+</button>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Saved Decks</h3>
        <div className="space-y-1">
          {savedDecks.map((deck) => (
            <div key={deck.id} className="flex items-center justify-between rounded bg-slate-800 px-2 py-1 text-xs">
              <span>{deck.name}</span>
              <div className="flex gap-1">
                <button onClick={() => onLoad(deck.id)} className="rounded bg-slate-700 px-2">Load</button>
                <button onClick={() => onDelete(deck.id)} className="rounded bg-red-700 px-2">Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
