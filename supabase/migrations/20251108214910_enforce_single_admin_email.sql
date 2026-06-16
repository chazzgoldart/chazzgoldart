/*
  # Enforce Single Admin Email

  ## Security Enhancement
  This migration adds a database-level function to ensure ONLY chazzgoldart@gmail.com can have admin privileges.
  
  ## Changes
  1. Creates a trigger function that runs on user creation/update
  2. Automatically strips admin privileges from any email that isn't chazzgoldart@gmail.com
  3. Ensures admin flag can ONLY be set for the authorized email
  
  ## Security Impact
  - Even if someone manually tries to set is_admin=true via SQL, it will be stripped
  - Only chazzgoldart@gmail.com can have admin access
  - This is enforced at the database level, not just application level
*/

-- Function to enforce admin email restriction
CREATE OR REPLACE FUNCTION enforce_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  -- If email is not the authorized admin, remove admin privileges
  IF NEW.email != 'chazzgoldart@gmail.com' THEN
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{is_admin}',
      'false'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user insert/update
DROP TRIGGER IF EXISTS enforce_admin_email_trigger ON auth.users;
CREATE TRIGGER enforce_admin_email_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION enforce_admin_email();

-- Clean up any existing unauthorized admins
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{is_admin}',
  'false'::jsonb
)
WHERE email != 'chazzgoldart@gmail.com'
AND raw_app_meta_data->>'is_admin' = 'true';