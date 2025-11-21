import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
        "x-client-id": import.meta.env.VITE_CLIENT_ID,
        "Content-Type": "application/json",
    },
});

export default api;