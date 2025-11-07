import React, { useState, useEffect } from 'react';
import mockCard from '../data/mock.json';

type Card = {
  id: string;
  name: string;
  oracle_text?: string;
  image_uris?: {
    normal: string;
  };
};

type DeckItem = {
  card: Card;
  quantity: number;
};

function DeckList() {
  const [cards, setCards] = useState<DeckItem[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const deckData: DeckItem[] = [{ card: mockCard as Card, quantity: 1 }];
    setCards(deckData);
  }, []);

  const handleRemove = (card: Card) => {
    setCards((prev) => prev.filter((item) => item.card.id !== card.id));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const totalCards = cards.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-[#2a2b2f] text-white p-6">
      <h2 className="text-2xl font-bold text-[#b896ff] mb-4 shrink-0">
        Meu Deck ({totalCards})
      </h2>

      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <ul className="space-y-3">
          {cards.map((deckItem) => (
            <li
              key={deckItem.card.id}
              className="relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg border border-gray-500 cursor-pointer overflow-visible"
              onMouseEnter={() => {
                console.log('Hover entered:', deckItem.card.name);
                setHoveredCardId(deckItem.card.id);
              }}
              onMouseLeave={() => {
                console.log('Hover left:', deckItem.card.name);
                setHoveredCardId(null);
              }}
              onMouseMove={handleMouseMove}
            >
              <span>{deckItem.card.name}</span>

              <button
                onClick={() => handleRemove(deckItem.card)}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-lg font-bold"
              >
                &times;
              </button>

              {hoveredCardId === deckItem.card.id &&
                deckItem.card.image_uris?.normal && (
                  <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                      left: mousePosition.x + 10,
                      top: mousePosition.y - 150,
                    }}
                  >
                    <img
                      src={deckItem.card.image_uris.normal}
                      alt={deckItem.card.name}
                      className="w-60 rounded-lg shadow-2xl"
                      onLoad={() =>
                        console.log('Imagem carregada:', deckItem.card.name)
                      }
                      onError={() =>
                        console.log(
                          'Erro ao carregar imagem:',
                          deckItem.card.name
                        )
                      }
                    />
                  </div>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DeckList;
