import api from './api';

export const chatApi = {
    // Ask question
    ask: async (sessionId, question) => {
        return await api.post('/chat/ask', { sessionId, question });
    },

    // Get chat history
    getHistory: async (sessionId, limit = 50) => {
        return await api.get('/chat/history', {
            params: { sessionId, limit },
        });
    },

    // Get message references
    getReferences: async (messageId) => {
        return await api.get(`/chat/reference/${messageId}`);
    },
};

// SSE helper for streaming responses
export const streamChatResponse = (sessionId, question, onMessage, onComplete, onError) => {
    const url = `/api/chat/stream?${new URLSearchParams({
        sessionId: sessionId || '',
        question,
    })}`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener('message', (event) => {
        onMessage(event.data);
    });

    eventSource.addEventListener('complete', (event) => {
        const response = JSON.parse(event.data);
        onComplete(response);
        eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
        onError(event);
        eventSource.close();
    });

    return eventSource;
};
