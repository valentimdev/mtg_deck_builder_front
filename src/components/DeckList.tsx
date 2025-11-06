import React, { useState, useEffect } from "react";
import mockCard from "../data/mock.json"; // importa o JSON local

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

  useEffect(() => {
    // Simula carregamento inicial
    const deckData: DeckItem[] = [{ card: mockCard as Card, quantity: 1 }];
    setCards(deckData);
  }, []);

  const handleRemove = (card: Card) => {
    setCards((prev) => prev.filter((item) => item.card.id !== card.id));
  };

  const totalCards = cards.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative flex flex-col h-screen bg-[#2a2b2f] text-white p-6">
      <h2 className="text-2xl font-bold text-[#b896ff] mb-4">
        Meu Deck ({totalCards})
      </h2>

      <ul className="space-y-3">
        {cards.map((deckItem) => (
          <li
            key={deckItem.card.id}
            className="relative flex justify-between items-center p-3 bg-[#3a3b3f] rounded-lg border border-gray-500 cursor-pointer"
            onMouseEnter={() => setHoveredCardId(deckItem.card.id)}
            onMouseLeave={() => setHoveredCardId(null)}
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
                <div className="absolute left-[110%] top-1/2 -translate-y-1/2 z-50">
                  <img
                    src={deckItem.card.image_uris.normal}
                    alt={deckItem.card.name}
                    className="w-48 rounded-lg shadow-2xl border border-gray-600"
                  />
                </div>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeckList;
