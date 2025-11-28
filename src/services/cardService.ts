import api from "@/api/api";
import type { ScryfallCard } from "./scryfall/types";

export const CardService = {
    autocomplete: async (partial: string) => {
        return api.get<ScryfallCard[]>(`/card/autocomplete/${partial}`);
    },

    searchByName: async (name: string) => {
        return api.get<ScryfallCard>(`/card/name/${name}`);
    },

    getTopCommanders: async () => {
        return api.get<ScryfallCard[]>(`/card/commander`);
    },

    getCommanderMeta: async (name: string) => {
        return api.get<ScryfallCard>(`/card/commander/${name}`);
    },

    addCardToDeck: async (deckId: string, card: any) => {
        return api.post<ScryfallCard>(`/deck/${deckId}/card`, card);
    },

    updateCardQty: async (deckId: string, cardId: string, qty: number) => {
        return api.put<ScryfallCard>(`/deck/${deckId}/card/${cardId}`, { qty });        
    },

    removeCardFromDeck: async (deckId: string, cardId: string) => {
        return api.delete<ScryfallCard>(`/deck/${deckId}/card/${cardId}`);
    },
};
