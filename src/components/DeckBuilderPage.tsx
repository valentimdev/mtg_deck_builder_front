import { useState } from 'react';
import SearchBar from './SearchBar';
import CardGrid from './CardGrid';
import DeckList from './DeckList';
import type { DeckItem } from '../types/deck';
import type {ScryfallCard} from "@/services/scryfall";

export default function DeckBuilderPage() {
    const [deckItems, setDeckItems] = useState<DeckItem[]>([]);
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);

    const handleAddCard = (card: ScryfallCard) => {
        setDeckItems((prev) => {
            const existing = prev.find((item) => item.card?.id === card.id);
            if (existing) {
                return prev.map((item) =>
                    item.card?.id === card.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    cardName: card.name,
                    quantity: 1,
                    card,
                    loading: false,
                    error: null,
                },
            ];
        });
    };

    const handleRemoveCard = (index: number) => {
        setDeckItems((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    const totalCards = deckItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex h-screen bg-[#1e1f23] text-white">
            <div className="w-1/3 border-r border-gray-700">
                <DeckList
                    deckItems={deckItems}
                    loading={loading}
                    error={error}
                    totalCards={totalCards}
                    removeDeckItem={handleRemoveCard}
                />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="p-4">
                    <SearchBar onCardSelect={handleAddCard} />
                </div>
                <CardGrid deckItems={deckItems} loading={false} />
            </div>
        </div>
    );
}
