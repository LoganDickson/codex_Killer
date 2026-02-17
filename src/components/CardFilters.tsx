import type { CardType, DeckFilters, InkColor, Legality } from '../types';

const inkColors: InkColor[] = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];
const cardTypes: CardType[] = ['Character', 'Action', 'Item', 'Location'];
const legalities: Array<'All' | Legality> = ['All', 'Standard', 'Expanded', 'Banned'];

interface Props {
  filters: DeckFilters;
  onChange: (value: DeckFilters) => void;
}

export default function CardFilters({ filters, onChange }: Props) {
  const toggleMulti = <T extends string>(arr: T[], value: T) =>
    arr.includes(value) ? arr.filter((entry) => entry !== value) : [...arr, value];

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">Filters</h2>
      <input
        className="w-full rounded border border-slate-700 bg-slate-800 p-2"
        placeholder="Search cards"
        value={filters.searchText}
        onChange={(e) => onChange({ ...filters, searchText: e.target.value })}
      />
      <div>
        <p className="mb-2 text-sm text-slate-300">Ink Colors</p>
        <div className="flex flex-wrap gap-2">
          {inkColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange({ ...filters, inkColors: toggleMulti(filters.inkColors, color) })}
              className={`rounded px-2 py-1 text-sm ${filters.inkColors.includes(color) ? 'bg-indigo-500' : 'bg-slate-800'}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Min Cost
          <input
            type="range"
            min={0}
            max={10}
            value={filters.inkCostMin}
            onChange={(e) => onChange({ ...filters, inkCostMin: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-slate-300">{filters.inkCostMin}</span>
        </label>
        <label className="text-sm">
          Max Cost
          <input
            type="range"
            min={0}
            max={10}
            value={filters.inkCostMax}
            onChange={(e) => onChange({ ...filters, inkCostMax: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-slate-300">{filters.inkCostMax}</span>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.inkableOnly}
          onChange={(e) => onChange({ ...filters, inkableOnly: e.target.checked })}
        />
        Inkable only
      </label>
      <label className="block text-sm">
        Legality
        <select
          value={filters.legality}
          onChange={(e) => onChange({ ...filters, legality: e.target.value as DeckFilters['legality'] })}
          className="mt-1 w-full rounded border border-slate-700 bg-slate-800 p-2"
        >
          {legalities.map((legality) => (
            <option key={legality}>{legality}</option>
          ))}
        </select>
      </label>
      <div>
        <p className="mb-2 text-sm text-slate-300">Card Types</p>
        <div className="flex flex-wrap gap-2">
          {cardTypes.map((cardType) => (
            <button
              key={cardType}
              onClick={() => onChange({ ...filters, cardTypes: toggleMulti(filters.cardTypes, cardType) })}
              className={`rounded px-2 py-1 text-sm ${filters.cardTypes.includes(cardType) ? 'bg-indigo-500' : 'bg-slate-800'}`}
            >
              {cardType}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
