-- =============================================================================
-- ZELO SUPABASE STORAGE MIGRATION FOR AVATARS BUCKET & RLS POLICIES
-- Migration Version: 20260914000001_storage_avatars_bucket.sql
-- Description: Private avatars bucket with per-user RLS policies
-- =============================================================================

-- 1. Create Private Avatars Bucket in storage.buckets
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

-- 2. Storage Objects RLS Policies for avatars bucket
-- Ensures each authenticated user can only access/manage files in their own folder: ${user_id}/...

DROP POLICY IF EXISTS "Authenticated users can read their own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can read their own avatar"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can upload their own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can update their own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can delete their own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
