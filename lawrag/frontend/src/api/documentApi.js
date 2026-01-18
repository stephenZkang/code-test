import api from './api';

export const documentApi = {
    // Upload document
    upload: async (file, title, category) => {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        formData.append('category', category);

        return await api.post('/docs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Get parse status
    getParseStatus: async (documentId) => {
        return await api.get(`/docs/${documentId}/parse-status`);
    },

    // Get document
    getDocument: async (documentId) => {
        return await api.get(`/docs/${documentId}`);
    },

    // List documents
    listDocuments: async (category = null, limit = 20) => {
        const params = { limit };
        if (category) params.category = category;
        return await api.get('/docs/list', { params });
    },

    // Get random documents
    getRandomDocuments: async (limit = 6) => {
        return await api.get('/docs/random', { params: { limit } });
    },

    // Delete document
    deleteDocument: async (documentId) => {
        return await api.delete(`/docs/${documentId}`);
    },
};
