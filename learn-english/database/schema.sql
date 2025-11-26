-- LearnEnglish Database Schema
-- Drop database if exists and create new
DROP DATABASE IF EXISTS learn_english;
CREATE DATABASE learn_english CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learn_english;

-- Words table
CREATE TABLE words (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    english VARCHAR(255) NOT NULL,
    chinese VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    category VARCHAR(100),
    difficulty INT DEFAULT 1,
    audio_url VARCHAR(500),
    example_sentence TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Progress table
CREATE TABLE progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word_id BIGINT NOT NULL,
    user_id BIGINT DEFAULT 1,
    mastery_level INT DEFAULT 0,
    last_review_date TIMESTAMP NULL,
    next_review_date TIMESTAMP NULL,
    review_count INT DEFAULT 0,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    INDEX idx_user_word (user_id, word_id),
    INDEX idx_next_review (next_review_date),
    UNIQUE KEY unique_user_word (user_id, word_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exercises table
CREATE TABLE exercises (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT DEFAULT 1,
    question_type VARCHAR(50),
    word_id BIGINT,
    user_answer VARCHAR(255),
    correct_answer VARCHAR(255),
    is_correct BOOLEAN,
    time_spent INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_word (word_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Achievements table
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    requirement_type VARCHAR(50),
    requirement_value INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User achievements table
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT DEFAULT 1,
    achievement_id BIGINT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning sessions table (for tracking daily streaks)
CREATE TABLE learning_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT DEFAULT 1,
    session_date DATE NOT NULL,
    words_learned INT DEFAULT 0,
    exercises_completed INT DEFAULT 0,
    time_spent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, session_date),
    INDEX idx_user_date (user_id, session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
