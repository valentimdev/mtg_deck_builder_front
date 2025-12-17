import React, { useState } from 'react';
import type { DeckItem } from '../types/deck';
import { useCardDialog } from '@/contexts/CardDialogContext';
import { getImageUris, isCardCompatibleWithCommander, isBasicLand } from '@/services/scryfall';
import type { ScryfallCard } from '@/services/scryfall';
import alerta from '/alerta.gif'
interface DeckListProps {
  commander: DeckItem | null;
  deckItems: DeckItem[];
  loading: boolean;
  error: string | null;
  totalCards: number;
  removeDeckItem: (index: number) => void;
  onAddCard?: (card: ScryfallCard) => void;
}

function DeckList({
  commander,
  deckItems,
  loading: deckLoading,
  error: deckError,
  totalCards,
  removeDeckItem,
  onAddCard,
}: DeckListProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showIncompatibleTooltip, setShowIncompatibleTooltip] = useState(false);
  const [showTooManyCardsTooltip, setShowTooManyCardsTooltip] = useState(false);
  const { openCard } = useCardDialog();
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Verifica cartas incompatíveis com o comandante
  const getIncompatibleCards = () => {
    if (!commander?.card) return [];

    const incompatible: Array<{ name: string; quantity: number }> = [];

    deckItems.forEach((deckItem) => {
      if (deckItem.card && !isCardCompatibleWithCommander(deckItem.card, commander.card)) {
        incompatible.push({
          name: deckItem.cardName,
          quantity: deckItem.quantity
        });
      }
    });

    return incompatible;
  };

  // Calcula o preço total e identifica cartas sem preço
  const calculateTotalPrice = () => {
    let total = 0;
    const cardsWithoutPrice: string[] = [];

    // Adiciona o preço do comandante (se não for basic land)
    if (commander?.card) {
      const isCommanderBasicLand = isBasicLand(commander.card);
      if (!isCommanderBasicLand) {
        const price = commander.card.price;
        if (!price || price === 'N/A' || price.trim() === '') {
          cardsWithoutPrice.push(`${commander.quantity}x ${commander.cardName}`);
        } else {
          const priceNum = parseFloat(price);
          if (!isNaN(priceNum)) {
            total += priceNum * commander.quantity;
          } else {
            cardsWithoutPrice.push(`${commander.quantity}x ${commander.cardName}`);
          }
        }
      }
    }

    // Adiciona o preço das cartas do deck (se não forem basic lands)
    deckItems.forEach((deckItem) => {
      if (deckItem.card) {
        const isCardBasicLand = isBasicLand(deckItem.card);
        if (!isCardBasicLand) {
          const price = deckItem.card.price;
          if (!price || price === 'N/A' || price.trim() === '') {
            cardsWithoutPrice.push(`${deckItem.quantity}x ${deckItem.cardName}`);
          } else {
            const priceNum = parseFloat(price);
            if (!isNaN(priceNum)) {
              total += priceNum * deckItem.quantity;
            } else {
              cardsWithoutPrice.push(`${deckItem.quantity}x ${deckItem.cardName}`);
            }
          }
        }
      }
    });

    return { total, cardsWithoutPrice };
  };

  // Calcula estatísticas do deck
  const calculateDeckStats = () => {
    let lands = 0;
    let instants = 0;
    let sorceries = 0;
    let enchantments = 0;
    let creatures = 0;
    let artifacts = 0;

    // Conta o comandante
    if (commander?.card) {
      const typeLine = commander.card.type_line?.toLowerCase() || '';
      if (typeLine.includes('land')) {
        lands += commander.quantity;
      } else if (typeLine.includes('instant')) {
        instants += commander.quantity;
      } else if (typeLine.includes('sorcery')) {
        sorceries += commander.quantity;
      } else if (typeLine.includes('enchantment')) {
        enchantments += commander.quantity;
      } else if (typeLine.includes('creature')) {
        creatures += commander.quantity;
      } else if (typeLine.includes('artifact')) {
        artifacts += commander.quantity;
      }
    }

    // Conta as cartas do deck
    deckItems.forEach((deckItem) => {
      if (deckItem.card) {
        const typeLine = deckItem.card.type_line?.toLowerCase() || '';
        if (typeLine.includes('land')) {
          lands += deckItem.quantity;
        } else if (typeLine.includes('instant')) {
          instants += deckItem.quantity;
        } else if (typeLine.includes('sorcery')) {
          sorceries += deckItem.quantity;
        } else if (typeLine.includes('enchantment')) {
          enchantments += deckItem.quantity;
        } else if (typeLine.includes('creature')) {
          creatures += deckItem.quantity;
        } else if (typeLine.includes('artifact')) {
          artifacts += deckItem.quantity;
        }
      }
    });

    return { lands, instants, sorceries, enchantments, creatures, artifacts };
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

  const incompatibleCards = getIncompatibleCards();
  const hasIncompatibleCards = incompatibleCards.length > 0;
  const hasTooManyCards = totalCards > 100;

  return (
    <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-2 relative ">
      <div className="flex items-center justify-center gap-2 mb-4 shrink-0 relative">
        <h2 className="text-2xl font-bold text-(--text-dark)">
          Meu Deck ({totalCards})
        </h2>
        {(hasIncompatibleCards || hasTooManyCards) && (
          <div
            className="relative"
            onMouseEnter={() => {
              setShowIncompatibleTooltip(true);
              setShowTooManyCardsTooltip(true);
            }}
            onMouseLeave={() => {
              setShowIncompatibleTooltip(false);
              setShowTooManyCardsTooltip(false);
            }}
          >
            <span className="text-yellow-400 text-xl cursor-help"><img src={alerta} className="ml-5 w-15 h-15 -scale-x-100"></img></span>
            {(showIncompatibleTooltip || showTooManyCardsTooltip) && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-64 bg-[#1a1a1f] border-2 border-yellow-500 rounded-lg p-3 z-50 shadow-xl"
                style={{ minWidth: '250px' }}
              >
                <p className="text-yellow-400 font-semibold text-sm mb-2">
                   Deck não está legal!
                </p>
                {hasTooManyCards && (
                  <p className="text-gray-300 text-xs mb-2">
                    O deck contém {totalCards} cartas. O limite legal é de 100 cartas (99 + 1 comandante).
                  </p>
                )}
                {hasIncompatibleCards && (
                  <>
                    {hasTooManyCards && (
                      <p className="text-gray-300 text-xs mb-2">
                        Além disso, o deck contém cartas com cores incompatíveis com o comandante:
                      </p>
                    )}
                    {!hasTooManyCards && (
                      <p className="text-gray-300 text-xs mb-2">
                        O deck contém cartas com cores incompatíveis com o comandante:
                      </p>
                    )}
                    <ul className="text-yellow-300 text-xs space-y-1 max-h-32">
                      {incompatibleCards.map((card, index) => (
                        <li key={index} className="pl-2">
                          • {card.quantity}x {card.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-visible pr-1">
        {/* Slot do Comandante (sempre mostra) */}
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
                    minHeight: '60px',
                    height: '60px',
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
                    Cores incompatíveis
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isBasicLand(deckItem.card) && onAddCard && deckItem.card && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddCard(deckItem.card!);
                    }}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-sm"
                    title="Adicionar mais uma cópia"
                  >
                    +
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDeckItem(index);
                  }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-sm"
                  title={isBasicLand(deckItem.card) ? "Reduzir quantidade" : "Remover carta"}
                >
                  {isBasicLand(deckItem.card) ? '-' : '×'}
                </button>
              </div>

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

      {/* Div de preço total */}
      <div className="mt-2 pt-2 border-t border-gray-600 bg-[#2a2b2f] shrink-0">
        {(() => {
          const { total, cardsWithoutPrice } = calculateTotalPrice();
          const { lands, instants, sorceries, enchantments, creatures, artifacts } = calculateDeckStats();
          return (
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Preço Total:</span>
                <span className="text-lg font-bold text-[#b896ff]">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              {/* Estatísticas do deck */}
              <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Terrenos</span>
                  <span className="text-white font-bold">{lands}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Criaturas</span>
                  <span className="text-white font-bold">{creatures}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Encantamentos</span>
                  <span className="text-white font-bold">{enchantments}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Instantâneas</span>
                  <span className="text-white font-bold">{instants}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Feitiços</span>
                  <span className="text-white font-bold">{sorceries}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-[#3a3b3f] rounded">
                  <span className="text-gray-400 mb-1">Artefatos</span>
                  <span className="text-white font-bold">{artifacts}</span>
                </div>
              </div>
              {cardsWithoutPrice.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-600/50 rounded">
                  <p className="text-xs font-semibold text-yellow-400 mb-1">
                     Cartas sem preço:
                  </p>
                  <ul
                    className="text-xs text-yellow-300 space-y-1 overflow-y-auto pr-1"
                    style={{
                      maxHeight: '40px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#ca8a04 #854d0e'
                    }}
                  >
                    {cardsWithoutPrice.map((cardName, index) => (
                      <li key={index} className="pl-2 whitespace-nowrap">
                        • {cardName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default DeckList;
