
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- HELPER FUNCTION: AUTOMATIC updated_at TIMESTAMP TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (With User Role & Protection)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Prevent users from elevating their own role on UPDATE
DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;
CREATE POLICY "Users can update their own profile fields" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. USER SETTINGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  wake_time TEXT DEFAULT '07:00',
  sleep_time TEXT DEFAULT '23:00',
  water_target_ml INTEGER DEFAULT 2500,
  daily_expense_budget NUMERIC(10,2) DEFAULT 1000.00,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" 
  ON public.user_settings FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. ACCOUNTS TABLE (SAVINGS & MONEY ACCOUNTS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'bank' CHECK (account_type IN ('cash', 'bank', 'upi', 'wallet', 'other')),
  bank_name TEXT,
  account_number TEXT,
  account_number_last4 TEXT,
  account_holder_name TEXT,
  nickname TEXT,
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (opening_balance >= 0),
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;
CREATE POLICY "Users can manage their own accounts" 
  ON public.accounts FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. MONEY TRANSACTIONS TABLE (DEPOSITS & TRANSFERS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.money_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  category TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.money_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own money transactions" ON public.money_transactions;
CREATE POLICY "Users can manage their own money transactions" 
  ON public.money_transactions FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. MEALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE DEFAULT CURRENT_DATE,
  scheduled_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own meals" ON public.meals;
CREATE POLICY "Users can manage their own meals" 
  ON public.meals FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. WORKOUTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE DEFAULT CURRENT_DATE,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 45,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own workouts" ON public.workouts;
CREATE POLICY "Users can manage their own workouts" 
  ON public.workouts FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. WORKOUT EXERCISES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  weight_kg NUMERIC(6,2) DEFAULT 0,
  notes TEXT,
  completed_sets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own workout exercises" ON public.workout_exercises;
CREATE POLICY "Users can manage their own workout exercises" 
  ON public.workout_exercises FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. REMEMBER ITEMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.remember_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'collected', 'returned', 'cancelled')),
  given_date DATE DEFAULT CURRENT_DATE,
  expected_date DATE,
  reminder_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.remember_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own remember items" ON public.remember_items;
CREATE POLICY "Users can manage their own remember items" 
  ON public.remember_items FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. REMINDERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('meal', 'workout', 'remember', 'general')),
  entity_id UUID,
  remind_at TIMESTAMPTZ NOT NULL,
  is_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;
CREATE POLICY "Users can manage their own reminders" 
  ON public.reminders FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 10. EXPENSES TABLE (WITH ACCOUNT FK RELATIONSHIP)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other')),
  payment_method TEXT DEFAULT 'UPI',
  description TEXT,
  spent_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
CREATE POLICY "Users can manage their own expenses" 
  ON public.expenses FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 11. TASKS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" 
  ON public.tasks FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 12. GOALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'archived')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
CREATE POLICY "Users can manage their own goals" 
  ON public.goals FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 13. HABITS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER DEFAULT 1,
  category TEXT DEFAULT 'health',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own habits" ON public.habits;
CREATE POLICY "Users can manage their own habits" 
  ON public.habits FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 14. HABIT LOGS TABLE (UNIQUE CONSTRAINT: ONE LOG PER HABIT PER DAY)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_habit_log_per_day UNIQUE (habit_id, log_date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can manage their own habit logs" 
  ON public.habit_logs FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 15. WATER LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  logged_date DATE DEFAULT CURRENT_DATE,
  logged_time TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own water logs" ON public.water_logs;
CREATE POLICY "Users can manage their own water logs" 
  ON public.water_logs FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 16. SLEEP LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_time TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own sleep logs" ON public.sleep_logs;
CREATE POLICY "Users can manage their own sleep logs" 
  ON public.sleep_logs FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 17. CALENDAR EVENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  category TEXT DEFAULT 'general',
  is_all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;
CREATE POLICY "Users can manage their own calendar events" 
  ON public.calendar_events FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 18. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" 
  ON public.notifications FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 19. ACTIVITY LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can manage their own activity logs" 
  ON public.activity_logs FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 20. AI CONVERSATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can manage their own AI conversations" 
  ON public.ai_conversations FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 21. AI MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI messages" ON public.ai_messages;
CREATE POLICY "Users can manage their own AI messages" 
  ON public.ai_messages FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- AUTOMATIC PROFILE & SETTINGS CREATION TRIGGER ON AUTH SIGNUP
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO public.profiles (id, full_name, avatar_url, role, onboarding_completed)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
  NULL,
  'user',
  FALSE
)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- AUTOMATIC UPDATED_AT TRIGGERS FOR ALL MAIN TABLES
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_accounts_updated_at ON public.accounts;
CREATE TRIGGER set_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_meals_updated_at ON public.meals;
CREATE TRIGGER set_meals_updated_at BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_workouts_updated_at ON public.workouts;
CREATE TRIGGER set_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_remember_items_updated_at ON public.remember_items;
CREATE TRIGGER set_remember_items_updated_at BEFORE UPDATE ON public.remember_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_goals_updated_at ON public.goals;
CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_habits_updated_at ON public.habits;
CREATE TRIGGER set_habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts (user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_remember_user_status ON public.remember_items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON public.accounts (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_money_transactions_user_date ON public.money_transactions (user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_account ON public.expenses (user_id, account_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_spent ON public.expenses (user_id, spent_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks (user_id, status);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs (user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_water_logs_date ON public.water_logs (user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages (conversation_id, created_at);

-- -----------------------------------------------------------------------------
-- SUPABASE STORAGE: AVATARS BUCKET & RLS POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  FALSE, -- Private bucket (requires signed URLs)
  5242880, -- 5 MB Limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies for avatars bucket
DROP POLICY IF EXISTS "Users can view their own avatar files" ON storage.objects;
CREATE POLICY "Users can view their own avatar files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload their own avatar files" ON storage.objects;
CREATE POLICY "Users can upload their own avatar files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own avatar files" ON storage.objects;
CREATE POLICY "Users can update their own avatar files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar files" ON storage.objects;
CREATE POLICY "Users can delete their own avatar files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
