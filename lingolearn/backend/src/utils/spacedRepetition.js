/**
 * Spaced Repetition Algorithm (SM-2 based)
 * Calculates the next review date based on mastery level and performance
 */

/**
 * Calculate the next review interval based on mastery level
 * @param {number} masteryLevel - Current mastery level (0-5)
 * @param {boolean} wasCorrect - Whether the last review was correct
 * @returns {number} - Days until next review
 */
function calculateInterval(masteryLevel, wasCorrect) {
  // If incorrect, reset to lower level
  if (!wasCorrect) {
    return masteryLevel === 0 ? 1 : Math.max(1, Math.floor(getIntervalDays(masteryLevel - 1) / 2));
  }

  // Calculate interval based on level
  return getIntervalDays(masteryLevel);
}

/**
 * Get the standard interval for a mastery level
 * @param {number} level - Mastery level (0-5)
 * @returns {number} - Days for this level
 */
function getIntervalDays(level) {
  const intervals = {
    0: 1,      // New word: review tomorrow
    1: 3,      // After first success: 3 days
    2: 7,      // After second success: 1 week
    3: 14,     // After third success: 2 weeks
    4: 30,     // After fourth success: 1 month
    5: 90      // Mastered: 3 months
  };

  return intervals[level] || 1;
}

/**
 * Calculate the new mastery level based on performance
 * @param {number} currentLevel - Current mastery level (0-5)
 * @param {boolean} wasCorrect - Whether the answer was correct
 * @returns {number} - New mastery level (0-5)
 */
function calculateNewMasteryLevel(currentLevel, wasCorrect) {
  if (wasCorrect) {
    // Increase mastery level, max 5
    return Math.min(5, currentLevel + 1);
  } else {
    // Decrease mastery level on incorrect answer, min 0
    return Math.max(0, currentLevel - 1);
  }
}

/**
 * Get the next review date
 * @param {number} masteryLevel - Current mastery level
 * @param {boolean} wasCorrect - Whether the last review was correct
 * @returns {Date} - Next review date
 */
function getNextReviewDate(masteryLevel, wasCorrect) {
  const intervalDays = calculateInterval(masteryLevel, wasCorrect);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
}

/**
 * Check if a word is due for review
 * @param {Date|string} nextReviewDate - The scheduled next review date
 * @returns {boolean} - True if the word should be reviewed
 */
function isDueForReview(nextReviewDate) {
  const now = new Date();
  const reviewDate = new Date(nextReviewDate);
  return reviewDate <= now;
}

module.exports = {
  calculateInterval,
  calculateNewMasteryLevel,
  getNextReviewDate,
  isDueForReview,
  getIntervalDays
};
