import { useState, useEffect } from 'react';
import type { ScryfallCard } from '../services/scryfall';
import { scryfallService } from '../services/scryfall';

export type DeckItem = {
  quantity: number;
  card: ScryfallCard | null;
  cardName: string;
  loading: boolean;
  error: string | null;
};

export function useDeck() {
  const [deckItems, setDeckItems] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeckFromTxt = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carrega o arquivo mock.txt da pasta public
      const response = await fetch('/mock.txt');
      if (!response.ok) {
        throw new Error('Não foi possível carregar o arquivo mock.txt');
      }

      const txtContent = await response.text();
      const lines = txtContent.split('\n').filter((line) => line.trim());

      // Parse das linhas no formato "quantidade nome_da_carta"
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
        .filter(Boolean);

      // Inicializa os items do deck com loading state
      const initialDeckItems: DeckItem[] = deckEntries.map((entry) => ({
        quantity: entry!.quantity,
        cardName: entry!.cardName,
        card: null,
        loading: true,
        error: null,
      }));

      setDeckItems(initialDeckItems);

      // Faz fetch das cartas uma por uma
      for (let i = 0; i < initialDeckItems.length; i++) {
        const item = initialDeckItems[i];

        try {
          // Delay pequeno para respeitar rate limit da API
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 150));
          }

          const card = await scryfallService.getCardByName(item.cardName);

          setDeckItems((prev) =>
            prev.map((prevItem, index) =>
              index === i
                ? { ...prevItem, card, loading: false, error: null }
                : prevItem
            )
          );
        } catch (error) {
          console.error(`Erro ao buscar carta "${item.cardName}":`, error);

          setDeckItems((prev) =>
            prev.map((prevItem, index) =>
              index === i
                ? {
                    ...prevItem,
                    card: null,
                    loading: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Erro desconhecido',
                  }
                : prevItem
            )
          );
        }
      }
    } catch (error) {
      console.error('Erro ao carregar deck:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao carregar deck'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeDeckItem = (index: number) => {
    setDeckItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addDeckItem = (cardName: string, quantity = 1) => {
    const newItem: DeckItem = {
      quantity,
      cardName,
      card: null,
      loading: true,
      error: null,
    };

    setDeckItems((prev) => [...prev, newItem]);

    // Fetch da nova carta
    scryfallService
      .getCardByName(cardName)
      .then((card) => {
        setDeckItems((prev) =>
          prev.map((item) =>
            item === newItem
              ? { ...item, card, loading: false, error: null }
              : item
          )
        );
      })
      .catch((error) => {
        setDeckItems((prev) =>
          prev.map((item) =>
            item === newItem
              ? {
                  ...item,
                  card: null,
                  loading: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Erro desconhecido',
                }
              : item
          )
        );
      });
  };

  const getTotalCards = () => {
    return deckItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getLoadedCards = () => {
    return deckItems.filter((item) => item.card !== null);
  };

  useEffect(() => {
    loadDeckFromTxt();
  }, []);

  return {
    deckItems,
    loading,
    error,
    loadDeckFromTxt,
    removeDeckItem,
    addDeckItem,
    getTotalCards,
    getLoadedCards,
  };
}
