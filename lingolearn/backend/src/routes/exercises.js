const express = require('express');
const router = express.Router();

/**
 * GET /api/exercises/generate
 * Generate practice exercises
 * Query params: type (multiple_choice, fill_blank, listening), count, userId
 */
router.get('/generate', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { type = 'multiple_choice', count = 10, userId } = req.query;

        // Get words user has seen (prioritize words with lower mastery)
        let wordIds = [];
        if (userId) {
            const { data: progress } = await supabase
                .from('user_progress')
                .select('word_id, mastery_level')
                .eq('user_id', userId)
                .lte('mastery_level', 3) // Focus on words not fully mastered
                .order('mastery_level', { ascending: true })
                .limit(count * 2); // Get more than needed for variety

            if (progress && progress.length > 0) {
                wordIds = progress.map(p => p.word_id);
            }
        }

        // If user has no progress or not enough words, get random words
        if (wordIds.length < count) {
            const { data: randomWords } = await supabase
                .from('words')
                .select('id')
                .limit(count);

            if (randomWords) {
                wordIds = [...wordIds, ...randomWords.map(w => w.id)];
            }
        }

        // Shuffle and limit
        const shuffledIds = wordIds.sort(() => 0.5 - Math.random()).slice(0, parseInt(count));

        // Get full word data
        const { data: words, error } = await supabase
            .from('words')
            .select('*')
            .in('id', shuffledIds);

        if (error) throw error;

        // Generate exercises based on type
        let exercises = [];

        switch (type) {
            case 'multiple_choice':
                exercises = await generateMultipleChoice(words, supabase);
                break;
            case 'fill_blank':
                exercises = generateFillBlank(words);
                break;
            case 'listening':
                exercises = await generateListening(words, supabase);
                break;
            default:
                return res.status(400).json({ error: { message: 'Invalid exercise type' } });
        }

        res.json({ exercises, type });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/exercises/submit
 * Submit exercise answers
 * Body: { userId, exercises: [{ wordId, exerciseType, isCorrect, timeTaken }] }
 */
router.post('/submit', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId, exercises } = req.body;

        if (!userId || !exercises || !Array.isArray(exercises)) {
            return res.status(400).json({
                error: { message: 'Missing required fields: userId, exercises' }
            });
        }

        // Record exercise history
        const historyRecords = exercises.map(ex => ({
            user_id: userId,
            word_id: ex.wordId,
            exercise_type: ex.exerciseType,
            is_correct: ex.isCorrect,
            time_taken_seconds: ex.timeTaken || null
        }));

        const { error: historyError } = await supabase
            .from('exercise_history')
            .insert(historyRecords);

        if (historyError) throw historyError;

        // Update session stats
        const today = new Date().toISOString().split('T')[0];
        const { data: sessionData } = await supabase
            .from('learning_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_date', today)
            .single();

        const sessionUpdate = {
            user_id: userId,
            session_date: today,
            exercises_completed: (sessionData?.exercises_completed || 0) + exercises.length
        };

        await supabase
            .from('learning_sessions')
            .upsert(sessionUpdate, {
                onConflict: 'user_id,session_date'
            });

        // Calculate statistics
        const correctCount = exercises.filter(ex => ex.isCorrect).length;
        const accuracy = (correctCount / exercises.length) * 100;

        res.json({
            success: true,
            stats: {
                total: exercises.length,
                correct: correctCount,
                accuracy: Math.round(accuracy)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Generate multiple choice exercises
 */
async function generateMultipleChoice(words, supabase) {
    // Get additional words for wrong options
    const { data: allWords } = await supabase
        .from('words')
        .select('id, word, definition')
        .limit(100);

    return words.map(word => {
        // Get 3 random wrong options
        const wrongOptions = allWords
            .filter(w => w.id !== word.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.definition);

        // Combine and shuffle options
        const options = [word.definition, ...wrongOptions].sort(() => 0.5 - Math.random());

        return {
            id: word.id,
            word: word.word,
            question: `What is the definition of "${word.word}"?`,
            options,
            correctAnswer: word.definition,
            type: 'multiple_choice'
        };
    });
}

/**
 * Generate fill-in-the-blank exercises
 */
function generateFillBlank(words) {
    return words.map(word => {
        const sentence = word.example_sentence || `The word ${word.word} means ${word.definition}.`;

        // Replace the word with a blank
        const blankedSentence = sentence.replace(
            new RegExp(word.word, 'gi'),
            '______'
        );

        return {
            id: word.id,
            word: word.word,
            question: 'Fill in the blank:',
            sentence: blankedSentence,
            correctAnswer: word.word,
            type: 'fill_blank',
            hint: word.definition
        };
    });
}

/**
 * Generate listening exercises
 */
async function generateListening(words, supabase) {
    // Get additional words for wrong options
    const { data: allWords } = await supabase
        .from('words')
        .select('id, word')
        .limit(100);

    return words.map(word => {
        // Get 3 random wrong options
        const wrongOptions = allWords
            .filter(w => w.id !== word.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.word);

        // Combine and shuffle options
        const options = [word.word, ...wrongOptions].sort(() => 0.5 - Math.random());

        return {
            id: word.id,
            word: word.word,
            question: 'Listen and select the correct word:',
            audioUrl: word.audio_url || null, // Would need actual audio URL
            pronunciation: word.pronunciation,
            options,
            correctAnswer: word.word,
            type: 'listening',
            definition: word.definition // For showing after answer
        };
    });
}

module.exports = router;
