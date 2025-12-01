import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ScryfallCard } from '@/services/scryfall';
import type { DeckItem } from '../types/deck';
import { getImageUris } from '@/services/scryfall';

interface CardDialogContextType {
  selectedCard: ScryfallCard | null;
  openCard: (card: ScryfallCard) => void;
  closeCard: () => void;
}

interface CardDialogProviderProps {
  children: React.ReactNode;
  commander: DeckItem | null;
  deckItems: DeckItem[];
  onAddCard: (card: ScryfallCard) => void;
  onAddAsCommander: (cardId: string) => void;
  onRemoveCard: (cardId: string) => void;
}

const CardDialogContext = createContext<CardDialogContextType | null>(null);

export function CardDialogProvider({
  children,
  commander,
  deckItems,
  onAddCard,
  onAddAsCommander,
  onRemoveCard,
}: CardDialogProviderProps) {
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const openCard = (card: ScryfallCard) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };

  // Determina o estado da carta no deck
  const cardState = useMemo(() => {
    if (!selectedCard) return null;

    const isCommander = commander?.card?.id === selectedCard.id;
    const isInDeck = deckItems.some(item => item.card?.id === selectedCard.id);
    const hasCommander = commander !== null;

    return {
      isCommander,
      isInDeck,
      hasCommander,
    };
  }, [selectedCard, commander, deckItems]);

  return (
    <CardDialogContext.Provider value={{ selectedCard, openCard, closeCard }}>
      {children}
      {selectedCard && cardState && (() => {
        const imageUris = getImageUris(selectedCard);
        const { isCommander, isInDeck, hasCommander } = cardState;
        console.log('=== DEBUG CARD DIALOG ===');
        console.log('selectedCard:', selectedCard);
        console.log('selectedCard.is_commander:', selectedCard.is_commander);
        console.log('hasCommander:', hasCommander);
        console.log('isCommander (é o commander atual?):', isCommander);
        console.log('isInDeck:', isInDeck);
        console.log('commander?.card?.id:', commander?.card?.id);
        console.log('selectedCard.id:', selectedCard.id);

        // Determina quais opções mostrar
        const isLegendaryCreature = selectedCard.type_line?.includes?.('Legendary Creature');
        const canBeCommander = isLegendaryCreature;
        const showAddAsCommander = !hasCommander && canBeCommander;
        // Mostra "Adicionar ao Deck" se:
        // - Não está no deck (nem como commander, nem em deckItems)
        // - E (não tem commander OU já tem commander mas a carta não é o commander)
        const showAddToDeck = !isInDeck && !isCommander;
        // Mostra "Remover" se a carta está no deck (como commander ou em deckItems)
        const showRemoveFromDeck = isInDeck || isCommander;

        return (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={closeCard}
          >
            <div
              className="relative bg-[#1a1a1f] rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Imagem da carta */}
              <div className="flex-shrink-0 p-4 flex justify-center bg-[#2a2b2f]">
                <img
                  src={imageUris.normal}
                  alt={selectedCard.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              {/*  Preço da carta */}


              {/* Botões de ação */}
              <div className="flex-shrink-0 p-4 border-t border-gray-700 flex flex-col gap-2">
                <p className="text-center">
                  {selectedCard.price ? (() => {
                    const priceNum = parseFloat(selectedCard.price);
                    return `Preço: R$ ${isNaN(priceNum) ? selectedCard.price : priceNum.toFixed(2)}`;
                  })() : 'Preço: N/A'}
                </p>
                {showAddAsCommander && (
                  <button
                    onClick={() => {
                      onAddAsCommander(selectedCard.id);
                      closeCard();
                    }}
                    className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
                  >
                    Adicionar como Commander
                  </button>
                )}

                {showAddToDeck && (
                  <button
                    onClick={() => {
                      onAddCard(selectedCard);
                      closeCard();
                    }}
                    className="px-4 py-2 bg-[#4a5568] hover:bg-[#5a6578] text-white font-semibold rounded-lg transition-colors"
                  >
                    Adicionar ao Deck
                  </button>
                )}

                {showRemoveFromDeck && (
                  <button
                    onClick={() => {
                      onRemoveCard(selectedCard.id);
                      closeCard();
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isCommander ? 'Remover Commander' : 'Remover do Deck'}
                  </button>
                )}

                <button
                  onClick={closeCard}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
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