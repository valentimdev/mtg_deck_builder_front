import type { DeckItem } from '../types/deck';

interface CardGridProps {
  deckItems: DeckItem[];
  loading?: boolean;
  onCardClick?: (card: DeckItem) => void;
}

function CardGrid({ deckItems, loading = false, onCardClick }: CardGridProps) {
  const loadedCards = deckItems.filter(
    (item) => item.card !== null && !item.loading && !item.error
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2a2b2f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b896ff] mx-auto"></div>
          <p className="mt-4 text-gray-400 text-white">Carregando cartas...</p>
        </div>
      </div>
    );
  }

  if (loadedCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2a2b2f]">
        <p className="text-gray-400 text-white">
          {deckItems.some((item) => item.loading)
            ? 'Carregando cartas do deck...'
            : 'Nenhuma carta carregada'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#2a2b2f] relative z-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loadedCards.map((deckItem, index) => {
          const card = deckItem.card!;

          return (
            <div
              key={`${card.id}-${index}`}
              className="relative cursor-pointer z-0"
              onClick={() => onCardClick?.(deckItem)}
            >
              {card.image_uris?.normal ? (
                <div className="relative">
                  <img
                    src={card.image_uris.normal}
                    alt={card.name}
                    className="w-full rounded-lg shadow-lg border-2 border-gray-600"
                    loading="lazy"
                  />
                  {deckItem.quantity > 1 && (
                    <div className="absolute top-2 right-2 bg-[#b896ff] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                      {deckItem.quantity}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[63/88] rounded-lg bg-[#3a3b3f] border-2 border-gray-600 flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm mb-2">{card.name}</p>
                    <p className="text-gray-400 text-xs">{card.type_line}</p>
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
    </div>
  );
}

export default CardGrid;

