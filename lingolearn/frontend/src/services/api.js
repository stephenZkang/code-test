import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize API client
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Initialize Supabase client
export const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// Words API
export const wordsAPI = {
    getAll: (params) => api.get('/api/words', { params }),
    getRandom: (params) => api.get('/api/words/random', { params }),
    getById: (id) => api.get(`/api/words/${id}`),
    getForReview: (userId, limit) => api.get(`/api/words/review/${userId}`, { params: { limit } }),
};

// Progress API
export const progressAPI = {
    get: (userId) => api.get(`/api/progress/${userId}`),
    update: (data) => api.post('/api/progress/update', data),
    bookmark: (data) => api.post('/api/progress/bookmark', data),
};

// Exercises API
export const exercisesAPI = {
    generate: (params) => api.get('/api/exercises/generate', { params }),
    submit: (data) => api.post('/api/exercises/submit', data),
};

// Achievements API
export const achievementsAPI = {
    get: (userId) => api.get(`/api/achievements/${userId}`),
};

export default api;
