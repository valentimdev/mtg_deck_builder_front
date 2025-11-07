import { useState, useEffect } from 'react';
import { scryfallService } from '../services/scryfall';
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

      for (let i = 0; i < initialDeckItems.length; i++) {
        const item = initialDeckItems[i];

        try {
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

  // Calcula total de cartas
  const totalCards = deckItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    loadDeckFromTxt();
  }, []);

  return {
    // Estado
    deckItems,
    loading,
    error,
    totalCards,
    // Ações
    loadDeckFromTxt,
    removeDeckItem,
    addDeckItem,
    reloadDeck: loadDeckFromTxt, // Alias para compatibilidade
  };
}
