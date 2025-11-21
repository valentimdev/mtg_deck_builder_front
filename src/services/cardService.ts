import api from "@/api/api";

export const CardService = {
    autocomplete: async (partial: string) => {
        const res = await api.get(`/card/autocomplete/${partial}`);
        return res.data;
    },

    searchByName: async (name: string) => {
        const res = await api.get(`/card/name/${name}`);
        return res.data;
    },

    getTopCommanders: async () => {
        const res = await api.get("/card/commander");
        return res.data;
    },

    getCommanderMeta: async (name: string) => {
        const res = await api.get(`/card/commander/${name}`);
        return res.data;
    },

    addCardToDeck: async (deckId: string, card: any) => {
        const res = await api.post(`/deck/${deckId}/card`, card);
        return res.data;
    },

    updateCardQty: async (deckId: string, cardId: string, qty: number) => {
        const res = await api.put(`/deck/${deckId}/card/${cardId}`, { qty });
        return res.data;
    },

    removeCardFromDeck: async (deckId: string, cardId: string) => {
        const res = await api.delete(`/deck/${deckId}/card/${cardId}`);
        return res.data;
    },
};
