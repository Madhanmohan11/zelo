-- =============================================================================
-- ZELO SAFE STRICTLY ADDITIVE FEATURE SCHEMA MIGRATION
-- Migration Version: 20260916213000_zelo_safe_feature_schema_upgrade.sql
-- Target Database: ZELO Supabase Instance
-- Description: Strictly additive, non-destructive migration adding missing
--              user_settings columns, panchangam_cache, and government_holidays.
--              No columns/tables dropped, no NOT NULL constraints modified,
--              no constraints dropped, and no financial schema touched.
-- =============================================================================

-- Enable required extensions safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. USER SETTINGS (MODULE PREFERENCES & EXTRA COLUMNS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '["money", "tasks", "calendar", "remember"]'::jsonb;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS module_preferences JSONB DEFAULT '{}'::jsonb;

-- -----------------------------------------------------------------------------
-- 2. READ-ONLY PANCHANGAM CACHE TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.panchangam_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT 'Chennai, Tamil Nadu',
  language TEXT NOT NULL DEFAULT 'en',
  sunrise TEXT,
  sunset TEXT,
  tithi TEXT,
  nakshatra TEXT,
  yogam TEXT,
  karanam TEXT,
  rahu_kalam TEXT,
  yamagandam TEXT,
  kuligai TEXT,
  nalla_neram TEXT,
  data_source TEXT DEFAULT 'Zelo Astronomical Calculation v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, location)
);

ALTER TABLE public.panchangam_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'panchangam_cache' AND policyname = 'Authenticated users view panchangam cache'
  ) THEN
    CREATE POLICY "Authenticated users view panchangam cache"
      ON public.panchangam_cache FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. READ-ONLY GOVERNMENT HOLIDAYS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.government_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  ta_name TEXT,
  category TEXT NOT NULL DEFAULT 'Government Holiday',
  is_public_holiday BOOLEAN DEFAULT TRUE,
  state TEXT DEFAULT 'Tamil Nadu',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, name)
);

ALTER TABLE public.government_holidays ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'government_holidays' AND policyname = 'Authenticated users view government holidays'
  ) THEN
    CREATE POLICY "Authenticated users view government holidays"
      ON public.government_holidays FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_panchangam_date_loc ON public.panchangam_cache (date, location);
CREATE INDEX IF NOT EXISTS idx_govt_holidays_date ON public.government_holidays (date);
