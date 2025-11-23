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
        const res = await api.get("/decks/");
        return res.data;
    },

    // Busca um deck completo por ID
    getById: async (id: number): Promise<CompleteDeckRead> => {
        const res = await api.get(`/decks/${id}`);
        return res.data;
    },

    // Cria um novo deck
    create: async (data: DeckCreate): Promise<DeckInDB> => {
        const res = await api.post("/decks/", data);
        return res.data;
    },

    // Renomeia um deck
    rename: async (id: number, data: DeckUpdate): Promise<DeckInDB> => {
        const res = await api.put(`/decks/${id}`, data);
        return res.data;
    },

    // Deleta um deck
    delete: async (id: number): Promise<void> => {
        await api.delete(`/decks/${id}`);
    },

    // Copia um deck
    copy: async (id: number, destName: string): Promise<DeckInDB> => {
        const res = await api.post(`/decks/${id}/copy`, { name: destName });
        return res.data;
    },

    // Adiciona uma carta ao deck
    addCard: async (id: number, cardId: string, quantidade: number): Promise<FullDeckCards> => {
        const res = await api.post(`/decks/${id}/add`, {
            card_id: cardId,
            quantidade,
        });
        return res.data;
    },

    // Remove uma carta do deck
    removeCard: async (id: number, cardId: string, quantidade: number): Promise<FullDeckCards> => {
        const res = await api.post(`/decks/${id}/remove`, {
            card_id: cardId,
            quantidade,
        });
        return res.data;
    },

    // Define o comandante do deck
    setCommander: async (id: number, cardId: string): Promise<FullDeckCards> => {
        // O backend espera card_id como string no body
        const res = await api.post(`/decks/${id}/commander`, cardId, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    },

    // Remove o comandante do deck
    resetCommander: async (id: number): Promise<void> => {
        await api.delete(`/decks/${id}/commander`);
    },

    // Busca o comandante do deck
    getCommander: async (id: number): Promise<FullDeckCards> => {
        const res = await api.get(`/decks/${id}/commander`);
        return res.data;
    },

    // Exporta deck como TXT
    exportTxt: async (id: number): Promise<Blob> => {
        const res = await api.get(`/decks/${id}/txt`, {
            responseType: 'blob',
        });
        return res.data;
    },

    // Exporta deck como CSV
    exportCsv: async (id: number): Promise<Blob> => {
        const res = await api.get(`/decks/${id}/csv`, {
            responseType: 'blob',
        });
        return res.data;
    },

    // Exporta deck como JSON
    exportJson: async (id: number): Promise<Blob> => {
        const res = await api.get(`/decks/${id}/json`, {
            responseType: 'blob',
        });
        return res.data;
    },
};
