-- =============================================================================
-- ZELO SUPABASE PROFILE, SETTINGS & ONBOARDING SYSTEM UPGRADE MIGRATION
-- Migration File: supabase/migrations/20260915_profile_system_upgrade.sql
-- Target Database: Existing ZELO Supabase Instance (Master 21-Table Schema)
-- Description: Non-destructive upgrade migration for existing ZELO database.
--              Adds profile/settings fields, onboarding status, role security,
--              non-recursive RLS policies, repairs missing user rows,
--              configures private avatars bucket, enforces function search_path,
--              and provides secure admin role management.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES COLUMNS & ROLE CONSTRAINT
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Ensure role CHECK constraint exists safely without failing if already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. FIX PROFILE ROLE SECURITY VIA BEFORE UPDATE TRIGGER & ADMIN RPC
-- -----------------------------------------------------------------------------
-- Function prevents standard client UPDATEs from changing user role.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  is_authorized BOOLEAN;
BEGIN
  -- Prevent client/frontend profile updates from modifying user role
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    is_authorized := (
      COALESCE(current_setting('zelo.allow_role_change', true), '') = 'true'
      OR COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    );

    IF NOT is_authorized THEN
      RAISE EXCEPTION 'Direct modification of profile role is not allowed. Use administrative role management RPC.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_profile_role_update ON public.profiles;
CREATE TRIGGER before_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- Administrative RPC function for secure role changes
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role TEXT;
  is_service_role BOOLEAN;
BEGIN
  -- 1. Validate new_role input
  IF new_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Role must be user or admin.';
  END IF;

  -- 2. Verify caller privileges (must be service_role or an existing admin)
  is_service_role := (COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role');

  IF NOT is_service_role THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT role INTO caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF caller_role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Access denied: Only administrators can update user roles.';
    END IF;
  END IF;

  -- 3. Verify target user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Target user profile not found.';
  END IF;

  -- 4. Authorize role change in trigger for this transaction
  PERFORM set_config('zelo.allow_role_change', 'true', true);

  -- 5. Perform the role update
  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. PROFILE RLS POLICIES (SIMPLE OWNERSHIP - NO RECURSIVE SUBQUERIES)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 4. REPAIR EXISTING AUTH USERS MISSING PROFILES
-- -----------------------------------------------------------------------------
-- Safely inserts profiles for users created before this database migration
INSERT INTO public.profiles (id, full_name, role, avatar_url)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(COALESCE(u.email, ''), '@', 1),
    'ZELO User'
  ) AS full_name,
  'user' AS role,
  NULL AS avatar_url
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. USER SETTINGS COLUMNS & ONBOARDING STATUS
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS wake_time TEXT DEFAULT '07:00';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS sleep_time TEXT DEFAULT '23:00';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS water_target_ml INTEGER DEFAULT 2500;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS daily_expense_budget NUMERIC(10,2) DEFAULT 1000.00;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"daily_reminder": true, "daily_reminder_time": "08:00", "meal_reminders": true, "workout_reminder": true, "workout_reminder_time": "18:00", "water_reminder": true, "expense_reminder": true, "expense_reminder_time": "21:00", "goal_reminders": true}'::jsonb;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';

-- Add onboarding_completed flag safely
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure theme CHECK constraint exists safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_settings_theme_check'
  ) THEN
    ALTER TABLE public.user_settings 
      ADD CONSTRAINT user_settings_theme_check CHECK (theme IN ('light', 'dark', 'system'));
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. SAFE ONBOARDING STRATEGY FOR EXISTING USERS
-- -----------------------------------------------------------------------------
-- Mark pre-existing user settings as onboarding_completed = TRUE
-- so existing active accounts are not blocked by the onboarding wizard.
UPDATE public.user_settings
SET onboarding_completed = TRUE
WHERE onboarding_completed IS FALSE
  AND created_at < NOW();

-- -----------------------------------------------------------------------------
-- 7. REPAIR EXISTING AUTH USERS MISSING USER SETTINGS
-- -----------------------------------------------------------------------------
-- Repaired pre-existing users receive onboarding_completed = TRUE
INSERT INTO public.user_settings (
  user_id, 
  wake_time, 
  sleep_time, 
  water_target_ml, 
  daily_expense_budget, 
  notifications_enabled, 
  notification_settings, 
  theme,
  onboarding_completed
)
SELECT 
  u.id,
  '07:00',
  '23:00',
  2500,
  1000.00,
  FALSE,
  '{"daily_reminder": true, "daily_reminder_time": "08:00", "meal_reminders": true, "workout_reminder": true, "workout_reminder_time": "18:00", "water_reminder": true, "expense_reminder": true, "expense_reminder_time": "21:00", "goal_reminders": true}'::jsonb,
  'light',
  TRUE
FROM auth.users u
LEFT JOIN public.user_settings s ON u.id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8. USER SETTINGS RLS POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" 
  ON public.user_settings FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. AVATAR STORAGE BUCKET & RLS POLICIES
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  false, 
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) 
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Objects RLS Policies for avatars bucket
DROP POLICY IF EXISTS "Users can select their own avatar" ON storage.objects;
CREATE POLICY "Users can select their own avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================================================
-- VERIFICATION QUERIES (NON-DESTRUCTIVE DIAGNOSTICS)
-- Run these queries after applying the migration in Supabase SQL Editor to verify:
-- =============================================================================
-- A. Verify Profiles Columns:
--    SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles';
--
-- B. Verify User Settings Columns:
--    SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_settings';
--
-- C. Verify Number of auth.users:
--    SELECT COUNT(*) FROM auth.users;
--
-- D. Verify Number of profiles:
--    SELECT COUNT(*) FROM public.profiles;
--
-- E. Verify 0 Missing Profiles for Auth Users:
--    SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL;
--
-- F. Verify Number of user_settings:
--    SELECT COUNT(*) FROM public.user_settings;
--
-- G. Verify 0 Missing User Settings for Auth Users:
--    SELECT COUNT(*) FROM auth.users u LEFT JOIN public.user_settings s ON u.id = s.user_id WHERE s.user_id IS NULL;
--
-- H. Verify Onboarding Completed Distribution:
--    SELECT onboarding_completed, COUNT(*) FROM public.user_settings GROUP BY onboarding_completed;
--
-- I. Verify Avatars Storage Bucket:
--    SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'avatars';
--
-- J. Verify Storage Objects RLS Policies:
--    SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
--
-- K. Verify Profile RLS Policies:
--    SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles';
--
-- L. Verify User Settings RLS Policies:
--    SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_settings';
--
-- M. Verify Role Protection Trigger:
--    SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_schema = 'public' AND event_object_table = 'profiles';
--
-- N. Verify Admin Role Management Function:
--    SELECT routine_name, security_type FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'admin_update_user_role';
--
-- O. Verify RLS is Enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'user_settings');
-- =============================================================================
