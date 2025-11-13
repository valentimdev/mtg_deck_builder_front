import React, { createContext, useContext, useState } from 'react';
import type { ScryfallCard } from '../services/scryfall/types';

interface CardDialogContextType {
  selectedCard: ScryfallCard | null;
  openCard: (card: ScryfallCard) => void;
  closeCard: () => void;
}

const CardDialogContext = createContext<CardDialogContextType | null>(null);

export function CardDialogProvider({ children }: { children: React.ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const openCard = (card: ScryfallCard) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  return (
    <CardDialogContext.Provider value={{ selectedCard, openCard, closeCard }}>
      {children}
      {selectedCard && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10000"
          onClick={closeCard}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCard.image_uris?.normal}
              alt={selectedCard.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={closeCard}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </CardDialogContext.Provider>
  );
}

export function useCardDialog() {
  const context = useContext(CardDialogContext);
  if (!context) {
    throw new Error('useCardDialog deve ser usado dentro de CardDialogProvider');
  }
  return context;
}