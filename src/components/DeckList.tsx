import React, { useState } from 'react';
import type { DeckItem } from '../types/deck';

interface DeckListProps {
  deckItems: DeckItem[];
  loading: boolean;
  error: string | null;
  totalCards: number;
  removeDeckItem: (index: number) => void;
}

function DeckList({
  deckItems,
  loading: deckLoading,
  error: deckError,
  totalCards,
  removeDeckItem,
}: DeckListProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (deckLoading) {
    return (
      <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-6">
        <h2 className="text-2xl font-bold text-[#b896ff] mb-4 shrink-0">
          Carregando Deck...
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b896ff] mx-auto"></div>
            <p className="mt-4 text-gray-400">Buscando cartas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (deckError) {
    return (
      <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-6">
        <h2 className="text-2xl font-bold text-red-500 mb-4 shrink-0">
          Erro ao Carregar Deck
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-center">{deckError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-6 relative z-10">
      <h2 className="text-2xl font-bold text-[#b896ff] mb-4 shrink-0">
        Meu Deck ({totalCards})
      </h2>

      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <ul className="space-y-3">
          {deckItems.map((deckItem, index) => (
            <li
              key={`${deckItem.cardName}-${index}`}
              className="relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg border border-gray-500 cursor-pointer overflow-visible"
              onMouseEnter={() => {
                if (deckItem.card?.id) {
                  setHoveredCardId(deckItem.card.id);
                }
              }}
              onMouseLeave={() => {
                setHoveredCardId(null);
              }}
              onMouseMove={handleMouseMove}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#b896ff] font-bold min-w-8">
                  {deckItem.quantity}x
                </span>
                <span className={deckItem.loading ? 'text-gray-400' : ''}>
                  {deckItem.cardName}
                </span>
                {deckItem.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#b896ff]"></div>
                )}
                {deckItem.error && (
                  <span className="text-red-400 text-sm">⚠️</span>
                )}
              </div>

              <button
                onClick={() => removeDeckItem(index)}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-lg font-bold"
                title="Remover carta"
              >
                &times;
              </button>

              {hoveredCardId === deckItem.card?.id &&
                deckItem.card?.image_uris?.normal && (
                  <div
                    className="fixed pointer-events-none"
                    style={{
                      left: mousePosition.x + 10,
                      top: mousePosition.y - 150,
                      zIndex: 9999,
                    }}
                  >
                    <img
                      src={deckItem.card.image_uris.normal}
                      alt={deckItem.card.name}
                      className="w-60 rounded-lg shadow-2xl"
                      onLoad={() =>
                        console.log('Imagem carregada:', deckItem.card?.name)
                      }
                      onError={() =>
                        console.log(
                          'Erro ao carregar imagem:',
                          deckItem.card?.name
                        )
                      }
                    />
                  </div>
                )}
            </li>
          ))}
        </ul>

        {deckItems.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">Deck vazio</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeckList;
