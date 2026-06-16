/*
  # Reset Admin Password

  1. Changes
    - Update password for chazzgoldart@gmail.com to "IamGold24299!"
    - Ensure admin metadata is set correctly
    - Clear any locked/banned status

  2. Security
    - Only affects the single admin account
    - Ensures proper access to admin panel
*/

-- Update the admin user password and metadata
UPDATE auth.users 
SET 
  encrypted_password = crypt('IamGold24299!', gen_salt('bf')),
  raw_app_meta_data = jsonb_build_object('is_admin', true),
  email_confirmed_at = NOW(),
  banned_until = NULL,
  updated_at = NOW()
WHERE email = 'chazzgoldart@gmail.com';
