# LingoLearn - Quick Start Guide

## 🎯 What You Have

A complete full-stack vocabulary learning application with:
- **200 vocabulary words** (beginner to advanced)
- **Spaced repetition algorithm** for optimal learning
- **3 exercise types** (multiple choice, fill-in-blank, listening)
- **Progress tracking** with streaks and achievements
- **Mobile-first design** with swipe gestures

## 📦 Project Structure

```
lingolearn/
├── frontend/     - React + Chakra UI app
├── backend/      - Node.js + Express API  
└── database/    - PostgreSQL schema + seed data
```

## ⚡ Quick Setup (5 minutes)

### 1. Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. In SQL Editor, run:
   - `database/schema.sql` (creates tables)
   - `database/seed.sql` (adds 200 words)
4. Get from Settings → API:
   - Project URL
   - anon public key
   - service_role key

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm start
```

## 🔑 Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
PORT=3001
```

### Frontend `.env`
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=http://localhost:3001
```

## ✨ Features

### Learn Page
- Swipe cards to learn words
- Tap to flip and see definition
- Audio pronunciation
- Bookmark important words

### Practice Page
- Choose exercise type
- 10-question sessions
- Instant feedback
- Track accuracy

### Progress Page  
- Learning streak counter
- Vocabulary mastery chart
- Weekly activity graph
- Achievement badges

### Settings Page
- Account information
- Learning goals
- Sign out

## 📚 Documentation

- See `README.md` for detailed documentation
- See `walkthrough.md` for complete feature breakdown
- API documentation in README

## 🎨 Technology

- **Frontend**: React 18, Chakra UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Algorithm**: SM-2 Spaced Repetition

---

**Need help?** Check the Troubleshooting section in README.md
