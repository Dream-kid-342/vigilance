-- Fix for existing users who registered as workers but got role=null or role='client'
-- Run this in Supabase SQL Editor for known worker email addresses.

-- Option 1: Fix a specific user by email
-- Replace 'worker@example.com' with the actual email address
UPDATE profiles
SET role = 'worker'
WHERE email = 'worker@example.com'
  AND (role IS NULL OR role != 'worker');

-- Option 2: Fix ALL users who signed up with worker metadata but got wrong role
-- This updates any profile where the auth.users metadata says role='worker' but profile doesn't
UPDATE public.profiles p
SET role = 'worker'
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data->>'role' = 'worker'
  AND (p.role IS NULL OR p.role != 'worker');

-- Verify the fix
SELECT id, email, role, full_name FROM profiles WHERE role = 'worker';
