/*
  # Create contact links table

  1. New Tables
    - `contact_links`
      - `id` (uuid, primary key)
      - `platform` (text) - Name of the platform (e.g., "Instagram", "Twitter")
      - `url` (text) - The URL to the platform
      - `icon` (text) - Lucide icon name to display
      - `display_order` (integer) - Order in which to display the links
      - `is_active` (boolean) - Whether the link should be displayed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `contact_links` table
    - Add policy for public read access (anyone can view active links)
    - Add policy for authenticated users to manage links
*/

CREATE TABLE IF NOT EXISTS contact_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'ExternalLink',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contact links"
  ON contact_links
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert contact links"
  ON contact_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contact links"
  ON contact_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact links"
  ON contact_links
  FOR DELETE
  TO authenticated
  USING (true);