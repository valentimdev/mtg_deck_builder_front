import React, { useState } from 'react';
import type { DeckItem } from '../types/deck';
import { useCardDialog } from '@/contexts/CardDialogContext';

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
  const { openCard } = useCardDialog();
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (deckLoading) {
    return (
      <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-6">
        <h2 className="text-2xl font-bold text-(--text-dark) mb-4 shrink-0">
          Carregando Deck...
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--text-dark) mx-auto"></div>
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
    <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-2 relative ">
      <h2 className="text-2xl font-bold text-(--text-dark) mb-4 shrink-0 self-center">
        Meu Deck ({totalCards})
      </h2>

      <div className="flex-1 overflow-y-auto overflow-x-visible pr-1 border border-white">
        <ul className="space-y-2">
          {deckItems.map((deckItem, index) => (
            <li
              key={`${deckItem.cardName}-${index}`}
              className="relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg border border-gray-500 cursor-pointer overflow-visible"
              style={{
                backgroundImage: deckItem.card?.image_uris?.art_crop
                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${deckItem.card.image_uris.art_crop})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
                backgroundRepeat: 'no-repeat',
              }}
              onMouseEnter={() => {
                if (deckItem.card?.id) {
                  setHoveredCardId(deckItem.card.id);
                }
              }}
              onMouseLeave={() => {
                setHoveredCardId(null);
              }}
              onMouseMove={handleMouseMove}
              onClick={() => {
                if (deckItem.card) {
                  openCard(deckItem.card);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-(--text-dark) font-bold min-w-8">
                  {deckItem.quantity}x
                </span>
                <span className={deckItem.loading ? 'text-gray-400' : ''}>
                  {deckItem.cardName}
                </span>
                {deckItem.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-(--text-dark)"></div>
                )}
                {deckItem.error && (
                  <span className="text-red-400 text-sm">⚠️</span>
                )}
              </div>

              <button
                onClick={() => removeDeckItem(index)}
                className="rounded text-sm font-bold "
                title="Remover carta"
              >
                &times;
              </button>

              {hoveredCardId === deckItem.card?.id &&
                deckItem.card?.image_uris?.normal &&
                (() => {
                  const cardWidth = 240;
                  const cardHeight = cardWidth * 1.4;
                  const offset = 10;
                  const viewportHeight = window.innerHeight;

                  let finalTop = mousePosition.y - cardHeight / 2;

                  if (finalTop < offset) {
                    finalTop = offset;
                  }

                  if (finalTop + cardHeight + offset > viewportHeight) {
                    finalTop = viewportHeight - cardHeight - offset;
                  }

                  const cardStyle: React.CSSProperties = {
                    position: 'fixed',
                    left: mousePosition.x + 10,
                    top: finalTop,
                    zIndex: 9999,
                    pointerEvents: 'none',
                  };

                  return (
                    <div style={cardStyle}>
                      <img
                        src={deckItem.card.image_uris.normal}
                        alt={deckItem.card.name}
                        className="w-60 rounded-lg shadow-2xl"
                      />
                    </div>
                  );
                })()}
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
