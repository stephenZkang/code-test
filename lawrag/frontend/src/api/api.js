import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        //  Can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Return the data directly
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
