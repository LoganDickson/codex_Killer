import type { LorcanaCard } from '../types';

interface Props {
  cards: LorcanaCard[];
  onAdd: (cardId: string) => void;
}

export default function CardCatalog({ cards, onAdd }: Props) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Card Database ({cards.length})</h2>
      <div className="max-h-[36rem] space-y-2 overflow-auto pr-1">
        {cards.map((card) => (
          <article key={card.id} className="rounded border border-slate-700 bg-slate-800 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{card.name}</h3>
                <p className="text-xs text-slate-300">
                  {card.inkColor} · Cost {card.inkCost} · {card.cardType} · {card.legality}
                </p>
                <p className="text-xs text-slate-400">{card.abilities}</p>
              </div>
              <button onClick={() => onAdd(card.id)} className="rounded bg-indigo-500 px-2 py-1 text-xs font-medium">
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
