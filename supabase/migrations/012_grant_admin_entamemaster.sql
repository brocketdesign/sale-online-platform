-- Grant admin privileges to entamemaster
UPDATE public.profiles
SET is_admin = TRUE
WHERE username = 'entamemaster';
