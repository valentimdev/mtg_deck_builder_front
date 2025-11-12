import { useState, useEffect } from 'react';
import { scryfallService } from '@/services/scryfall';
import type { DeckItem, DeckContextValue } from '../types/deck';

export { type DeckItem } from '../types/deck';

export function useDeck(): DeckContextValue {
    const [deckItems, setDeckItems] = useState<DeckItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDeckFromTxt = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/mock.txt');
            if (!response.ok) throw new Error('Não foi possível carregar o arquivo mock.txt');

            const txtContent = await response.text();
            const lines = txtContent.split('\n').filter((line) => line.trim());

            const deckEntries = lines
                .map((line) => {
                    const trimmedLine = line.trim();
                    const spaceIndex = trimmedLine.indexOf(' ');
                    if (spaceIndex === -1) return null;

                    const quantity = parseInt(trimmedLine.substring(0, spaceIndex));
                    const cardName = trimmedLine.substring(spaceIndex + 1);

                    if (isNaN(quantity) || !cardName) return null;
                    return { quantity, cardName };
                })
                .filter(Boolean) as { quantity: number; cardName: string }[];

            const initialDeckItems: DeckItem[] = deckEntries.map((entry) => ({
                quantity: entry.quantity,
                cardName: entry.cardName,
                card: null,
                loading: true,
                error: null,
            }));

            setDeckItems(initialDeckItems);

            for (let i = 0; i < initialDeckItems.length; i++) {
                const item = initialDeckItems[i];

                try {
                    if (i > 0) await new Promise((r) => setTimeout(r, 150));
                    const card = await scryfallService.getCardByName(item.cardName);

                    setDeckItems((prev) =>
                        prev.map((prevItem, index) =>
                            index === i
                                ? { ...prevItem, card, loading: false, error: null }
                                : prevItem
                        )
                    );
                } catch (err) {
                    console.error(`Erro ao buscar carta "${item.cardName}":`, err);
                    setDeckItems((prev) =>
                        prev.map((prevItem, index) =>
                            index === i
                                ? {
                                    ...prevItem,
                                    card: null,
                                    loading: false,
                                    error: err instanceof Error ? err.message : 'Erro desconhecido',
                                }
                                : prevItem
                        )
                    );
                }
            }
        } catch (err) {
            console.error('Erro ao carregar deck:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar deck');
        } finally {
            setLoading(false);
        }
    };

    const removeDeckItem = (index: number) => {
        setDeckItems((prev) => prev.filter((_, i) => i !== index));
    };

    const addDeckItem = (cardName: string, quantity = 1) => {
        setDeckItems((prev) => {
            const existingIndex = prev.findIndex(
                (item) => item.cardName.toLowerCase() === cardName.toLowerCase()
            );

            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity,
                };
                return updated;
            }

            fetchCardData(cardName);

            return [
                ...prev,
                { quantity, cardName, card: null, loading: true, error: null },
            ];
        });
    };

    const fetchCardData = async (cardName: string) => {
        try {
            const card = await scryfallService.getCardByName(cardName);
            setDeckItems((prev) =>
                prev.map((item) =>
                    item.cardName.toLowerCase() === cardName.toLowerCase()
                        ? { ...item, card, loading: false, error: null }
                        : item
                )
            );
        } catch (error) {
            setDeckItems((prev) =>
                prev.map((item) =>
                    item.cardName.toLowerCase() === cardName.toLowerCase()
                        ? {
                            ...item,
                            card: null,
                            loading: false,
                            error:
                                error instanceof Error ? error.message : 'Erro desconhecido',
                        }
                        : item
                )
            );
        }
    };

    const totalCards = deckItems.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        loadDeckFromTxt();
    }, []);

    return {
        deckItems,
        loading,
        error,
        totalCards,
        loadDeckFromTxt,
        removeDeckItem,
        addDeckItem,
        reloadDeck: loadDeckFromTxt,
    };
}
