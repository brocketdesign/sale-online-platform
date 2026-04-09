-- ============================================================
-- 002: Add username and missing columns to profiles
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add missing columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Backfill username from email prefix (strip non-alphanumeric, lowercase)
UPDATE public.profiles
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(COALESCE(email, id::TEXT), '@', 1), '[^a-z0-9]', '', 'g'))
WHERE username IS NULL;

-- Ensure minimum length of 3 chars
UPDATE public.profiles
SET username = 'user' || REPLACE(SUBSTRING(id::TEXT, 1, 8), '-', '')
WHERE username IS NULL OR LENGTH(username) < 3;

-- Make NOT NULL
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Add UNIQUE constraint (drop first in case of partial prior run)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Update handle_new_user trigger to populate email + username going forward
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
BEGIN
  username_val := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF LENGTH(username_val) < 3 THEN
    username_val := 'user' || FLOOR(RANDOM() * 90000 + 10000)::TEXT;
  ELSE
    username_val := username_val || FLOOR(RANDOM() * 900 + 100)::TEXT;
  END IF;

  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    username_val,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    email    = COALESCE(public.profiles.email,    EXCLUDED.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
