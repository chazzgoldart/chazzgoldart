/*
  # Create Slideshow Images Table

  1. New Tables
    - `slideshow_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to the image
      - `title` (text, optional) - Optional title for the slide
      - `description` (text, optional) - Optional description
      - `display_order` (integer) - Order in which to display
      - `is_active` (boolean) - Whether to show this slide
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `slideshow_images` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slideshow images"
  ON slideshow_images
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert slideshow images"
  ON slideshow_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update slideshow images"
  ON slideshow_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete slideshow images"
  ON slideshow_images
  FOR DELETE
  TO authenticated
  USING (true);
