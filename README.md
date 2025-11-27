# WalletXP
A fun finance app with daily challenges and budgeting tools.

📱 WalletXP – Smart Finance Gamification App
⭐ Features (Short & Unique)
1️⃣ Gamified Financial Learning

Lessons presented as interactive flashcards

Earn XP after completing each lesson

Smooth animations for every card

✨ Unique: Financial literacy feels like completing quests, not reading textbooks.

2️⃣ Saving Goals With Motivation

Set goals, add savings, track progress

Daily saving suggestions & beautiful progress bars

XP & badges when completing a goal

✨ Unique: Saving money becomes a rewarding achievement, not a chore.

3️⃣ Smart Challenge System

Daily & weekly challenges

Spin-the-wheel for random challenges

XP rewards + expiry countdown

✨ Unique: Challenges are dynamic, fun, and create daily engagement.

4️⃣ Expense Tracking + Receipt Scanner

Add expenses manually or scan bills using OCR

Categorized spending with clear visuals

Fixed & variable expenses supported

✨ Unique: Auto-extract amounts/category from receipts using Base44 OCR.

5️⃣ Rewards & Coupons (XP Redemption)

Redeem XP for discount coupons

Swiggy, Amazon, Zomato, Uber, etc.

Auto-expiry & coupon usage tracking

✨ Unique: Real-world rewards for good financial habits.

6️⃣ XP, Levels & Badge System

1000 XP = 1 Level

Badges unlocked at major levels (5,10,15…)

Encourages consistency & progression

✨ Unique: A complete gamification loop designed for long-term retention.

🛠 Tech Stack
Frontend:

React.js

Tailwind CSS + shadcn/ui

Framer Motion

React Router

Lucide Icons

React Query

Backend / Storage:

Base44 Entities (NoSQL records)

Base44 OCR + File Handling APIs

src/
 ├── components/
 │   ├── auth/           # Login, signup, auth context
 │   ├── expenses/       # Expense scanner, add expense
 │   ├── savings/        # Saving goals + logs
 │   ├── challenges/     # Daily/weekly challenges
 │   ├── lessons/        # Flashcard lessons
 │   └── ui/             # Buttons, inputs, dialogs
 │
 ├── pages/              # Main screens
 │   ├── Home.jsx
 │   ├── Budget.jsx
 │   ├── Savings.jsx
 │   ├── Challenges.jsx
 │   ├── Learn.jsx
 │   └── Rewards.jsx
 │
 ├── api/base44Client.js # API client
 ├── utils/              # Helper functions
 └── App.jsx             # Root app
