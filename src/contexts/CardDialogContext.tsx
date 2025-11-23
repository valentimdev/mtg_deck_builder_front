import React, { createContext, useContext, useState } from 'react';
import type { ScryfallCard } from '@/services/scryfall';
import { getImageUris } from '@/services/scryfall';

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
            {selectedCard && (() => {
                const imageUris = getImageUris(selectedCard);
                return (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[9999]"
                    onClick={closeCard} >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] p-4"
                        onClick={(e) => e.stopPropagation()} >
                        <img
                            src={imageUris.normal}
                            alt={selectedCard.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
                );
            })()}
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