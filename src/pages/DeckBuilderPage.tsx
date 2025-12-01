import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import DeckList from '../components/DeckList';
import CardGrid from '../components/CardGrid';
import { useDeck } from '../hooks/useDeck';
import type { ScryfallCard } from "@/services/scryfall";
import { CardDialogProvider } from '../contexts/CardDialogContext';
import { useParams, useNavigate } from 'react-router-dom';

type ViewMode = 'deck' | 'meta' | 'search';

export default function DeckBuilderPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const deckState = useDeck(deckId ? parseInt(deckId) : null);
    const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cardGridViewMode, setCardGridViewMode] = useState<ViewMode>('deck');

    const handleAddCard = (card: ScryfallCard) => {
        deckState.addCardByCard(card, 1);
    };

    const handleAddAsCommander = (cardId: string) => {
        deckState.addCardAsCommander(cardId);
    };

    const handleRemoveCard = (cardId: string) => {
        deckState.removeCardById(cardId);
    };

    const handleSearch = (query: string, results: ScryfallCard[]) => {
        setSearchQuery(query);
        setSearchResults(results);
        setCardGridViewMode('search');
    };

    const handleBackToDecks = () => {
        navigate('/');
    };

    return (
        <CardDialogProvider
            commander={deckState.commander}
            deckItems={deckState.deckItems}
            onAddCard={handleAddCard}
            onAddAsCommander={handleAddAsCommander}
            onRemoveCard={handleRemoveCard}
        >
        <div className="flex w-full h-full">
            {/* Botão de voltar */}
            <button
                onClick={handleBackToDecks}
                className="fixed top-4 left-4 z-30 px-4 py-2 bg-[#2a2b2f] hover:bg-[#3a3b3f] text-white font-semibold rounded-lg transition-colors border border-gray-600"
            >
                ← Voltar para Decks
            </button>

            <div className="border border-amber-400 h-full w-80 fixed left-0 top-0 bottom-0 z-20">
                <DeckList commander={deckState.commander} {...deckState} />
            </div>

            <div className="flex flex-col flex-1 h-full ml-80">
                <div className="border border-blue-500 w-full h-30 shrink-0">
                    <SearchBar
                        onCardSelect={handleAddCard}
                        onSearch={handleSearch}
                    />
                </div>

                <div className="flex-1 border border-green-500 w-full overflow-hidden">
                    <CardGrid
                        deckItems={deckState.deckItems}
                        commander={deckState.commander}
                        loading={deckState.loading}
                        searchResults={searchResults}
                        searchQuery={searchQuery}
                        onViewModeChange={setCardGridViewMode}
                    />
                </div>
            </div>
        </div>
        </CardDialogProvider>
    );
}

