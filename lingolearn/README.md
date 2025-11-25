# LingoLearn - Full-Stack Vocabulary Learning Application

<div align="center">

![LingoLearn](https://img.shields.io/badge/LingoLearn-Vocabulary%20Learning-teal?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange?style=flat-square&logo=supabase)

**Master vocabulary with spaced repetition and interactive exercises**

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Documentation](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🎯 Word Learning
- **Interactive Card Flip**: Tap to reveal definitions and example sentences
- **Swipe Gestures**: Swipe right to mark as learned, left to skip
- **Pronunciation**: Web Speech API for word pronunciation
- **Bookmarks**: Save words for later review
- **Daily Goals**: Track daily learning progress

### 📝 Practice Exercises
- **Multiple Choice**: Select correct definitions from options
- **Fill-in-Blank**: Complete sentences with missing words
- **Listening**: Identify words from pronunciation
- **Timed Sessions**: 10-question practice sessions
- **Real-time Feedback**: Instant answer validation

### 📊 Progress Tracking
- **Learning Streaks**: Consecutive days of learning
- **Statistics Dashboard**: Total words, mastery levels, daily progress
- **Visual Charts**: Pie charts for mastery, bar charts for weekly activity
- **Achievement System**: Earn badges for milestones

### 🧠 Intelligent Learning
- **Spaced Repetition**: SM-2 algorithm for optimal review intervals
- **Adaptive Difficulty**: Focus on words with lower mastery
- **Progress Persistence**: All data saved to Supabase

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - UI library
- **Chakra UI** - Component library with mobile-first design
- **Framer Motion** - Smooth animations and gestures
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - REST API server
- **Supabase** - PostgreSQL database with authentication
- **Row Level Security (RLS)** - Secure data access
- **SM-2 Algorithm** - Spaced repetition scheduling

### Database
- **PostgreSQL (via Supabase)** - Relational database
- **5 Core Tables**: words, user_progress, learning_sessions, exercise_history, achievements

---

## 📁 Project Structure

```
lingolearn/
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── BottomNav.jsx
│   │   │   ├── WordCard.jsx
│   │   │   └── ExerciseCard.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── PracticePage.jsx
│   │   │   ├── ProgressPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── theme/           # Chakra UI theme
│   │   │   └── theme.js
│   │   ├── App.jsx          # Main app component
│   │   └── index.js         # Entry point
│   ├── .env.example
│   └── package.json
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── words.js
│   │   │   ├── progress.js
│   │   │   ├── exercises.js
│   │   │   └── achievements.js
│   │   ├── utils/           # Utility functions
│   │   │   └── spacedRepetition.js
│   │   └── server.js        # Express server
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample vocabulary (200 words)
│
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Supabase Account** - [Sign up free](https://supabase.com/)

---

## 🚀 Getting Started

### 1. Database Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Wait for the project to be provisioned (2-3 minutes)
3. Navigate to **Project Settings** → **API**
4. Copy the following:
   - **Project URL**
   - **anon public key** (for frontend)
   - **service_role key** (for backend)

#### Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `database/schema.sql`
3. Click **Run** to create all tables and policies
4. Create another new query and paste `database/seed.sql`
5. Click **Run** to populate with 200 sample vocabulary words

**Verification**: Go to **Table Editor** and confirm you see:
- `words` table with 200 rows
- `user_progress`, `learning_sessions`, `exercise_history`, `achievements` tables

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file:**
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_secret_key
PORT=3001
NODE_ENV=development
```

**Start the backend server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Verify**: Visit `http://localhost:3001/health` - you should see:
```json
{
  "status": "ok",
  "message": "LingoLearn API is running"
}
```

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file:**
```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_publishable_anon_key
REACT_APP_API_URL=http://localhost:3001
```

**Start the frontend application:**
```bash
npm start
```

**Verify**: Browser will open at `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Words Endpoints

#### Get All Words
```http
GET /api/words?category=beginner&search=hello&limit=20&offset=0
```

#### Get Random Words
```http
GET /api/words/random?count=10&userId={userId}&category=intermediate
```

#### Get Word by ID
```http
GET /api/words/{wordId}
```

#### Get Words for Review
```http
GET /api/words/review/{userId}?limit=20
```

### Progress Endpoints

#### Get User Progress
```http
GET /api/progress/{userId}
```

**Response:**
```json
{
  "totalWordsLearned": 45,
  "bookmarkedCount": 12,
  "masteryBreakdown": {
    "level0": 10,
    "level1": 15,
    "level2": 12,
    "level3": 5,
    "level4": 2,
    "level5": 1
  },
  "currentStreak": 7,
  "todayProgress": {
    "wordsLearned": 5,
    "exercisesCompleted": 3
  }
}
```

#### Update Progress
```http
POST /api/progress/update
Content-Type: application/json

{
  "userId": "user-uuid",
  "wordId": "word-uuid",
  "wasCorrect": true
}
```

#### Toggle Bookmark
```http
POST /api/progress/bookmark
Content-Type: application/json

{
  "userId": "user-uuid",
  "wordId": "word-uuid",
  "isBookmarked": true
}
```

### Exercise Endpoints

#### Generate Exercises
```http
GET /api/exercises/generate?type=multiple_choice&count=10&userId={userId}
```

**Exercise Types:**
- `multiple_choice` - Select correct definition
- `fill_blank` - Complete the sentence
- `listening` - Identify the word from pronunciation

#### Submit Exercises
```http
POST /api/exercises/submit
Content-Type: application/json

{
  "userId": "user-uuid",
  "exercises": [
    {
      "wordId": "word-uuid",
      "exerciseType": "multiple_choice",
      "isCorrect": true,
      "timeTaken": 5
    }
  ]
}
```

### Achievement Endpoints

#### Get User Achievements
```http
GET /api/achievements/{userId}
```

**Response:**
```json
{
  "earned": [
    {
      "type": "first_word",
      "name": "First Steps",
      "description": "Learned your first word",
      "icon": "🎯",
      "earnedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "available": [...],
  "newAchievements": [...],
  "totalEarned": 3,
  "totalAvailable": 12
}
```

---

## 🔐 Environment Variables

### Backend (.env)
```bash
SUPABASE_URL=                # Your Supabase project URL
SUPABASE_SERVICE_KEY=        # Service role key (SECRET - backend only)
PORT=3001                    # Backend server port
NODE_ENV=development         # development or production
```

### Frontend (.env)
```bash
REACT_APP_SUPABASE_URL=      # Your Supabase project URL
REACT_APP_SUPABASE_ANON_KEY= # Anon public key (safe for frontend)
REACT_APP_API_URL=           # Backend API URL
```

---

## 🌐 Deployment

### Backend (Railway/Render/Heroku)

1. **Create new web service**
2. **Connect repository** or upload files
3. **Set environment variables** from `.env`
4. **Build command**: `npm install`
5. **Start command**: `npm start`
6. **Port**: Ensure it listens on `process.env.PORT`

### Frontend (Vercel/Netlify)

1. **Connect repository**
2. **Build command**: `npm run build`
3. **Output directory**: `build`
4. **Environment variables**: Set all `REACT_APP_*` vars
5. **Update API URL** to point to deployed backend

### Database (Supabase)
- Already hosted - no additional deployment needed
- Ensure RLS policies are enabled in production
- Monitor usage in Supabase dashboard

---

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check `.env` file exists and has correct values
- ✅ Verify Supabase service key is valid
- ✅ Ensure port 3001 is not in use
- ✅ Run `npm install` to install dependencies

### Frontend can't connect to API
- ✅ Verify backend is running on port 3001
- ✅ Check `REACT_APP_API_URL` in frontend `.env`
- ✅ Check browser console for CORS errors
- ✅ Ensure axios requests use correct base URL

### Database errors
- ✅ Verify schema.sql was executed successfully
- ✅ Check RLS policies are created
- ✅ Ensure Supabase project is active
- ✅ Verify credentials in `.env` files

### Authentication issues
- ✅ Verify anon key is correct in frontend
- ✅ Check Supabase Auth is enabled in project
- ✅ Ensure Row Level Security policies allow access
- ✅ Check browser console for detailed errors

### "No words available"
- ✅ Verify seed.sql was executed
- ✅ Check `words` table has data in Supabase Table Editor
- ✅ Verify API endpoint `/api/words/random` returns data

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **Chakra UI** for the beautiful component library
- **SM-2 Algorithm** for spaced repetition methodology

---

<div align="center">

**Built with ❤️ for language learners**

[Report Bug](https://github.com/yourusername/lingolearn/issues) • [Request Feature](https://github.com/yourusername/lingolearn/issues)

</div>
