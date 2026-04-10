-- ============================================================
-- Admin field on profiles
-- ============================================================

-- Add is_admin column (default false for all existing users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Grant admin privileges to the specified account
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'datewisetoday@gmail.com'
);
