export type InkColor = 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel';
export type CardType = 'Character' | 'Action' | 'Item' | 'Location';
export type Legality = 'Standard' | 'Expanded' | 'Banned';

export interface LorcanaCard {
  id: string;
  name: string;
  inkColor: InkColor;
  inkCost: number;
  isInkable: boolean;
  cardType: CardType;
  rarity: string;
  setCode: string;
  legality: Legality;
  strength?: number;
  willpower?: number;
  loreValue?: number;
  abilities?: string;
  keywords?: string[];
}

export interface DeckCardEntry {
  cardId: string;
  quantity: number;
}

export interface SavedDeck {
  id: string;
  name: string;
  cards: DeckCardEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface DeckFilters {
  inkColors: InkColor[];
  inkCostMin: number;
  inkCostMax: number;
  inkableOnly: boolean;
  legality: 'All' | Legality;
  cardTypes: CardType[];
  searchText: string;
}

export interface SimulationResult {
  deckAWinRate: number;
  deckBWinRate: number;
  averageTurns: number;
  firstPlayerWinRate: number;
  turnDistribution: Record<number, number>;
}
