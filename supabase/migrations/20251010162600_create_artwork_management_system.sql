/*
  # Create Artwork Management System

  ## Overview
  This migration creates a complete content management system for the Chazz Gold portfolio site,
  allowing admin users to manage artwork, collections, platforms, and blockchain chains through
  a web interface with support for both images and videos.

  ## New Tables

  ### `artworks`
  Stores individual artwork pieces with metadata
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Artwork title
  - `series` (text) - Collection/series name
  - `chain` (text) - Blockchain name (Ethereum, Solana, etc.)
  - `platform` (text) - NFT platform name
  - `media_type` (text) - Either 'image' or 'video'
  - `thumb_url` (text) - Thumbnail image URL (for video previews or image thumbs)
  - `media_url` (text) - Full resolution image or video URL
  - `lore` (text) - Description/story of the artwork
  - `collect_url` (text) - Link to purchase/collect the artwork
  - `display_order` (integer) - Order for display (lower = earlier)
  - `is_featured` (boolean) - Whether to show in featured section
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `platforms`
  NFT platforms where artwork is available
  - `id` (uuid, primary key)
  - `name` (text) - Platform name
  - `tagline` (text) - Short description
  - `url` (text) - Link to profile on platform
  - `icon` (text) - Lucide icon name
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### `chains`
  Blockchain networks
  - `id` (uuid, primary key)
  - `name` (text) - Chain name
  - `url` (text) - Link to profile on chain
  - `icon` (text) - Lucide icon name
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### `collections`
  Artwork collections/series overview
  - `id` (uuid, primary key)
  - `title` (text) - Collection name
  - `tagline` (text) - Short description
  - `image_url` (text) - Collection cover image
  - `url` (text) - Link to full collection
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ## Storage Buckets
  - `artwork-media` - For storing images and videos
  - `artwork-thumbs` - For storing thumbnail images

  ## Security
  - Enable RLS on all tables
  - Public read access (SELECT) for all tables - anyone can view the portfolio
  - Authenticated users only for INSERT, UPDATE, DELETE - only logged-in admin can manage content
  - Storage buckets: public read, authenticated write
*/

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  series text NOT NULL,
  chain text NOT NULL,
  platform text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  thumb_url text NOT NULL,
  media_url text NOT NULL,
  lore text NOT NULL,
  collect_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_media_type CHECK (media_type IN ('image', 'video'))
);

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'Box',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create chains table
CREATE TABLE IF NOT EXISTS chains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL DEFAULT 'Link',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tagline text NOT NULL,
  image_url text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('artwork-media', 'artwork-media', true),
  ('artwork-thumbs', 'artwork-thumbs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artworks
CREATE POLICY "Anyone can view artworks"
  ON artworks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert artworks"
  ON artworks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update artworks"
  ON artworks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete artworks"
  ON artworks FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for platforms
CREATE POLICY "Anyone can view platforms"
  ON platforms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert platforms"
  ON platforms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update platforms"
  ON platforms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete platforms"
  ON platforms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for chains
CREATE POLICY "Anyone can view chains"
  ON chains FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert chains"
  ON chains FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chains"
  ON chains FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chains"
  ON chains FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for collections
CREATE POLICY "Anyone can view collections"
  ON collections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

-- Storage Policies
CREATE POLICY "Anyone can view artwork media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'artwork-media');

CREATE POLICY "Authenticated users can upload artwork media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'artwork-media');

CREATE POLICY "Authenticated users can update artwork media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'artwork-media')
  WITH CHECK (bucket_id = 'artwork-media');

CREATE POLICY "Authenticated users can delete artwork media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'artwork-media');

CREATE POLICY "Anyone can view artwork thumbs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'artwork-thumbs');

CREATE POLICY "Authenticated users can upload artwork thumbs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'artwork-thumbs');

CREATE POLICY "Authenticated users can update artwork thumbs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'artwork-thumbs')
  WITH CHECK (bucket_id = 'artwork-thumbs');

CREATE POLICY "Authenticated users can delete artwork thumbs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'artwork-thumbs');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to artworks table
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();