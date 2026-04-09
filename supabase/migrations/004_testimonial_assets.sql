-- ============================================================
-- 004: Storage bucket + RLS policies for testimonial assets
-- (sender avatars uploaded by sellers for chat testimonials)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the bucket as public
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-assets', 'testimonial-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Storage RLS policies for the testimonial-assets bucket
-- Path convention: {seller-uuid}/{filename}  (inside the bucket)
-- ----------------------------------------------------------------

-- Public read
DROP POLICY IF EXISTS "Public testimonial-assets access" ON storage.objects;
CREATE POLICY "Public testimonial-assets access" ON storage.objects
  FOR SELECT USING (bucket_id = 'testimonial-assets');

-- Sellers can upload into their own folder
DROP POLICY IF EXISTS "Sellers can upload testimonial assets" ON storage.objects;
CREATE POLICY "Sellers can upload testimonial assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'testimonial-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can overwrite their own files
DROP POLICY IF EXISTS "Sellers can update testimonial assets" ON storage.objects;
CREATE POLICY "Sellers can update testimonial assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'testimonial-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can delete their own files
DROP POLICY IF EXISTS "Sellers can delete testimonial assets" ON storage.objects;
CREATE POLICY "Sellers can delete testimonial assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'testimonial-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
