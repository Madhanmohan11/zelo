-- =============================================================================
-- ZELO CUSTOM SLOGAN MIGRATION
-- Migration File: supabase/migrations/20260917151500_add_custom_slogan.sql
-- Target Database: Existing ZELO Supabase Instance (user_settings table)
-- Description: Safe, non-destructive migration adding custom_slogan column.
-- =============================================================================

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS custom_slogan TEXT DEFAULT NULL;
