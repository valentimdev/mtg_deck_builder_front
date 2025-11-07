import type { ScryfallCard } from '@/services/scryfall';

export interface DeckItem {
  quantity: number;
  card: ScryfallCard | null;
  cardName: string;
  loading: boolean;
  error: string | null;
}

export interface DeckState {
  deckItems: DeckItem[];
  loading: boolean;
  error: string | null;
  totalCards: number;
}

export interface DeckActions {
  loadDeckFromTxt: () => Promise<void>;
  removeDeckItem: (index: number) => void;
  addDeckItem: (cardName: string, quantity?: number) => void;
  reloadDeck: () => Promise<void>;
}

export type DeckContextValue = DeckState & DeckActions;
