-- ============================================================
-- VIGILANCE ADMIN - Create Admin Account
-- 
-- Steps:
-- 1. Go to Supabase → Authentication → Users → Add User
-- 2. Enter your admin email and password, then click Create User
-- 3. Copy the generated User UID
-- 4. Replace PASTE_THE_USER_UID_HERE and the email below
-- 5. Run this SQL in Supabase → SQL Editor
-- ============================================================

-- Run this in: Supabase → SQL Editor
-- This directly inserts the admin profile using the confirmed UID

INSERT INTO profiles (id, full_name, email, role)
VALUES (
  '3785277d-e8c8-46bd-ab17-8c64655ca33c',
  'ADMIN',
  'admin@vigilance.app',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET full_name = 'ADMIN', role = 'admin';