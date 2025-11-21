import api from "@/api/api";

export interface DeckDTO {
    id: string;
    name: string;
    format: string;
    commander?: string;
    createdAt: string;
    updatedAt: string;
}

export const DeckService = {
    getAll: async (): Promise<DeckDTO[]> => {
        const res = await api.get("/deck");
        return res.data;
    },

    getById: async (id: string): Promise<DeckDTO> => {
        const res = await api.get(`/deck/${id}`);
        return res.data;
    },

    getByName: async (name: string): Promise<DeckDTO> => {
        const res = await api.get(`/deck/name/${name}`);
        return res.data;
    },

    getInitial: async (): Promise<DeckDTO> => {
        const res = await api.get("/deck/inicial");
        return res.data;
    },

    getMeta: async () => {
        const res = await api.get("/deck/meta");
        return res.data;
    },

    create: async (data: { name: string; format: string }) => {
        const res = await api.post("/deck", data);
        return res.data;
    },

    update: async (id: string, data: any) => {
        const res = await api.put(`/deck/${id}`, data);
        return res.data;
    },

    delete: async (id: string) => {
        const res = await api.delete(`/deck/${id}`);
        return res.data;
    },

    getStats: async (id: string) => {
        const res = await api.get(`/deck/${id}/stats`);
        return res.data;
    },

    exportTxt: async (id: string) => {
        const res = await api.get(`/deck/${id}/txt`);
        return res.data;
    },

    exportCsv: async (id: string) => {
        const res = await api.get(`/deck/${id}/csv`);
        return res.data;
    },
};
