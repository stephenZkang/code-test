const express = require('express');
const router = express.Router();

/**
 * GET /api/words
 * Get words with optional filtering
 * Query params: category, search, limit, offset
 */
router.get('/', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { category, search, limit = 20, offset = 0 } = req.query;

        let query = supabase
            .from('words')
            .select('*', { count: 'exact' })
            .order('word', { ascending: true })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.or(`word.ilike.%${search}%,definition.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            words: data,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/words/random
 * Get random words for learning
 * Query params: count, category, userId (to exclude recently reviewed)
 */
router.get('/random', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { count = 10, category, userId } = req.query;

        // First, get IDs of recently reviewed words (last 24 hours)
        let excludedWordIds = [];
        if (userId) {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const { data: recentProgress } = await supabase
                .from('user_progress')
                .select('word_id')
                .eq('user_id', userId)
                .gte('last_reviewed', oneDayAgo.toISOString());

            if (recentProgress) {
                excludedWordIds = recentProgress.map(p => p.word_id);
            }
        }

        // Get random words
        let query = supabase
            .from('words')
            .select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (excludedWordIds.length > 0) {
            query = query.not('id', 'in', `(${excludedWordIds.join(',')})`);
        }

        const { data: allWords, error } = await query;

        if (error) throw error;

        // Randomly shuffle and pick the requested count
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        const randomWords = shuffled.slice(0, parseInt(count));

        res.json({ words: randomWords });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/words/:id
 * Get a specific word by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { id } = req.params;

        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: { message: 'Word not found' } });
            }
            throw error;
        }

        res.json({ word: data });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/words/review/:userId
 * Get words due for review based on spaced repetition
 */
router.get('/review/:userId', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId } = req.params;
        const { limit = 20 } = req.query;

        const now = new Date().toISOString();

        // Get words that are due for review
        const { data: dueProgress, error: progressError } = await supabase
            .from('user_progress')
            .select('word_id, mastery_level, next_review')
            .eq('user_id', userId)
            .lte('next_review', now)
            .order('next_review', { ascending: true })
            .limit(limit);

        if (progressError) throw progressError;

        if (!dueProgress || dueProgress.length === 0) {
            return res.json({ words: [] });
        }

        // Get the actual word data
        const wordIds = dueProgress.map(p => p.word_id);
        const { data: words, error: wordsError } = await supabase
            .from('words')
            .select('*')
            .in('id', wordIds);

        if (wordsError) throw wordsError;

        // Combine word data with progress data
        const wordsWithProgress = words.map(word => {
            const progress = dueProgress.find(p => p.word_id === word.id);
            return {
                ...word,
                mastery_level: progress.mastery_level,
                next_review: progress.next_review
            };
        });

        res.json({ words: wordsWithProgress });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
