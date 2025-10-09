-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- FIX PROFILES TABLE RLS POLICIES
-- ============================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- FIX ATTENDANCE_RECORDS TABLE RLS POLICIES
-- ============================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow all operations on attendance_records" ON public.attendance_records;

-- Users can insert their own attendance
CREATE POLICY "Users can insert own attendance"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all attendance records
CREATE POLICY "Admins can view all attendance"
ON public.attendance_records FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all attendance records
CREATE POLICY "Admins can update all attendance"
ON public.attendance_records FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete attendance records
CREATE POLICY "Admins can delete attendance"
ON public.attendance_records FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- FIX ATTENDANCE_SETTINGS TABLE RLS POLICIES
-- ============================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Allow all operations on attendance_settings" ON public.attendance_settings;

-- All authenticated users can view settings (read cutoff times)
CREATE POLICY "Authenticated users can view settings"
ON public.attendance_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.attendance_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.attendance_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
ON public.attendance_settings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- CREATE TRIGGER TO AUTO-CREATE PROFILE
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'username'
  );
  
  -- Assign default 'student' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();