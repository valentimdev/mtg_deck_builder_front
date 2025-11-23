import React, { useState } from 'react';
import type { DeckItem } from '../types/deck';
import { useCardDialog } from '@/contexts/CardDialogContext';
import { getImageUris, isCardCompatibleWithCommander } from '@/services/scryfall';

interface DeckListProps {
  commander: DeckItem | null;
  deckItems: DeckItem[];
  loading: boolean;
  error: string | null;
  totalCards: number;
  removeDeckItem: (index: number) => void;
}

function DeckList({
  commander,
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
        {/* Slot do Comandante */}
        {commander && (
          <div className="mb-4 pb-4 border-b border-gray-600">
            <h3 className="text-sm font-semibold text-[#b896ff] mb-2 uppercase">Comandante</h3>
            {(() => {
              const imageUris = commander.card ? getImageUris(commander.card) : null;
              return (
                <div
                  className="relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg border-2 border-[#b896ff] cursor-pointer overflow-visible"
                  style={{
                    backgroundImage: imageUris?.art_crop
                      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUris.art_crop})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                  }}
                  onMouseEnter={() => {
                    if (commander.card?.id) {
                      setHoveredCardId(commander.card.id);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredCardId(null);
                  }}
                  onMouseMove={handleMouseMove}
                  onClick={() => {
                    if (commander.card) {
                      openCard(commander.card);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#b896ff] font-bold min-w-8">
                      {commander.quantity}x
                    </span>
                    <span className={commander.loading ? 'text-gray-400' : 'font-semibold'}>
                      {commander.cardName}
                    </span>
                    {commander.loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#b896ff]"></div>
                    )}
                    {commander.error && (
                      <span className="text-red-400 text-sm">⚠️</span>
                    )}
                  </div>

                  {hoveredCardId === commander.card?.id &&
                    imageUris?.normal &&
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
                            src={imageUris.normal}
                            alt={commander.card.name}
                            className="w-60 rounded-lg shadow-2xl"
                          />
                        </div>
                      );
                    })()}
                </div>
              );
            })()}
          </div>
        )}

        {/* Deck Principal */}
        <ul className="space-y-2">
          {deckItems.map((deckItem, index) => {
            const imageUris = deckItem.card ? getImageUris(deckItem.card) : null;
            const isCompatible = isCardCompatibleWithCommander(deckItem.card, commander?.card || null);
            return (
            <li
              key={`${deckItem.cardName}-${index}`}
              className={`relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg cursor-pointer overflow-visible ${
                isCompatible
                  ? 'border border-gray-500'
                  : 'border-2 border-yellow-500 bg-yellow-900/20'
              }`}
              style={{
                backgroundImage: imageUris?.art_crop
                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUris.art_crop})`
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
              <div className="flex items-center gap-3 flex-1">
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
                {!isCompatible && deckItem.card && (
                  <span
                    className="text-yellow-400 text-xs font-semibold bg-yellow-500/20 px-2 py-1 rounded"
                    title="Esta carta tem cores diferentes do seu comandante"
                  >
                    ⚠️ Cores incompatíveis
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeDeckItem(index);
                }}
                className="rounded text-sm font-bold "
                title="Remover carta"
              >
                &times;
              </button>

              {hoveredCardId === deckItem.card?.id &&
                imageUris?.normal &&
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
                        src={imageUris.normal}
                        alt={deckItem.card.name}
                        className="w-60 rounded-lg shadow-2xl"
                      />
                    </div>
                  );
                })()}
            </li>
            );
          })}
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
