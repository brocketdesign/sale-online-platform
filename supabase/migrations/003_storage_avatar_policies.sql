-- ============================================================
-- 003: Storage bucket + RLS policies for avatars
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the avatars bucket as public (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Storage RLS policies for the avatars bucket
-- Path convention: avatars/{user-uuid}.{ext}  (inside the bucket)
-- ----------------------------------------------------------------

-- Public read (bucket is public, but policy must still exist)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
-- The filename (without extension) must equal auth.uid()
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND SPLIT_PART(storage.filename(name), '.', 1) = auth.uid()::text
  );

-- Authenticated users can overwrite (upsert) their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND SPLIT_PART(storage.filename(name), '.', 1) = auth.uid()::text
  );

-- Authenticated users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND SPLIT_PART(storage.filename(name), '.', 1) = auth.uid()::text
  );
