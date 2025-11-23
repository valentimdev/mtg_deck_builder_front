import type {
  BackendCard,
  ScryfallSearchResponse,
} from './types';
import { filterEnglishCards } from './languageFilter';

interface BackendAutocompleteResponse {
  cards: BackendCard[];
}

const BACKEND_API_BASE = 'http://0.0.0.0:3839';
const RATE_LIMIT_DELAY = 100;

class ScryfallService {
  private lastRequestTime = 0;

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  private async fetchFromBackend<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    await this.waitForRateLimit();

    let url = `${BACKEND_API_BASE}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend API Error: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar dados do backend: ${error.message}`);
      }
      throw error;
    }
  }

  async getCardById(cardId: string): Promise<BackendCard> {
    return this.fetchFromBackend<BackendCard>(`/api/cards/${cardId}`);
  }

  async getCardByName(name: string): Promise<BackendCard> {
    // Usa a rota /api/cards/named/{name} do backend
    return this.fetchFromBackend<BackendCard>(`/api/cards/named/${encodeURIComponent(name)}`);
  }

  async autocomplete(query: string): Promise<BackendCard[]> {
    const response = await this.fetchFromBackend<BackendAutocompleteResponse>(
      `/api/cards/autocomplete/${encodeURIComponent(query)}`
    );
    const cards = response.cards || [];
    // Filtra apenas cartas em inglês
    return filterEnglishCards(cards);
  }

  async searchCards(
    query: string,
    options?: {
      page?: number;
      unique?: 'cards' | 'art' | 'prints';
      order?:
        | 'name'
        | 'set'
        | 'released'
        | 'rarity'
        | 'color'
        | 'usd'
        | 'eur'
        | 'cmc';
      dir?: 'auto' | 'asc' | 'desc';
    }
  ): Promise<ScryfallSearchResponse> {
    // O autocomplete já retorna objetos Card completos e filtra apenas inglês
    try {
      const cards = await this.autocomplete(query);

      const limit = options?.page ? (options.page - 1) * 20 + 20 : 20;
      const paginatedCards = cards.slice(0, limit);

      return {
        object: 'list',
        total_cards: cards.length,
        has_more: cards.length > limit,
        data: paginatedCards,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar cartas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getCardsBySet(setCode: string): Promise<ScryfallSearchResponse> {
    return this.searchCards(`set:${setCode}`);
  }

  async getCardsByColor(
    colors: string[],
    exact = false
  ): Promise<ScryfallSearchResponse> {
    const colorQuery = colors.join('');
    const operator = exact ? ':' : '<=';
    return this.searchCards(`color${operator}${colorQuery}`);
  }

  async getCardsByFormat(format: string): Promise<ScryfallSearchResponse> {
    return this.searchCards(`legal:${format}`);
  }

  async getRandomCard(_query?: string): Promise<BackendCard> {
    // Se sua API tiver uma rota de random, use aqui
    // Por enquanto, retorna erro ou busca uma carta aleatória via autocomplete
    throw new Error('getRandomCard não implementado para o backend local');
  }
}

export const scryfallService = new ScryfallService();
