import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// Word APIs
export const wordAPI = {
    getAll: (category) => api.get('/api/words', { params: { category } }),
    getRandom: (limit = 10, userId = 1) => api.get('/api/words/random', { params: { limit, userId } }),
    getById: (id) => api.get(`/api/words/${id}`),
    create: (word) => api.post('/api/words', word),
    update: (id, word) => api.put(`/api/words/${id}`, word),
    delete: (id) => api.delete(`/api/words/${id}`),
};

// Progress APIs
export const progressAPI = {
    getStats: (userId = 1) => api.get('/api/progress', { params: { userId } }),
    updateProgress: (wordId, masteryLevel, isBookmarked, userId = 1) =>
        api.post('/api/progress/update', { wordId, masteryLevel, isBookmarked }, { params: { userId } }),
    getHistory: (userId = 1) => api.get('/api/progress/history', { params: { userId } }),
    getDueWords: (userId = 1) => api.get('/api/progress/due', { params: { userId } }),
    getBookmarked: (userId = 1) => api.get('/api/progress/bookmarked', { params: { userId } }),
};

// Exercise APIs
export const exerciseAPI = {
    generate: (questionType = 'MULTIPLE_CHOICE', count = 10, userId = 1) =>
        api.get('/api/exercises/generate', { params: { questionType, count, userId } }),
    submit: (exerciseData, userId = 1) =>
        api.post('/api/exercises/submit', exerciseData, { params: { userId } }),
    getHistory: (userId = 1, limit = 20) =>
        api.get('/api/exercises/history', { params: { userId, limit } }),
    getStats: (userId = 1) => api.get('/api/exercises/stats', { params: { userId } }),
};

// Achievement APIs
export const achievementAPI = {
    getAll: (userId = 1) => api.get('/api/achievements', { params: { userId } }),
    getUserAchievements: (userId = 1) => api.get('/api/achievements/user', { params: { userId } }),
    checkAchievements: (userId = 1) => api.post('/api/achievements/check', {}, { params: { userId } }),
};

export default api;
