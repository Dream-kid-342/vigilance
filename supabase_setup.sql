-- Vigilance App Enhanced Database Schema

-- Required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop tables if they exist (safe for development)
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

---------------------------------------------------
-- 1. Profiles Table (Clients, Workers, Admins)
---------------------------------------------------
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  national_id TEXT UNIQUE,
  avatar_url TEXT,
  address TEXT,
  role TEXT CHECK (role IN ('client', 'worker', 'admin')),

  -- Worker fields
  expertise TEXT,
  worker_bio TEXT,
  nita_certificate_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,

  -- Live status
  is_online BOOLEAN DEFAULT FALSE,
  share_location BOOLEAN DEFAULT FALSE,
  duration_preference TEXT,
  
  -- Admin controls
  is_suspended BOOLEAN DEFAULT FALSE,
  mou_signed BOOLEAN DEFAULT FALSE,
  training_status TEXT DEFAULT 'none',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------
-- 2. Categories Table
---------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price_daily INTEGER NOT NULL,
  price_weekly INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------
-- 3. Jobs Table (Bookings)
---------------------------------------------------
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  duration TEXT CHECK (duration IN ('Daily', 'Weekly', 'Monthly')),
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','active','completed','cancelled','verified_by_client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------
-- Enable Realtime
---------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

---------------------------------------------------
-- Row Level Security
---------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

---------------------------------------------------
-- Profiles Policies
---------------------------------------------------

-- Allow authenticated users to view profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON profiles;

CREATE POLICY "Profiles viewable by authenticated users"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');


-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);


-- Allow users to update only their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

---------------------------------------------------
-- Categories Policies
---------------------------------------------------
DROP POLICY IF EXISTS "Categories viewable by everyone" ON categories;

CREATE POLICY "Categories viewable by everyone"
ON categories
FOR SELECT
USING (true);

-- Allow admins to insert categories
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
ON categories
FOR INSERT
WITH CHECK (true);

-- Allow admins to update categories
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
ON categories
FOR UPDATE
USING (true);

-- Allow admins to delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
ON categories
FOR DELETE
USING (true);

---------------------------------------------------
-- Jobs Policies
---------------------------------------------------

-- Clients can create jobs
DROP POLICY IF EXISTS "Clients can create jobs" ON jobs;

CREATE POLICY "Clients can create jobs"
ON jobs
FOR INSERT
WITH CHECK (auth.uid() = client_id);


-- Clients can view their jobs
DROP POLICY IF EXISTS "Clients view their jobs" ON jobs;

CREATE POLICY "Clients view their jobs"
ON jobs
FOR SELECT
USING (auth.uid() = client_id);


-- Workers can view jobs assigned to them
DROP POLICY IF EXISTS "Workers view assigned jobs" ON jobs;

CREATE POLICY "Workers view assigned jobs"
ON jobs
FOR SELECT
USING (auth.uid() = worker_id);


-- Clients and workers can update job status
DROP POLICY IF EXISTS "Clients and workers update jobs" ON jobs;

CREATE POLICY "Clients and workers update jobs"
ON jobs
FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id);

---------------------------------------------------
-- updated_at auto update
---------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

---------------------------------------------------
-- Default Categories
---------------------------------------------------
INSERT INTO categories (name, price_daily, price_weekly, price_monthly, icon) VALUES
('Security Guard', 1500, 9000, 35000, 'shield'),
('Bodyguard', 5000, 30000, 120000, 'user-shield'),
('Housekeeper', 1000, 6000, 24000, 'home'),
('Driver', 2000, 12000, 45000, 'car')
ON CONFLICT (name) DO NOTHING;

---------------------------------------------------
-- Automatic Profile Creation Trigger
---------------------------------------------------
-- This function automatically creates a profile when a new user signs up.
-- Because it is SECURITY DEFINER, it runs with admin privileges, 
-- safely bypassing any RLS restrictions.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    phone_number, 
    national_id, 
    avatar_url, 
    expertise, 
    worker_bio,
    portfolio_images,
    is_suspended,
    mou_signed,
    training_status
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'nationalId',
    new.raw_user_meta_data->>'avatarUrl',
    new.raw_user_meta_data->>'expertise',
    new.raw_user_meta_data->>'bio',
    '{}'::text[],
    FALSE,
    FALSE,
    'none'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

---------------------------------------------------
-- Storage Buckets & Policies
---------------------------------------------------
-- Note: 'storage' schema might not be accessible if running purely via regular SQL, 
-- but this sets up the bucket in Supabase via their dashboard typically. 
-- Assuming postgres superuser access:
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('portfolios', 'portfolios', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Portfolios Policies
DROP POLICY IF EXISTS "Portfolios viewable by everyone" ON storage.objects;
CREATE POLICY "Portfolios viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

DROP POLICY IF EXISTS "Users can upload their own portfolios" ON storage.objects;
CREATE POLICY "Users can upload their own portfolios"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolios' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own portfolios" ON storage.objects;
CREATE POLICY "Users can delete their own portfolios"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolios' AND auth.uid() = owner);

-- Avatars Policies
DROP POLICY IF EXISTS "Avatars viewable by everyone" ON storage.objects;
CREATE POLICY "Avatars viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner);