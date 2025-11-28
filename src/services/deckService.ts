import api from "@/api/api";
import type { BackendCard } from "./scryfall/types";

// Tipos baseados nos schemas do backend
export interface DeckInDB {
    id: number;
    name: string;
    last_update: string;
}

export interface DeckCreate {
    name: string;
    commander?: string;
}

export interface DeckUpdate {
    name: string;
}

export interface DeckList {
    decks: DeckInDB[];
}

export interface FullDeckCards {
    id?: number;
    deck_id: number;
    card: BackendCard;
    quantidade: number;
    is_commander: boolean;
}

export interface CompleteDeckRead {
    id: number;
    name: string;
    last_update: string;
    cards: FullDeckCards[];
}

export interface DeckQuantity {
    card_id: string;
    quantidade: number;
}

export const DeckService = {
    // Lista todos os decks
    getAll: async (): Promise<DeckList> => {
        return api.get<DeckList>("/decks/");
    },

    // Busca um deck completo por ID
    getById: async (id: number): Promise<CompleteDeckRead> => {
        return api.get<CompleteDeckRead>(`/decks/${id}`);
    },

    // Cria um novo deck
    create: async (data: DeckCreate): Promise<DeckInDB> => {
        return api.post<DeckInDB>("/decks/", data);
    },

    // Renomeia um deck
    rename: async (id: number, data: DeckUpdate): Promise<DeckInDB> => {
        return api.put<DeckInDB>(`/decks/${id}`, data);
    },

    // Deleta um deck
    delete: async (id: number): Promise<void> => {
        await api.delete<void>(`/decks/${id}`);
    },

    // Copia um deck
    copy: async (id: number, destName: string): Promise<DeckInDB> => {
        return api.post<DeckInDB>(`/decks/${id}/copy`, { name: destName });
    },

    // Adiciona uma carta ao deck
    addCard: async (id: number, cardId: string, quantidade: number): Promise<FullDeckCards> => {
        return api.post<FullDeckCards>(`/decks/${id}/add`, {
            card_id: cardId,
            quantidade,
        });
    },

    // Remove uma carta do deck
    removeCard: async (id: number, cardId: string, quantidade: number): Promise<FullDeckCards> => {
        return api.post<FullDeckCards>(`/decks/${id}/remove`, {
            card_id: cardId,
            quantidade,
        });
    },

    // Define o comandante do deck
    setCommander: async (id: number, cardId: string): Promise<FullDeckCards> => {
        // O FastAPI espera card_id como campo JSON no body
        return api.post<FullDeckCards>(`/decks/${id}/commander`, { card_id: cardId });
    },

    // Remove o comandante do deck
    resetCommander: async (id: number): Promise<void> => {
        await api.delete<void>(`/decks/${id}/commander`);
    },

    // Busca o comandante do deck
    getCommander: async (id: number): Promise<FullDeckCards> => {
        return api.get<FullDeckCards>(`/decks/${id}/commander`);
    },

    // Exporta deck como TXT
    exportTxt: async (id: number): Promise<Blob> => {
        return api.get<Blob>(`/decks/${id}/txt`, {
            responseType: 'blob',
        });
    },

    // Exporta deck como CSV
    exportCsv: async (id: number): Promise<Blob> => {
        return api.get<Blob>(`/decks/${id}/csv`, {
            responseType: 'blob',
        });
    },

    // Exporta deck como JSON
    exportJson: async (id: number): Promise<Blob> => {
        return api.get<Blob>(`/decks/${id}/json`, {
            responseType: 'blob',
        });
    },
};
