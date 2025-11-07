import type {
  ScryfallCard,
  ScryfallError,
  ScryfallSearchResponse,
} from './types';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';
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

  private async fetchFromScryfall<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    await this.waitForRateLimit();

    const url = new URL(`${SCRYFALL_API_BASE}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        const error: ScryfallError = await response.json();
        throw new Error(`Scryfall API Error: ${error.details}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar dados do Scryfall: ${error.message}`);
      }
      throw error;
    }
  }

  async getCardById(cardId: string): Promise<ScryfallCard> {
    return this.fetchFromScryfall<ScryfallCard>(`/cards/${cardId}`);
  }

  async getCardByName(name: string): Promise<ScryfallCard> {
    return this.fetchFromScryfall<ScryfallCard>('/cards/named', {
      exact: name,
    });
  }

  async autocomplete(query: string): Promise<string[]> {
    const response = await this.fetchFromScryfall<{ data: string[] }>(
      '/cards/autocomplete',
      { q: query }
    );
    return response.data;
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
    const params: Record<string, string> = { q: query };

    if (options?.page) params.page = options.page.toString();
    if (options?.unique) params.unique = options.unique;
    if (options?.order) params.order = options.order;
    if (options?.dir) params.dir = options.dir;

    return this.fetchFromScryfall<ScryfallSearchResponse>(
      '/cards/search',
      params
    );
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

  async getRandomCard(query?: string): Promise<ScryfallCard> {
    const params = query ? { q: query } : undefined;
    return this.fetchFromScryfall<ScryfallCard>('/cards/random', params);
  }
}

export const scryfallService = new ScryfallService();
