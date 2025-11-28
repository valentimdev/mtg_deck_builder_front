import type { ScryfallCard } from '@/services/scryfall';

export interface DeckItem {
  quantity: number;
  card: ScryfallCard | null;
  cardName: string;
  loading: boolean;
  error: string | null;
}

export interface DeckState {
  commander: DeckItem | null;
  deckItems: DeckItem[];
  loading: boolean;
  error: string | null;
  totalCards: number;
}

import type { ScryfallCard } from '@/services/scryfall';

export interface DeckActions {
  loadDeckFromTxt: () => Promise<void>;
  removeDeckItem: (index: number) => Promise<void>;
  removeCardById: (cardId: string) => Promise<void>;
  addDeckItem: (cardName: string, quantity?: number) => Promise<void>;
  addCardByCard: (card: ScryfallCard, quantity?: number) => Promise<void>;
  addCardAsCommander: (cardId: string) => Promise<void>;
  reloadDeck: () => Promise<void>;
}

export type DeckContextValue = DeckState & DeckActions;
