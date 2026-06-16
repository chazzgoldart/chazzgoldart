/*
  # Create Hero Parallax Gallery Table

  1. New Tables
    - `hero_parallax_gallery`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL of the parallax image
      - `title` (text, nullable) - Optional title for the image
      - `display_order` (integer) - Order of appearance (0-6 for up to 7 images)
      - `speed` (decimal) - Parallax scroll speed multiplier (default 0.5)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `hero_parallax_gallery` table
    - Add policy for public read access
    - Add policy for authenticated users to manage content

  3. Storage
    - Create storage bucket for hero parallax images
    - Set up public access for reading
    - Restrict uploads to authenticated users
*/

CREATE TABLE IF NOT EXISTS hero_parallax_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  display_order integer NOT NULL DEFAULT 0,
  speed decimal(3,2) NOT NULL DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_parallax_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hero parallax gallery images"
  ON hero_parallax_gallery
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert hero parallax gallery images"
  ON hero_parallax_gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hero parallax gallery images"
  ON hero_parallax_gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete hero parallax gallery images"
  ON hero_parallax_gallery
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-parallax', 'hero-parallax', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view hero parallax images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'hero-parallax');

CREATE POLICY "Authenticated users can upload hero parallax images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hero-parallax');

CREATE POLICY "Authenticated users can update hero parallax images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hero-parallax')
  WITH CHECK (bucket_id = 'hero-parallax');

CREATE POLICY "Authenticated users can delete hero parallax images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-parallax');
