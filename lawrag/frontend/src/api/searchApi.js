import api from './api';

export const searchApi = {
    // Hybrid search
    search: async (query, category = null, limit = 10) => {
        return await api.post('/search', { query, category, limit });
    },
};
