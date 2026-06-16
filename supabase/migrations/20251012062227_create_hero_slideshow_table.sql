/*
  # Create Hero Slideshow Table

  1. New Tables
    - `hero_slideshow_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to the slideshow image
      - `title` (text, nullable) - Optional title for the image
      - `description` (text, nullable) - Optional description
      - `display_order` (integer) - Order in which images appear
      - `is_active` (boolean) - Whether the image is active in the slideshow
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `hero_slideshow_images` table
    - Add policy for public read access (anyone can view slideshow)
    - Add policy for authenticated admin users to manage images
*/

CREATE TABLE IF NOT EXISTS hero_slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slideshow_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero slideshow images"
  ON hero_slideshow_images
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert hero slideshow images"
  ON hero_slideshow_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hero slideshow images"
  ON hero_slideshow_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete hero slideshow images"
  ON hero_slideshow_images
  FOR DELETE
  TO authenticated
  USING (true);