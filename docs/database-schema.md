# ZELO PostgreSQL Database Architecture & Security Schema

This document provides a comprehensive technical overview of ZELO's database architecture, security policies, triggers, and relationship models built for **Supabase PostgreSQL**.

---

## 1. Architecture Core Principles

1. **User Data Ownership**:
   - Primary user identity stems from `auth.users(id)` managed by Supabase Auth.
   - Every application table references `auth.users(id)` via `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`.
   - Data is strictly isolated per user using **PostgreSQL Row Level Security (RLS)**.

2. **Automated User Creation**:
   - When a user completes signup in Supabase Auth (`auth.users`), a database trigger (`on_auth_user_created`) automatically provisions:
     - `public.profiles` row with initial metadata.
     - `public.user_settings` row with standard application defaults.

3. **Admin Architecture & Role Protection**:
   - `profiles.role` accepts `'user'` or `'admin'`.
   - Security trigger `trg_protect_profile_role` prevents normal users from modifying their own `role` or `is_active` fields.
   - Admin authorization is enforced directly inside PostgreSQL RLS via the `public.is_admin()` security definer function.

---

## 2. Table Summary & Relationships

| Table Name | Primary Purpose | Foreign Keys & Relationships | Key Constraints & Indexes |
| :--- | :--- | :--- | :--- |
| **`profiles`** | Core user identity & global user roles. | `id` -> `auth.users(id)` | `role IN ('user', 'admin')`, `username UNIQUE`, index on `role`. |
| **`user_settings`** | App parameters, notifications & targets. | `user_id` -> `auth.users(id)` | `water_target_ml > 0`, `daily_expense_budget >= 0`. |
| **`meals`** | Food and nutrition tracker. | `user_id` -> `auth.users(id)` | `meal_type`, `status IN ('planned', 'completed', 'skipped')`, index on `(user_id, scheduled_date)`. |
| **`workouts`** | Fitness sessions & exercise logs. | `user_id` -> `auth.users(id)` | `status IN ('planned', 'in_progress', 'completed', 'cancelled', 'skipped')`, index on `(user_id, scheduled_date)`. |
| **`workout_exercises`** | Individual exercise sets & reps. | `workout_id` -> `workouts(id)`, `user_id` -> `auth.users(id)` | `sets >= 0`, `reps >= 0`, index on `workout_id`. |
| **`remember_items`** | Daily physical item tracker. | `user_id` -> `auth.users(id)` | `priority IN ('low', 'normal', 'high', 'urgent')`, `status`, index on `(user_id, status)`. |
| **`reminders`** | Scheduled alert triggers for remember items. | `user_id` -> `auth.users(id)`, `remember_item_id` -> `remember_items(id)` | `remind_at TIMESTAMPTZ`. |
| **`expense_categories`** | System default & custom categories. | `user_id` -> `auth.users(id)` | `UNIQUE(user_id, name)`. |
| **`expenses`** | Financial transaction logs. | `user_id` -> `auth.users(id)` | `amount > 0`, index on `(user_id, spent_at)`. |
| **`tasks`** | General task checklist. | `user_id` -> `auth.users(id)` | `priority`, `status IN ('pending', 'in_progress', 'completed', 'cancelled')`. |
| **`goals`** | Long-term target tracking. | `user_id` -> `auth.users(id)` | `status IN ('active', 'completed', 'paused', 'cancelled')`. |
| **`habits`** | Daily/weekly habit tracker definitions. | `user_id` -> `auth.users(id)` | `target_count > 0`. |
| **`habit_logs`** | Daily completion entries for habits. | `habit_id` -> `habits(id)`, `user_id` -> `auth.users(id)` | `UNIQUE(habit_id, user_id, log_date)`. |
| **`water_logs`** | Daily fluid intake logs. | `user_id` -> `auth.users(id)` | `amount_ml > 0`, index on `(user_id, logged_at)`. |
| **`sleep_logs`** | Sleep start/end & quality logs. | `user_id` -> `auth.users(id)` | `quality BETWEEN 1 AND 5`, index on `(user_id, sleep_start)`. |
| **`calendar_events`** | Timed schedule events. | `user_id` -> `auth.users(id)` | `start_at`, index on `(user_id, start_at)`. |
| **`notifications`** | System & broadcast push notifications. | `user_id` -> `auth.users(id)` | `status IN ('pending', 'sent', 'failed')`. |
| **`activity_logs`** | Platform interaction trail for analytics. | `user_id` -> `auth.users(id)` | `metadata JSONB`, index on `(user_id, created_at)`. |
| **`ai_conversations`** | AI Assistant chat sessions. | `user_id` -> `auth.users(id)` | Timestamps. |
| **`ai_messages`** | AI Assistant chat history lines. | `conversation_id` -> `ai_conversations(id)`, `user_id` -> `auth.users(id)` | `role IN ('user', 'assistant', 'system')`. |

---

## 3. Database Triggers

1. **`on_auth_user_created`**:
   Automatically runs when a row is inserted in `auth.users`. Creates matching entries in `public.profiles` and `public.user_settings`.
2. **`trg_protect_profile_role`**:
   Runs `BEFORE UPDATE` on `public.profiles`. Prevents non-admin users from altering `role` or `is_active`.
3. **`update_updated_at_column`**:
   Automatically updates `updated_at = NOW()` on row updates for all mutable entities.

---

## 4. How to Apply Migrations

### Option A: Supabase Dashboard SQL Editor (Recommended)
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your ZELO project.
3. Open **SQL Editor** -> **New Query**.
4. Paste the entire content of [`supabase_setup.sql`](file:///d:/Business/zelo/supabase_setup.sql).
5. Click **Run**.

### Option B: Supabase CLI
```bash
supabase migration up
```
(Migration file is located at `supabase/migrations/20260914000000_zelo_complete_schema.sql`).
