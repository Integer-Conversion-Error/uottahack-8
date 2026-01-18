// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cuely.tech/api';

export const api = {
    baseUrl: API_BASE_URL,

    // Helper to build full URL
    url: (path: string) => {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_BASE_URL}${cleanPath}`;
    }
};

export default api;
