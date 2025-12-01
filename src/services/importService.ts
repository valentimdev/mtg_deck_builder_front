import api from "@/api/api";
import type { CompleteDeckRead } from "./deckService";

export const ImportService = {
    importTxt: async (deckName: string, file: File): Promise<CompleteDeckRead> => {
        const formData = new FormData();
        formData.append("deck_name", deckName);
        formData.append("file", file);

        const res = await api.post<CompleteDeckRead>("/decks/import-txt", formData);

        return res;
    },

    importCsv: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post<any>("/deck/import/csv", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res;
    },
};
