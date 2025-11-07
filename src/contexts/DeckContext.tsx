import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useDeck } from '../hooks/useDeck';
import type { DeckContextValue } from '../types/deck';

const DeckContext = createContext<DeckContextValue | null>(null);

interface DeckProviderProps {
  children: ReactNode;
}

export function DeckProvider({ children }: DeckProviderProps) {
  const deckState = useDeck();

  return (
    <DeckContext.Provider value={deckState}>{children}</DeckContext.Provider>
  );
}


export function useDeckContext(): DeckContextValue {
  const context = useContext(DeckContext);

  if (!context) {
    throw new Error('useDeckContext deve ser usado dentro de um DeckProvider');
  }

  return context;
}

export function useDeckSelector<T>(
  selector: (state: DeckContextValue) => T
): T {
  const context = useDeckContext();
  return selector(context);
}

