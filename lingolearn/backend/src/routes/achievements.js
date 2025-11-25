const express = require('express');
const router = express.Router();

// Achievement definitions
const ACHIEVEMENTS = {
    FIRST_WORD: { type: 'first_word', name: 'First Steps', description: 'Learned your first word', icon: '🎯' },
    STREAK_3: { type: 'streak_3', name: '3 Day Streak', description: 'Learned for 3 days in a row', icon: '🔥' },
    STREAK_7: { type: 'streak_7', name: 'Week Warrior', description: 'Learned for 7 days in a row', icon: '⚡' },
    STREAK_30: { type: 'streak_30', name: 'Month Master', description: 'Learned for 30 days in a row', icon: '👑' },
    WORDS_10: { type: 'words_10', name: 'Vocabulary Builder', description: 'Learned 10 words', icon: '📚' },
    WORDS_50: { type: 'words_50', name: 'Word Collector', description: 'Learned 50 words', icon: '🎓' },
    WORDS_100: { type: 'words_100', name: 'Century Club', description: 'Learned 100 words', icon: '💯' },
    WORDS_500: { type: 'words_500', name: 'Vocabulary Expert', description: 'Learned 500 words', icon: '🌟' },
    MASTERY_10: { type: 'mastery_10', name: 'Master of Ten', description: 'Fully mastered 10 words', icon: '✨' },
    MASTERY_50: { type: 'mastery_50', name: 'Mastery Expert', description: 'Fully mastered 50 words', icon: '🏆' },
    PERFECT_SESSION: { type: 'perfect_session', name: 'Perfect Score', description: 'Got 100% on an exercise session', icon: '💎' },
    EXERCISES_100: { type: 'exercises_100', name: 'Practice Makes Perfect', description: 'Completed 100 exercises', icon: '💪' },
};

/**
 * GET /api/achievements/:userId
 * Get all achievements for a user
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const supabase = req.app.locals.supabase;
        const { userId } = req.params;

        // Get earned achievements
        const { data: earnedAchievements, error: achievementsError } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false });

        if (achievementsError) throw achievementsError;

        // Get user stats to check for new achievements
        const newAchievements = await checkNewAchievements(userId, supabase);

        // Format achievements
        const earned = earnedAchievements?.map(a => ({
            ...ACHIEVEMENTS[a.achievement_type.toUpperCase()],
            earnedAt: a.earned_at
        })) || [];

        const available = Object.values(ACHIEVEMENTS).filter(achievement =>
            !earnedAchievements?.some(a => a.achievement_type === achievement.type)
        );

        res.json({
            earned,
            available,
            newAchievements,
            totalEarned: earned.length,
            totalAvailable: Object.keys(ACHIEVEMENTS).length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Check for new achievements
 */
async function checkNewAchievements(userId, supabase) {
    const newAchievements = [];

    // Get user progress
    const { data: progress } = await supabase
        .from('user_progress')
        .select('mastery_level')
        .eq('user_id', userId);

    const totalWords = progress?.length || 0;
    const masteredWords = progress?.filter(p => p.mastery_level === 5).length || 0;

    // Get sessions for streak
    const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('session_date')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

    const streak = calculateStreak(sessions);

    // Get exercise count
    const { data: exercises } = await supabase
        .from('exercise_history')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

    const exerciseCount = exercises?.length || 0;

    // Get existing achievements
    const { data: existing } = await supabase
        .from('achievements')
        .select('achievement_type')
        .eq('user_id', userId);

    const existingTypes = existing?.map(a => a.achievement_type) || [];

    // Check achievement conditions
    const checks = [
        { condition: totalWords >= 1, type: 'first_word' },
        { condition: totalWords >= 10, type: 'words_10' },
        { condition: totalWords >= 50, type: 'words_50' },
        { condition: totalWords >= 100, type: 'words_100' },
        { condition: totalWords >= 500, type: 'words_500' },
        { condition: masteredWords >= 10, type: 'mastery_10' },
        { condition: masteredWords >= 50, type: 'mastery_50' },
        { condition: streak >= 3, type: 'streak_3' },
        { condition: streak >= 7, type: 'streak_7' },
        { condition: streak >= 30, type: 'streak_30' },
        { condition: exerciseCount >= 100, type: 'exercises_100' },
    ];

    // Award new achievements
    for (const check of checks) {
        if (check.condition && !existingTypes.includes(check.type)) {
            const { error } = await supabase
                .from('achievements')
                .insert({
                    user_id: userId,
                    achievement_type: check.type
                });

            if (!error) {
                newAchievements.push(ACHIEVEMENTS[check.type.toUpperCase()]);
            }
        }
    }

    return newAchievements;
}

/**
 * Helper function to calculate streak
 */
function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.session_date) - new Date(a.session_date)
    );

    let currentDate = new Date(today);

    for (const session of sortedSessions) {
        const sessionDate = new Date(session.session_date);
        sessionDate.setHours(0, 0, 0, 0);

        if (sessionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (sessionDate < currentDate) {
            break;
        }
    }

    return streak;
}

module.exports = router;
