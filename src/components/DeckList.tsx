import React, { useState } from 'react'; // Precisamos do useState para guardar os dados


type Card = {
  id: string;
  name: string;
  oracle_text?: string;
};

type DeckItem = {
  card: Card;
  quantity: number;
};

const mockDeckData: DeckItem[] = [
  {
    card: { id: 'eriette-id', name: 'Eriette of the Charmed Apple', oracle_text: '...' },
    quantity: 1
  },
  {
    card: { id: 'sol-ring-id', name: 'Sol Ring', oracle_text: 'T: Add {C}{C}.' },
    quantity: 2
  }
];

function DeckList() {
  
  const [cards, setCards] = useState(mockDeckData);
  const [stats, setStats] = useState(null); // (Deixamos os stats nulos por enquanto)
  const [isLoading, setIsLoading] = useState(false); // (Fingimos que já carregou)

  const totalCards = cards.reduce((total, item) => total + item.quantity, 0);

  

  const handleRemove = (card: Card) => console.log('Remover:', card.name);

  return (
    <div className="p-4 h-full bg-[#2a2b2f] text-[--text-dark] flex flex-col">
      <h2 className="text-2xl font-bold text-[--color-secondary] mb-4">
        Meu Deck ({totalCards})
      </h2>
      




      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p>Carregando...</p>
        ) : cards.length === 0 ? (
          <p>Seu deck está vazio.</p>
        ) : (

          <ul className="space-y-2">
            {cards.map((deckItem) => (
              <li 
                key={deckItem.card.id}
                className="flex justify-between items-center p-2 bg-[#3a3b3f] rounded-lg border border-[--color-tertiary]"
              >
                <div className="overflow-hidden whitespace-nowrap overflow-ellipsis pr-2">
                  <span>
                    {deckItem.card.name}
                  </span>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button onClick={() => handleRemove(deckItem.card)} className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-lg font-bold"> &times; </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DeckList;
