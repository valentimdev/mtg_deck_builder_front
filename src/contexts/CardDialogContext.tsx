import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ScryfallCard } from '@/services/scryfall';
import type { DeckItem } from '../types/deck';
import { getImageUris } from '@/services/scryfall';
import { RefreshButton } from '@/components/RefreshButton';
import { CardService } from '@/services/cardService';

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
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const openCard = (card: ScryfallCard) => {
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
  };
    const handleUpdatePrices = async () => {
    if (!selectedCard) return;

    setIsUpdatingPrices(true);
    try {
      const updatedCard = await CardService.syncCard(selectedCard.id);
      setSelectedCard(updatedCard); 
      
    } catch (error) {
      console.error('Erro ao atualizar carta:', error);
    } finally {
      setIsUpdatingPrices(false);
    }
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
              <div className="flex-shrink-0 p-4 border-t border-gray-700 flex flex-col gap-1">
                <div className='flex flex-row justify-center gap-1'>
                <p className="text-center">
                  {selectedCard.price ? (() => {
                    const priceNum = parseFloat(selectedCard.price);
                    return `Estimativa de Preço: R$ ${isNaN(priceNum) ? selectedCard.price : priceNum.toFixed(2)}`;
                  })() : 'Estimativa de Preço: N/A'}
                </p>
                <RefreshButton 
                isLoading={isUpdatingPrices}
                onClick={handleUpdatePrices}
                videoSrc="/refresh.webm"
                className="w-6 h-6" 
                />


                </div>
                <div className="flex justify-center mt-1">
                <button
                      onClick={() => window.open(`https://www.ligamagic.com.br/?view=cards/card&card=${encodeURIComponent(selectedCard.name)}`, '_blank', 'noopener,noreferrer')}
                      className="px-4 py-2  font-semibold rounded-lg transition-colors"
                    >
                      Ver no Liga Magic
                    </button>
                </div>
                {showAddAsCommander && (
                  <button
                    onClick={() => {
                      onAddAsCommander(selectedCard.id);
                      closeCard();
                    }}
                    className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
                  >
                    Adicionar como Comandante
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
                    {isCommander ? 'Remover Comandante' : 'Remover do Deck'}
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