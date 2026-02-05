import React, { useState, useEffect, useCallback } from 'react';
import type { DeckItem } from '../types/deck';
import type { BackendCard } from '@/services/scryfall';
import { useCardDialog } from "@/contexts/CardDialogContext";
import { getImageUris, isCardCompatibleWithCommander, isBasicLand } from '@/services/scryfall';
import { commanderService, type MetaCardsByCategory } from '@/services/scryfall/commanderService';
import LoadingOverlay from './LoadingOverlay';
type ViewMode = 'deck' | 'meta' | 'search';

interface CardGridProps {
  deckItems: DeckItem[];
  commander: DeckItem | null;
  loading?: boolean;
  searchResults?: BackendCard[];
  searchQuery?: string;
  onViewModeChange?: (mode: ViewMode) => void;
  onCardClick?: (card: DeckItem) => void;
  onAddCard?: (card: BackendCard) => void;
}

function CardGrid({
    deckItems,
    commander,
    loading = false,
    searchResults = [],
    searchQuery = '',
    onViewModeChange,
    onAddCard,
}: CardGridProps) {
    const { openCard } = useCardDialog();

    const handleCardClick = (card: BackendCard) => {
            openCard(card);
    };
    const [viewMode, setViewMode] = useState<ViewMode>('deck');
    const viewModeRef = React.useRef<ViewMode>('deck');
    const [metaCardsByCategory, setMetaCardsByCategory] = useState<MetaCardsByCategory>({});
    const [topCommanders, setTopCommanders] = useState<BackendCard[]>([]);
    const [metaLoading, setMetaLoading] = useState(false);
    const loadingRef = React.useRef(false);

    useEffect(() => {
        if (searchResults.length > 0 && searchQuery) {
            setViewMode('search');
            viewModeRef.current = 'search';
            if (onViewModeChange) {
                onViewModeChange('search');
            }
        }
    }, [searchResults, searchQuery, onViewModeChange]);

    const loadedCards = deckItems.filter(
        (item) => item.card !== null && !item.loading && !item.error
    );


    const isCardInDeck = (cardId: string): { inDeck: boolean; quantity?: number } => {

      if (commander?.card?.id === cardId) {
          return { inDeck: true, quantity: commander.quantity };
      }

      const deckItem = deckItems.find(item => item.card?.id === cardId);
      if (deckItem) {
          return { inDeck: true, quantity: deckItem.quantity };
      }
      return { inDeck: false };
    };

    const loadMetaCards = useCallback(async () => {
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setMetaLoading(true);
        setMetaCardsByCategory({});
        setTopCommanders([]);

        try {
            if (commander?.cardName) {
                const metaCards = await commanderService.getAllMetaCards(commander.cardName);
                setMetaCardsByCategory(metaCards);
                setTopCommanders([]);
                loadedCommanderRef.current = commander.cardName;
            } else {
                const commanders = await commanderService.getTopCommanders();
                setTopCommanders(commanders);
                setMetaCardsByCategory({});
                hasLoadedTopCommandersRef.current = true;
            }
        } catch (error) {
            console.error('Erro ao carregar meta cards:', error);
            setMetaCardsByCategory({});
            setTopCommanders([]);
        } finally {
            setMetaLoading(false);
            loadingRef.current = false;
        }
    }, [commander?.cardName]);



    const loadedCommanderRef = React.useRef<string | null>(null);
    const hasLoadedTopCommandersRef = React.useRef(false);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        viewModeRef.current = mode;
        if (onViewModeChange) {
            onViewModeChange(mode);
        }
        if (mode === 'meta') {
            const currentCommanderName = commander?.cardName || null;
            const needsReload =
                (commander?.cardName && loadedCommanderRef.current !== currentCommanderName) ||
                (!commander?.cardName && !hasLoadedTopCommandersRef.current);

            if (needsReload && !loadingRef.current) {
                loadMetaCards();
            }
        }
    };


    useEffect(() => {
        if (viewModeRef.current === 'meta' && !loadingRef.current) {
            const currentCommanderName = commander?.cardName || null;
            if (loadedCommanderRef.current !== currentCommanderName) {
                loadMetaCards();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commander?.cardName]);

    const isLoading = viewMode === 'deck' ? loading : viewMode === 'meta' ? metaLoading : false;


    const categoryOrder = [
        "Basic Lands", // Basic Lands sempre no topo
        'Top Cards',
        'High Synergy Cards',
        'New Cards',
        'Game Changers',
        'Creatures',
        'Instants',
        'Sorceries',
        'Enchantments',
        'Planeswalkers',
        'Utility Artifacts',
        'Mana Artifacts',
        'Utility Lands',
        'Battles',
    ];

  return (
    <div className="h-full flex flex-col bg-[#2a2b2f] relative z-0">
      {/* Tabs para alternar entre visualizações */}
      <div className="flex flex-row items-stretch gap-3 shrink-0 px-6 pt-4">
        <button
          onClick={() => handleViewModeChange('deck')}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            viewMode === 'deck'
              ? 'bg-[#3a3b3f] text-white border-b-2 border-[#b896ff]'
              : 'text-gray-400 hover:text-white hover:bg-[#3a3b3f]'
          }`}
        >
          Meu Deck
        </button>
        <button
          onClick={() => handleViewModeChange('search')}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            viewMode === 'search'
              ? 'bg-[#3a3b3f] text-white border-b-2 border-[#b896ff]'
              : 'text-gray-400 hover:text-white hover:bg-[#3a3b3f]'
          }`}
        >
          Pesquisa {searchQuery && `(${searchQuery})`}
        </button>
        <button
          onClick={() => handleViewModeChange('meta')}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            viewMode === 'meta'
              ? 'bg-[#3a3b3f] text-white border-b-2 border-[#b896ff]'
              : 'text-gray-400 hover:text-white hover:bg-[#3a3b3f]'
          }`}
        >
          Meta
        </button>
      </div>

      {/* Conteúdo do grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <LoadingOverlay
            message={viewMode === 'deck' ? 'Carregando cartas do deck...' : 'Carregando cartas meta...'}
            fullScreen={false}
          />
      </div>
        ) : viewMode === 'deck' ? (
          loadedCards.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">
                {deckItems.some((item) => item.loading)
                  ? 'Carregando cartas do deck...'
                  : 'Nenhuma carta carregada'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {loadedCards.map((deckItem, index) => {
                const card = deckItem.card!;
                const imageUris = getImageUris(card);
                const isCompatible = isCardCompatibleWithCommander(card, commander?.card || null);

                return (
                  <div
                    key={`${card.id}-${index}`}
                    className="relative cursor-pointer z-0"
                    onClick={() => handleCardClick(card)}
                  >
                    {imageUris.normal ? (
                      <div className="relative">
                        <img
                          src={imageUris.normal}
                          alt={card.name}
                          className={`w-full rounded-lg shadow-lg ${
                            isCompatible
                              ? 'border-2 border-gray-600'
                              : 'border-2 border-yellow-500'
                          }`}
                          loading="lazy"
                        />

                        {deckItem.quantity > 1 && (
                          <div className="absolute top-2 right-2 bg-[#b896ff] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                            {deckItem.quantity}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-full aspect-[63/88] rounded-lg bg-[#3a3b3f] flex items-center justify-center p-4 ${
                        isCompatible
                          ? 'border-2 border-gray-600'
                          : 'border-2 border-yellow-500'
                      }`}>
                        <div className="text-center">
                          {!isCompatible && (
                            <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded mb-2">
                              Cores incompatíveis
                            </div>
                          )}
                          <p className="text-white font-semibold text-sm mb-2">{card.name}</p>
                          {deckItem.quantity > 1 && (
                            <p className="text-[#b896ff] font-bold mt-2">x{deckItem.quantity}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : viewMode === 'search' ? (
          // View Search
          searchResults.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">
                {searchQuery
                  ? 'Nenhum resultado encontrado'
                  : 'Digite na barra de busca e pressione Enter para ver os resultados'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchQuery && (
                <h3 className="text-xl font-bold text-[#b896ff] border-b border-gray-600 pb-2">
                  Resultados para: "{searchQuery}"
                </h3>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map((card, index) => {
                  const imageUris = getImageUris(card);
                  const { inDeck, quantity } = isCardInDeck(card.id);
                  const isBasic = isBasicLand(card);
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className="relative cursor-pointer z-0"
                      onClick={() => handleCardClick(card)}
                    >
                      {imageUris.normal ? (
                        <img
                          src={imageUris.normal}
                          alt={card.name}
                          className={`w-full rounded-lg shadow-lg border-2 border-gray-600 ${
                            inDeck && !isBasic
                              ? 'grayscale contrast-125 brightness-110 border-red-500/50'
                              : 'border-black-500'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[63/88] rounded-lg bg-[#3a3b3f] border-2 border-gray-600 flex items-center justify-center p-4">
                          <div className="text-center">
                            <p className="text-white font-semibold text-sm">{card.name}</p>
                            {inDeck && quantity && (
                              <p className="text-[#b896ff] font-bold mt-2">x{quantity}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          // View Meta - mostra top comandantes se não houver comandante, ou cartas meta se houver
          metaLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b896ff] mx-auto"></div>
                <p className="mt-4 text-white">
                  {commander?.cardName ? 'Carregando cartas meta...' : 'Carregando top comandantes...'}
                </p>
              </div>
            </div>
          ) : !commander?.cardName ? (
            // Mostra top comandantes quando não há comandante
            topCommanders.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Nenhum comandante disponível</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#b896ff] border-b border-gray-600 pb-2">
                  Top Comandantes do Meta
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {topCommanders.map((card, index) => {
                    const imageUris = getImageUris(card);

                    return (
                      <div
                        key={`${card.id}-${index}`}
                        className="relative cursor-pointer z-0"
                        onClick={() => openCard(card)}
                      >
                        {imageUris.normal ? (
                          <img
                            src={imageUris.normal}
                            alt={card.name}
                            className="w-full rounded-lg shadow-lg border-2 border-gray-600"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-[63/88] rounded-lg bg-[#3a3b3f] border-2 border-gray-600 flex items-center justify-center p-4">
                            <div className="text-center">
                              <p className="text-white font-semibold text-sm">{card.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : Object.keys(metaCardsByCategory).length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">
                {commander?.cardName
                  ? 'Nenhuma carta meta disponível para este comandante'
                  : 'Nenhuma carta meta disponível'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {categoryOrder
                .filter(category => metaCardsByCategory[category]?.length > 0)
                .concat(
                  Object.keys(metaCardsByCategory).filter(
                    cat => !categoryOrder.includes(cat)
                  )
                )
                .map((category) => {
                  const cards = metaCardsByCategory[category];
                  if (!cards || cards.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="text-xl font-bold text-[#b896ff] border-b border-gray-600 pb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {cards.map((card, index) => {
                          const imageUris = getImageUris(card);
                          const { inDeck } = isCardInDeck(card.id);
                          const isBasic = isBasicLand(card);
                          return (
                            <div
                              key={`${card.id}-${index}`}
                              className="relative cursor-pointer z-0"
                              onClick={() => handleCardClick(card)}
                            >
                              {imageUris.normal ? (
                                <img
                                  src={imageUris.normal}
                                  alt={card.name}
                                  className={`w-full rounded-lg shadow-lg border-2 border-gray-600 ${
                                    inDeck && !isBasic
                                      ? 'grayscale contrast-125 brightness-110 border-red-500/50'
                                      : 'border-black-500'
                                  }`}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full aspect-[63/88] rounded-lg bg-[#3a3b3f] border-2 border-gray-600 flex items-center justify-center p-4">
                                  <div className="text-center">
                                    <p className="text-white font-semibold text-sm">{card.name}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CardGrid;

