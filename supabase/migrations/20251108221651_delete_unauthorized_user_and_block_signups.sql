/*
  # Remove Unauthorized User and Block Public Signups

  1. Security Actions
    - Delete unauthorized user account (chazzgold@icloud.com)
    - Create database trigger to prevent unauthorized signups
    - Only allow the single approved admin email (chazzgoldart@gmail.com)

  2. Important Notes
    - This ensures only the authorized admin can access the system
    - Any future signup attempts will be automatically rejected at the database level
    - The approved admin email is hardcoded for maximum security
*/

-- Delete the unauthorized user account
DELETE FROM auth.users WHERE email = 'chazzgold@icloud.com';

-- Create a function to block unauthorized signups
CREATE OR REPLACE FUNCTION block_unauthorized_signups()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow the approved admin email
  IF NEW.email != 'chazzgoldart@gmail.com' THEN
    RAISE EXCEPTION 'Public signups are disabled. Unauthorized access attempt detected.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on user signup
DROP TRIGGER IF EXISTS enforce_admin_only_signups ON auth.users;
CREATE TRIGGER enforce_admin_only_signups
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION block_unauthorized_signups();