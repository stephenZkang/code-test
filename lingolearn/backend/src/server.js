require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Import routes
const wordsRouter = require('./routes/words');
const progressRouter = require('./routes/progress');
const exercisesRouter = require('./routes/exercises');
const achievementsRouter = require('./routes/achievements');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Make supabase available to routes
const app = express();
app.locals.supabase = supabase;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'LingoLearn API is running' });
});

// API Routes
app.use('/api/words', wordsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/achievements', achievementsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Endpoint not found' } });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 LingoLearn API server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
