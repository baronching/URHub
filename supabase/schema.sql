-- ====================================================================
-- UDM ResearchHub - Institutional Authentication & Database Schema
-- Universidad de Manila
-- ====================================================================

-- 1. INSTITUTIONAL & ALLOWED EMAIL DOMAIN VALIDATION TRIGGER
-- Validates email domains on auth.users against permitted portal domains
CREATE OR REPLACE FUNCTION public.validate_udm_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT (
    LOWER(NEW.email) LIKE '%@udm.edu.ph'
    OR LOWER(NEW.email) LIKE '%@pau.udm.edu.ph'
    OR LOWER(NEW.email) LIKE '%@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only authorized email domains (@udm.edu.ph, @pau.udm.edu.ph, @gmail.com) are permitted.';
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
  administrator_of VARCHAR(100) NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS administrator_of VARCHAR(100);

-- 2b. PUBLIC USERS DIRECTORY TABLE
-- Matches backend & frontend Users module, with strict 100-char Researcher unit column
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  user_type TEXT NOT NULL DEFAULT 'Student',
  college TEXT NOT NULL DEFAULT 'CCS',
  id_number TEXT NOT NULL DEFAULT '',
  course_program TEXT NOT NULL DEFAULT '',
  administrator_of VARCHAR(100) NULL,
  reading_history TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT chk_researcher_admin_of CHECK (
    role <> 'researcher' OR (administrator_of IS NOT NULL AND LENGTH(BTRIM(administrator_of)) BETWEEN 1 AND 100)
  ),
  CONSTRAINT chk_urelia_locked_college CHECK (
    role NOT IN ('urelia_personnel', 'urelia_director') OR college = 'FAC-ADM'
  )
);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS administrator_of VARCHAR(100);

-- Normalize existing URELIA Personnel/Director rows before applying college lock constraint
UPDATE public.users
SET college = 'FAC-ADM'
WHERE role IN ('urelia_personnel', 'urelia_director')
  AND (college IS DISTINCT FROM 'FAC-ADM');

-- Safely apply constraints even when public.users already existed before this migration
DO $$
BEGIN
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_researcher_admin_of;
  ALTER TABLE public.users
    ADD CONSTRAINT chk_researcher_admin_of CHECK (
      role <> 'researcher' OR (administrator_of IS NOT NULL AND LENGTH(BTRIM(administrator_of)) BETWEEN 1 AND 100)
    );

  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_urelia_locked_college;
  ALTER TABLE public.users
    ADD CONSTRAINT chk_urelia_locked_college CHECK (
      role NOT IN ('urelia_personnel', 'urelia_director') OR college = 'FAC-ADM'
    );
END $$;

-- Enable Row-Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- RLS Policy: Users can update their own non-privileged profile fields
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- RLS Policy: Restrict profile inserts to authenticated user matching id or service role
DROP POLICY IF EXISTS "Triggers can insert profiles" ON public.profiles;
CREATE POLICY "Triggers can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- RLS Policies for public.users (restrict writes to service_role; self-read allowed)
DROP POLICY IF EXISTS "Users can read own user record" ON public.users;
CREATE POLICY "Users can read own user record"
ON public.users
FOR SELECT
USING (auth.uid()::text = id OR auth.role() = 'service_role');


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
    year_level,
    administrator_of
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'id_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'udm_unit', COALESCE(NEW.raw_user_meta_data->>'college', 'CCS')),
    COALESCE(NEW.raw_user_meta_data->>'course', COALESCE(NEW.raw_user_meta_data->>'course_program', '')),
    COALESCE(NEW.raw_user_meta_data->>'year_level', '1st Year'),
    NULLIF(LEFT(BTRIM(COALESCE(NEW.raw_user_meta_data->>'administrator_of', '')), 100), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    id_number = EXCLUDED.id_number,
    udm_unit = EXCLUDED.udm_unit,
    course = EXCLUDED.course,
    year_level = EXCLUDED.year_level,
    administrator_of = EXCLUDED.administrator_of;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS tr_handle_new_user ON auth.users;
CREATE TRIGGER tr_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
