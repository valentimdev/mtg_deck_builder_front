import { useState } from 'react';
import SearchBar from './components/SearchBar';
import DeckList from './components/DeckList';
import CardGrid from './components/CardGrid';
import { useDeck } from './hooks/useDeck';
import type { ScryfallCard } from "@/services/scryfall";
import { CardDialogProvider } from './contexts/CardDialogContext';

type ViewMode = 'deck' | 'meta' | 'search';

function App() {
    const deckState = useDeck();
    const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cardGridViewMode, setCardGridViewMode] = useState<ViewMode>('deck');

    const handleAddCard = (card: ScryfallCard) => {
        deckState.addDeckItem(card.name, 1);
    };

    const handleSearch = (query: string, results: ScryfallCard[]) => {
        setSearchQuery(query);
        setSearchResults(results);
        setCardGridViewMode('search');
    };

    return (
        <CardDialogProvider>
        <div className="flex w-full h-full">
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

export default App;
