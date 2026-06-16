/*
  # Create Social Links Management System

  1. New Tables
    - `social_links`
      - `id` (uuid, primary key)
      - `platform` (text) - Name of the platform (Twitter, Instagram, etc.)
      - `url` (text) - Full URL to the profile
      - `icon` (text) - Lucide icon name to use
      - `color` (text) - Hover color for the icon
      - `display_order` (integer) - Order to display links
      - `is_active` (boolean) - Whether to show the link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `social_links` table
    - Add policy for public read access
    - Add policy for authenticated admin to manage links
*/

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'ExternalLink',
  color text NOT NULL DEFAULT 'cyan-400',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active social links"
  ON social_links FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all social links"
  ON social_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update social links"
  ON social_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (true);

-- Insert default social links
INSERT INTO social_links (platform, url, icon, color, display_order) VALUES
  ('Twitter/X', 'https://x.com/chazz_gold', 'Twitter', 'cyan-400', 1),
  ('Instagram', 'https://www.instagram.com/chazzgold', 'Instagram', 'pink-400', 2),
  ('Linktree', 'https://linktr.ee/CHAZZGOLD', 'ExternalLink', 'green-400', 3),
  ('Email', 'mailto:chazzgoldart@gmail.com', 'Mail', 'yellow-400', 4)
ON CONFLICT DO NOTHING;