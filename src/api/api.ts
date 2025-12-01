// Usa a variável de ambiente ou o valor padrão do backend
const BACKEND_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3839';
const BASE_URL = `${BACKEND_API_BASE}/api`;

// Função helper para fazer requisições com fetch
interface RequestOptions extends RequestInit {
    responseType?: 'blob';
}

async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const { responseType, ...fetchOptions } = options;

    // Se o body for FormData, não define Content-Type (o navegador faz isso automaticamente com o boundary)
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: Record<string, string> = {
        "x-api-key": import.meta.env.VITE_API_KEY || "",
        "x-client-id": import.meta.env.VITE_CLIENT_ID || "",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...fetchOptions.headers,
    };

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            // Clona a resposta para ler o JSON sem consumir a resposta original
            const errorData = await response.clone().json();
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch {
            // Se não conseguir parsear o JSON, usa a mensagem padrão
        }
        throw new Error(errorMessage);
    }

    // Se a resposta for um blob (para exportações), retorna o blob
    if (responseType === 'blob' || response.headers.get('content-type')?.includes('application/octet-stream')) {
        return response.blob() as Promise<T>;
    }

    // Se não houver conteúdo, retorna void
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
    }

    return response.json();
}

// API wrapper similar ao axios
const api = {
    get: <T>(endpoint: string, config?: { responseType?: 'blob' }): Promise<T> => {
        return request<T>(endpoint, {
            method: 'GET',
            ...config,
        });
    },

    post: <T>(endpoint: string, data?: any, config?: { responseType?: 'blob', headers?: Record<string, string> }): Promise<T> => {
        // Se for FormData, não faz JSON.stringify
        const body = data instanceof FormData
            ? data
            : typeof data === 'string'
                ? data
                : JSON.stringify(data);

        return request<T>(endpoint, {
            method: 'POST',
            body,
            ...config,
        });
    },

    put: <T>(endpoint: string, data?: any): Promise<T> => {
        return request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: <T>(endpoint: string): Promise<T> => {
        return request<T>(endpoint, {
            method: 'DELETE',
        });
    },
};

export default api;