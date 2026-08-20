-- Phase 5: Scans Table & Row Level Security (RLS) Policies
-- Run this script in your Supabase project's SQL Editor

-- 1. Create scans table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_filename TEXT,
  job_description TEXT,
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can select their own scans
CREATE POLICY "Users can select own scans"
  ON public.scans
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own scans
CREATE POLICY "Users can insert own scans"
  ON public.scans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
