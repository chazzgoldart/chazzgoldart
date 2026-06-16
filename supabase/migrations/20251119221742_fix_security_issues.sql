/*
  # Fix Security Issues

  ## Changes Made

  1. **Remove Unused Indexes**
    - Drop `idx_blog_images_post_id` (unused index on blog_images)
    - Drop `idx_blog_images_order` (unused index on blog_images)
    - Foreign key constraint provides sufficient indexing for blog_post_id

  2. **Fix Function Search Path Mutability**
    - Add `SET search_path = public, auth` to `is_admin()` function
    - Add `SET search_path = public, auth` to `enforce_admin_email()` function
    - Add `SET search_path = public, auth` to `block_unauthorized_signups()` function
    - This prevents search_path injection attacks

  3. **Enable Leaked Password Protection**
    - Enable HaveIBeenPwned integration in Supabase Auth
    - Prevents users from using compromised passwords
    - Note: This is configured via Supabase Auth settings

  ## Security Impact
  - Removes unused database objects that could be exploited
  - Hardens functions against search_path injection attacks
  - Improves password security by checking against known breaches
*/

-- 1. Drop unused indexes on blog_images table
DROP INDEX IF EXISTS public.idx_blog_images_post_id;
DROP INDEX IF EXISTS public.idx_blog_images_order;

-- 2. Fix search_path for is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
SET search_path = public, auth
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
  );
END;
$$;

-- 3. Fix search_path for enforce_admin_email function
CREATE OR REPLACE FUNCTION public.enforce_admin_email()
RETURNS TRIGGER 
SET search_path = public, auth
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email != 'chazzgoldart@gmail.com' THEN
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{is_admin}',
      'false'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Fix search_path for block_unauthorized_signups function
CREATE OR REPLACE FUNCTION public.block_unauthorized_signups()
RETURNS TRIGGER 
SET search_path = public, auth
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email != 'chazzgoldart@gmail.com' THEN
    RAISE EXCEPTION 'Public signups are disabled. Unauthorized access attempt detected.';
  END IF;
  RETURN NEW;
END;
$$;

-- Note: Leaked Password Protection must be enabled via Supabase Dashboard
-- Navigate to: Authentication > Providers > Email > Password Protection
-- Toggle "Enable password breach detection" to ON
-- This will check passwords against the HaveIBeenPwned database