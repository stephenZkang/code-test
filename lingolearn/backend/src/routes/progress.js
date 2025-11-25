const express = require('express');
const router = express.Router();
const {
    calculateNewMasteryLevel,
    getNextReviewDate
} = require('../utils/spacedRepetition');

/**
 * GET /api/progress/:userId
 * Get overall learning progress for a user
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId } = req.params;

        // Get total words learned (words with at least one review)
        const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('mastery_level, is_bookmarked')
            .eq('user_id', userId);

        if (progressError) throw progressError;

        // Get learning sessions for streak calculation
        const { data: sessions, error: sessionsError } = await supabase
            .from('learning_sessions')
            .select('session_date, words_learned, exercises_completed')
            .eq('user_id', userId)
            .order('session_date', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Calculate statistics
        const totalWordsLearned = progressData?.length || 0;
        const bookmarkedCount = progressData?.filter(p => p.is_bookmarked).length || 0;

        // Mastery breakdown
        const masteryBreakdown = {
            level0: 0,
            level1: 0,
            level2: 0,
            level3: 0,
            level4: 0,
            level5: 0
        };

        progressData?.forEach(p => {
            masteryBreakdown[`level${p.mastery_level}`]++;
        });

        // Calculate current streak
        const streak = calculateStreak(sessions);

        // Get today's session data
        const today = new Date().toISOString().split('T')[0];
        const todaySession = sessions?.find(s => s.session_date === today);

        res.json({
            totalWordsLearned,
            bookmarkedCount,
            masteryBreakdown,
            currentStreak: streak,
            todayProgress: {
                wordsLearned: todaySession?.words_learned || 0,
                exercisesCompleted: todaySession?.exercises_completed || 0
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/progress/update
 * Update user progress for a word
 * Body: { userId, wordId, wasCorrect }
 */
router.post('/update', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId, wordId, wasCorrect } = req.body;

        if (!userId || !wordId || wasCorrect === undefined) {
            return res.status(400).json({
                error: { message: 'Missing required fields: userId, wordId, wasCorrect' }
            });
        }

        // Get current progress
        const { data: existingProgress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('word_id', wordId)
            .single();

        const currentLevel = existingProgress?.mastery_level || 0;
        const newMasteryLevel = calculateNewMasteryLevel(currentLevel, wasCorrect);
        const nextReviewDate = getNextReviewDate(newMasteryLevel, wasCorrect);
        const now = new Date().toISOString();

        // Update or insert progress
        const progressData = {
            user_id: userId,
            word_id: wordId,
            mastery_level: newMasteryLevel,
            last_reviewed: now,
            next_review: nextReviewDate.toISOString(),
            review_count: (existingProgress?.review_count || 0) + 1,
            correct_count: (existingProgress?.correct_count || 0) + (wasCorrect ? 1 : 0)
        };

        const { data: updatedProgress, error: progressError } = await supabase
            .from('user_progress')
            .upsert(progressData, {
                onConflict: 'user_id,word_id',
                returning: 'representation'
            })
            .select()
            .single();

        if (progressError) throw progressError;

        // Update today's session
        const today = new Date().toISOString().split('T')[0];
        const { data: sessionData, error: sessionError } = await supabase
            .from('learning_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('session_date', today)
            .single();

        const sessionUpdate = {
            user_id: userId,
            session_date: today,
            words_learned: (sessionData?.words_learned || 0) + (existingProgress ? 0 : 1)
        };

        await supabase
            .from('learning_sessions')
            .upsert(sessionUpdate, {
                onConflict: 'user_id,session_date'
            });

        res.json({
            success: true,
            progress: updatedProgress
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/progress/bookmark
 * Toggle bookmark status for a word
 * Body: { userId, wordId, isBookmarked }
 */
router.post('/bookmark', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId, wordId, isBookmarked } = req.body;

        if (!userId || !wordId || isBookmarked === undefined) {
            return res.status(400).json({
                error: { message: 'Missing required fields: userId, wordId, isBookmarked' }
            });
        }

        // Update bookmark status
        const { data, error } = await supabase
            .from('user_progress')
            .update({ is_bookmarked: isBookmarked })
            .eq('user_id', userId)
            .eq('word_id', wordId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            isBookmarked: data.is_bookmarked
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Helper function to calculate current learning streak
 */
function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort sessions by date descending
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.session_date) - new Date(a.session_date)
    );

    let currentDate = new Date(today);

    for (const session of sortedSessions) {
        const sessionDate = new Date(session.session_date);
        sessionDate.setHours(0, 0, 0, 0);

        // Check if this session is on the current date we're checking
        if (sessionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (sessionDate < currentDate) {
            // Gap found, break the streak
            break;
        }
    }

    return streak;
}

module.exports = router;
