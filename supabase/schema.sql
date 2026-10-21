-- ====================================================================
-- UDM ResearchHub - Institutional Authentication & Database Schema
-- Universidad de Manila (@udm.edu.ph)
-- ====================================================================

-- 1. STRICT INSTITUTIONAL EMAIL VALIDATION TRIGGER
-- Blocks any account registration unless the email strictly ends with @udm.edu.ph
CREATE OR REPLACE FUNCTION public.validate_udm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize to lowercase and verify strict domain ending
  IF LOWER(NEW.email) NOT LIKE '%@udm.edu.ph' THEN
    RAISE EXCEPTION 'Access Denied: Only official Universidad de Manila (@udm.edu.ph) email addresses are permitted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger BEFORE INSERT on auth.users
DROP TRIGGER IF EXISTS tr_validate_udm_email ON auth.users;
CREATE TRIGGER tr_validate_udm_email
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.validate_udm_email();


-- 2. PUBLIC PROFILES TABLE
-- Stores institutional metadata linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Student',
  id_number TEXT NOT NULL,
  udm_unit TEXT NOT NULL,
  course TEXT NOT NULL DEFAULT '',
  year_level TEXT NOT NULL DEFAULT '1st Year',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- RLS Policy: Allow service role & triggers to insert profiles
DROP POLICY IF EXISTS "Triggers can insert profiles" ON public.profiles;
CREATE POLICY "Triggers can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);


-- 3. AUTOMATIC PROFILE POPULATION TRIGGER
-- Extracts metadata from raw_user_meta_data upon auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    id_number,
    udm_unit,
    course,
    year_level
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'id_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'udm_unit', COALESCE(NEW.raw_user_meta_data->>'college', 'CCS')),
    COALESCE(NEW.raw_user_meta_data->>'course', COALESCE(NEW.raw_user_meta_data->>'course_program', '')),
    COALESCE(NEW.raw_user_meta_data->>'year_level', '1st Year')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    id_number = EXCLUDED.id_number,
    udm_unit = EXCLUDED.udm_unit,
    course = EXCLUDED.course,
    year_level = EXCLUDED.year_level;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
CREATE TRIGGER tr_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
