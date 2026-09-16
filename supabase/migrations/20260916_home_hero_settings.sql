-- =============================================================================
-- ZELO HOME HERO & PERSONALIZATION SETTINGS MIGRATION
-- Migration File: supabase/migrations/20260916_home_hero_settings.sql
-- Target Database: Existing ZELO Supabase Instance (user_settings table)
-- Description: Non-destructive migration adding custom_slogan,
--              dynamic_hero_enabled, and auto_time_bg_enabled columns.
-- =============================================================================

ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS custom_slogan TEXT DEFAULT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS dynamic_hero_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS auto_time_bg_enabled BOOLEAN DEFAULT TRUE;
