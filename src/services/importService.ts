import api from "@/api/api";

export const ImportService = {
    importTxt: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post<any>("/deck/import/txt", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

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
