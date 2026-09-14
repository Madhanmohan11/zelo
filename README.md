# LifeOS — Personal Life Management Web Application

LifeOS is a complete, mobile-first personal life-management web application designed to help users manage their daily life — from meal schedules and workout routines to pending remember items (laundry, repair, lent items) and daily expense tracking.

Built with **React**, **Vite**, **Tailwind CSS**, **React Router**, **Lucide Icons**, and **Supabase (Auth, PostgreSQL, Row Level Security)**.

---

## 🌟 Key Features

1. **Authentication Flow**
   - Registration with full name, email, password validation.
   - 6-digit email OTP verification with resend countdown timer.
   - Login, logout, persistent session handling.
   - Protected routes redirecting unauthenticated users to `/login`.

2. **Personalized Onboarding**
   - Configure wake-up time, sleep schedule, daily water intake target, and expense budget.

3. **Today Dashboard (`/today`)**
   - Personalized time-based greetings ("Good morning, Madhan 👋").
   - Today's Food schedule & status toggle.
   - Today's Workout routine & quick completion status.
   - Active Remember items due soon (e.g., "2 shirts at Ironing shop").
   - Today's Expense spending counter & transaction metrics.
   - Quick Add Floating Action button.

4. **Food Schedule Module (`/food`)**
   - Categorize meals: Breakfast, Morning Snack, Lunch, Evening Snack, Dinner.
   - Schedule meal times, calories, notes.
   - Filter by date & status (pending, completed, skipped).

5. **Workout Planner Module (`/workout`)**
   - Schedule workout routines with duration and notes.
   - Add exercises, track sets, reps, and weight (kg).

6. **Remember Hub (`/remember`)**
   - Tailored specifically for tracking items given to shops, friends, or laundry (e.g. "2 shirts at Ironing shop given 13 Sep, collect 15 Sep 6 PM").
   - Pipeline statuses: `waiting`, `ready`, `collected`, `returned`, `cancelled`.
   - Overdue filter & quick action status changes.

7. **Expense Manager Module (`/expenses`)**
   - Track amounts, categories (Food, Travel, Shopping, Bills, Health, Entertainment, Education, Other), and payment methods (UPI, Cash, Card, Bank Transfer).
   - Real-time metrics: Today's spending, This week, This month.
   - Date filtering & multi-field search.

8. **System Settings & Browser Notifications (`/settings`)**
   - Request browser notification permissions for reminder alerts.
   - Export full JSON backup of data.
   - Live Supabase / Fallback database status indicator.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + Vite 8
- **Language**: JavaScript (ES Module)
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism UI Design System
- **Routing**: React Router DOM v7
- **Database & Auth**: Supabase Auth (OTP), PostgreSQL Database, Row Level Security (RLS)
- **Icons**: Lucide React

---

## 📂 Project Structure

```text
LifeOS/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable Design System (Button, Input, Select, Card, Badge, Modal, etc.)
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── QuickAddModal.jsx  # Global floating action modal trigger
│   ├── context/
│   │   ├── AuthContext.jsx    # Auth state, session listener, OTP verification
│   │   └── ToastContext.jsx   # Universal notification toasts
│   ├── layouts/
│   │   └── AppLayout.jsx      # Mobile bottom navbar, desktop sidebar, top header
│   ├── lib/
│   │   └── supabase.js        # Supabase client singleton
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   ├── TodayPage.jsx
│   │   ├── FoodPage.jsx
│   │   ├── WorkoutPage.jsx
│   │   ├── RememberPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/
│   │   └── dataService.js    # Data CRUD abstraction layer for Supabase & local storage
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .env
├── supabase_setup.sql         # SQL schema migration script with RLS policies & triggers
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Clone and Install Dependencies
```bash
cd LifeOS
npm install
```

### 3. Setup Supabase Backend

1. Create a free project at [Supabase Dashboard](https://app.supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Copy the contents of [`supabase_setup.sql`](file:///d:/Business/LifeOS/supabase_setup.sql) and paste them into the SQL Editor.
4. Click **Run** to execute the script. This creates:
   - Tables: `profiles`, `user_settings`, `meals`, `workouts`, `workout_exercises`, `remember_items`, `expenses`, `reminders`.
   - RLS policies enforcing `auth.uid() = user_id`.
   - Automated profile creation trigger on user registration.
5. Go to **Project Settings -> API** and copy:
   - Project URL
   - `anon` Public API Key
6. Update your `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 4. Enable Email OTP in Supabase
1. Go to **Authentication -> Email Templates**.
2. Ensure **Confirm Signup / Magic Link / OTP** is enabled.

---

## 💻 Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser or mobile phone on the same Wi-Fi network.

### Production Build
```bash
npm run build
```

---

## 📱 Mobile Safari & PWA Usage

LifeOS is built mobile-first. On iPhone Safari:
1. Tap the **Share** icon at the bottom of Safari.
2. Select **"Add to Home Screen"**.
3. LifeOS will launch in full standalone web app mode with native safe-area inset padding and touch targets.

---

## 🔐 Security & RLS Policy Summary

All database queries are protected by Row Level Security (RLS) policies:
- Users can only read, insert, update, or delete records where `user_id = auth.uid()`.
- Public anonymous users are blocked at the database layer.
