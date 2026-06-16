/*
  # Create Gallery Slideshow Table
  
  1. New Tables
    - `gallery_slideshow_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL to the image in storage
      - `title` (text, optional) - Image title
      - `description` (text, optional) - Image description
      - `display_order` (integer) - Order in slideshow
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `gallery_slideshow_images` table
    - Add policy for public read access
    - Add policy for authenticated admin users to manage images
*/

CREATE TABLE IF NOT EXISTS gallery_slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_slideshow_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery slideshow images"
  ON gallery_slideshow_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert gallery slideshow images"
  ON gallery_slideshow_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery slideshow images"
  ON gallery_slideshow_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery slideshow images"
  ON gallery_slideshow_images
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_slideshow_display_order 
  ON gallery_slideshow_images(display_order);