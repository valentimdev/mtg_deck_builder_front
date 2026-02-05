import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import DeckList from '../components/DeckList';
import CardGrid from '../components/CardGrid';
import { useDeck } from '../hooks/useDeck';
import type { ScryfallCard } from "@/services/scryfall";
import { CardDialogProvider } from '../contexts/CardDialogContext';
import { useParams, useNavigate } from 'react-router-dom';
import { DeckService } from '@/services/deckService';
type ViewMode = 'deck' | 'meta' | 'search';

export default function DeckBuilderPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();
    const deckState = useDeck(deckId ? parseInt(deckId) : null);
    const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [, setCardGridViewMode] = useState<ViewMode>('deck');



    if (deckState.error) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#2a2b2f]">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">Erro ao carregar deck</p>
                    <p className="text-gray-400 mb-4">{deckState.error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
                    >
                        Voltar para Decks
                    </button>
                </div>
            </div>
        );
    }
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

    const handleExportTxt = async () => {
        if (!deckId) {
            return;
        }

        try {
            const deckData = await DeckService.getById(parseInt(deckId));
            const blob = await DeckService.exportTxt(parseInt(deckId));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${deckData.name}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao exportar deck:', err);
            alert(err instanceof Error ? err.message : 'Erro ao exportar deck');
        }
    };

    return (
        <CardDialogProvider
            commander={deckState.commander}
            deckItems={deckState.deckItems}
            onAddCard={handleAddCard}
            onAddAsCommander={handleAddAsCommander}
            onRemoveCard={handleRemoveCard}
        >
        <div className="flex w-full h-full bg-[#2a2b2f]">
            <div className="h-full w-80 fixed left-0 top-0 bottom-0 z-20 border-r border-gray-700">
                <DeckList
                    commander={deckState.commander}
                    deckItems={deckState.deckItems}
                    loading={deckState.loading}
                    error={deckState.error}
                    totalCards={deckState.totalCards}
                    removeDeckItem={deckState.removeDeckItem}
                    onAddCard={handleAddCard}
                />
            </div>

            <div className="flex flex-col flex-1 h-full ml-80 bg-[#2a2b2f]">
                <div className="w-full h-30 shrink-0 flex items-center mt-8 px-4 relative">
                    <div className="flex-1 flex justify-center">
                        <div className="max-w-lg w-full">
                            <SearchBar
                                onCardSelect={handleAddCard}
                                onSearch={handleSearch}
                            />
                        </div>
                    </div>
                    {/* Botões no final à direita */}
                    <div className=" flex gap-2 px-2">
                        <button
                            onClick={handleExportTxt}
                            className="px-4 py-2 bg-[#4a5568] hover:bg-[#5a6578] text-white font-semibold rounded-lg transition-colors border border-gray-600 whitespace-nowrap"
                            title="Exportar deck como TXT"
                        >
                            Exportar TXT
                        </button>
                        <button
                            onClick={handleBackToDecks}
                            className="px-4 py-2 bg-[#2a2b2f] hover:bg-[#3a3b3f] text-white font-semibold rounded-lg transition-colors border border-gray-600 whitespace-nowrap"
                        >
                            Voltar para Deck
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full overflow-hidden">
                    <CardGrid
                        deckItems={deckState.deckItems}
                        commander={deckState.commander}
                        loading={deckState.loading}
                        searchResults={searchResults}
                        searchQuery={searchQuery}
                        onViewModeChange={setCardGridViewMode}
                        onAddCard={handleAddCard}
                    />
                </div>
            </div>
        </div>
        </CardDialogProvider>
    );
}

