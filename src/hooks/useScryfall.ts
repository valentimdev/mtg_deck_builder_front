import { useState, useEffect, useCallback } from 'react';
import type { ScryfallCard, ScryfallSearchResponse } from '@/services/scryfall';
import { scryfallService } from '@/services/scryfall';
interface UseCardState {
  card: ScryfallCard | null;
  loading: boolean;
  error: string | null;
}


export function useCard(cardId?: string) {
  const [state, setState] = useState<UseCardState>({
    card: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!cardId) return;

    const fetchCard = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const card = await scryfallService.getCardById(cardId);
        setState({ card, loading: false, error: null });
      } catch (error) {
        setState({
          card: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    };

    fetchCard();
  }, [cardId]);

  return state;
}

export function useCardByName(cardName?: string) {
  return useCard(cardName);
}
export function useCardById(cardId?: string) {
  return useCard(cardId);
}

interface UseCardSearchState {
  cards: ScryfallCard[];
  totalCards: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}


export function useCardSearch(query: string, options?: {
  page?: number;
  order?: 'name' | 'set' | 'released' | 'rarity' | 'color' | 'usd' | 'eur' | 'cmc';
  autoSearch?: boolean;
}) {
  const [state, setState] = useState<UseCardSearchState>({
    cards: [],
    totalCards: 0,
    hasMore: false,
    loading: false,
    error: null
  });

  const search = useCallback(async () => {
    if (!query.trim()) {
      setState({
        cards: [],
        totalCards: 0,
        hasMore: false,
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await scryfallService.searchCards(query, {
        page: options?.page,
        order: options?.order
      });

      setState({
        cards: response.data,
        totalCards: response.total_cards,
        hasMore: response.has_more,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        cards: [],
        totalCards: 0,
        hasMore: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar cartas'
      });
    }
  }, [query, options?.page, options?.order]);

  useEffect(() => {
    if (options?.autoSearch !== false) {
      search();
    }
  }, [search, options?.autoSearch]);

  return { ...state, search };
}


export function useCardAutocomplete(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await scryfallService.autocomplete(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Erro no autocomplete:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { suggestions, loading };
}