import type { BackendCard } from './types';

const BACKEND_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3839';

export interface CommanderMetaResponse {
  commander: string;
  available_categories?: string[];
  message?: string;
  category?: string;
  cards?: BackendCard[];
}

export interface MetaCardsByCategory {
  [category: string]: BackendCard[];
}

export interface CommanderListResponse {
  cards: BackendCard[];
}

export class CommanderService {
  /**
   * Busca as categorias disponíveis para um comandante
   */
  async getAvailableCategories(commanderName: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${BACKEND_API_BASE}/api/commander/${encodeURIComponent(commanderName)}/meta`
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
      }

      const data: CommanderMetaResponse = await response.json();
      return data.available_categories || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Busca as cartas de uma categoria específica para um comandante
   */
  async getCardsByCategory(
    commanderName: string,
    category: string
  ): Promise<BackendCard[]> {
    try {
      const response = await fetch(
        `${BACKEND_API_BASE}/api/commander/${encodeURIComponent(commanderName)}/meta?category=${encodeURIComponent(category)}`
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar cartas da categoria ${category}: ${response.statusText}`);
      }

      const data: CommanderMetaResponse = await response.json();
      return data.cards || [];
    } catch (error) {
      console.error(`Erro ao buscar cartas da categoria ${category}:`, error);
      return [];
    }
  }

  /**
   * Busca todas as cartas meta de todas as categorias disponíveis
   */
  async getAllMetaCards(commanderName: string): Promise<MetaCardsByCategory> {
    try {
      // Primeiro busca as categorias disponíveis
      const categories = await this.getAvailableCategories(commanderName);

      if (categories.length === 0) {
        return {};
      }

      // Busca as cartas de cada categoria em paralelo
      const categoryPromises = categories.map(async (category) => {
        const cards = await this.getCardsByCategory(commanderName, category);
        return { category, cards };
      });

      const results = await Promise.all(categoryPromises);

      // Agrupa por categoria
      const metaCardsByCategory: MetaCardsByCategory = {};
      results.forEach(({ category, cards }) => {
        if (cards.length > 0) {
          metaCardsByCategory[category] = cards;
        }
      });

      return metaCardsByCategory;
    } catch (error) {
      console.error('Erro ao buscar todas as cartas meta:', error);
      return {};
    }
  }

  /**
   * Busca os top comandantes do meta
   */
  async getTopCommanders(): Promise<BackendCard[]> {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/api/commander/`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar top comandantes: ${response.statusText}`);
      }

      const data: CommanderListResponse = await response.json();
      return data.cards || [];
    } catch (error) {
      console.error('Erro ao buscar top comandantes:', error);
      return [];
    }
  }
}

export const commanderService = new CommanderService();

