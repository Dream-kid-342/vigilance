-- ============================================================
-- VIGILANCE - Fix Infinite Recursion in RLS Policies
-- Run this in: Supabase → SQL Editor
-- ============================================================

-- Step 1: Drop all problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all jobs" ON jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON jobs;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON profiles;
DROP POLICY IF EXISTS "Jobs viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Anyone can update jobs" ON jobs;

-- Step 2: Restore clean, non-recursive policies

-- Allow any authenticated user to read any profile (needed by worker/client apps)
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to update only their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to view all jobs
DROP POLICY IF EXISTS "Jobs viewable by participants" ON jobs;
CREATE POLICY "Jobs viewable by participants"
ON jobs FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow participants to update jobs they are part of
DROP POLICY IF EXISTS "Participants can update jobs" ON jobs;
CREATE POLICY "Participants can update jobs"
ON jobs FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id);
