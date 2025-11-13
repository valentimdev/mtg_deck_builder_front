import SearchBar from './components/SearchBar';
import DeckList from './components/DeckList';
import CardGrid from './components/CardGrid';
import { useDeck } from './hooks/useDeck';
import type {ScryfallCard} from "@/services/scryfall";
import { CardDialogProvider } from './contexts/CardDialogContext';

function App() {
    const deckState = useDeck();

    const handleAddCard = (card: ScryfallCard) => {
        deckState.addDeckItem(card.name, 1);
    };

    return (
        <CardDialogProvider>
        <div className="flex w-full h-full">
            <div className="border border-amber-400 h-full w-80 fixed left-0 top-0 bottom-0 z-20">
                <DeckList {...deckState} />
            </div>

            <div className="flex flex-col flex-1 h-full ml-80">
                <div className="border border-blue-500 w-full h-30 shrink-0">
                    <SearchBar onCardSelect={handleAddCard} />
                </div>

                <div className="flex-1 border border-green-500 w-full overflow-hidden">
                    <CardGrid deckItems={deckState.deckItems} loading={deckState.loading} />
                </div>
            </div>
        </div>
        </CardDialogProvider>
    );
}

export default App;
