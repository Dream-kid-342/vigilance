-- GPS Location tracking columns for worker live tracking
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NULL;

-- Index for fast spatial lookups of online workers
CREATE INDEX IF NOT EXISTS idx_profiles_online_worker
  ON profiles(role, is_online)
  WHERE role = 'worker' AND is_online = TRUE;

-- Allow workers to update their own GPS coordinates (already covered by existing RLS update policy)
-- Allow admins to see all worker locations (already covered by existing select policies)
-- Verify columns were added:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('latitude','longitude','last_seen_at');
