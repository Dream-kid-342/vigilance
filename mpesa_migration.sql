-- Run this script in your Supabase SQL Editor
-- It adds tracking columns to associate an STK push request with a specific job

ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS payment_request_id TEXT,
ADD COLUMN IF NOT EXISTS payment_receipt TEXT;

