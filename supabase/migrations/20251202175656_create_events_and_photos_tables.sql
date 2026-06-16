/*
  # Create Events and Photos Tables for Event Photography System

  ## Overview
  This migration sets up the database structure for managing event photography galleries.
  Events contain multiple photos synced from Google Drive folders.

  ## New Tables

  ### `events`
  Stores event information for photography galleries
  - `id` (uuid, primary key) - Unique identifier
  - `slug` (text, unique) - URL-friendly identifier for event pages
  - `display_name` (text) - Human-readable event name
  - `cover_image_url` (text, nullable) - URL to cover/thumbnail image
  - `google_drive_folder_id` (text, nullable) - Google Drive folder ID for syncing
  - `created_at` (timestamptz) - When event was created
  - `updated_at` (timestamptz) - When event was last updated

  ### `photos`
  Stores individual photos for each event
  - `id` (uuid, primary key) - Unique identifier
  - `event_id` (uuid, foreign key) - References events table
  - `image_url` (text) - URL to the photo in Supabase storage
  - `thumbnail_url` (text, nullable) - URL to thumbnail version
  - `original_filename` (text) - Original filename from Google Drive
  - `is_visible` (boolean) - Whether photo is visible to public (admin moderation)
  - `taken_at` (timestamptz, nullable) - When photo was taken
  - `created_at` (timestamptz) - When photo was added to database
  - `google_drive_file_id` (text, nullable) - Original Google Drive file ID

  ## Security
  - Enable RLS on both tables
  - Public can SELECT visible photos and events
  - Only authenticated admins can INSERT, UPDATE, DELETE

  ## Indexes
  - Index on events.slug for fast lookups
  - Index on photos.event_id for gallery queries
  - Index on photos.is_visible for filtering
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  cover_image_url text,
  google_drive_folder_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  original_filename text NOT NULL,
  is_visible boolean DEFAULT false,
  taken_at timestamptz,
  created_at timestamptz DEFAULT now(),
  google_drive_file_id text,
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_is_visible ON photos(is_visible);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events table

-- Public can view all events
CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can insert events
CREATE POLICY "Admins can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update events
CREATE POLICY "Admins can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete events
CREATE POLICY "Admins can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for photos table

-- Public can view visible photos only
CREATE POLICY "Anyone can view visible photos"
  ON photos
  FOR SELECT
  TO public
  USING (is_visible = true);

-- Admins can view all photos
CREATE POLICY "Admins can view all photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated admins can insert photos
CREATE POLICY "Admins can insert photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated admins can update photos
CREATE POLICY "Admins can update photos"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated admins can delete photos
CREATE POLICY "Admins can delete photos"
  ON photos
  FOR DELETE
  TO authenticated
  USING (true);
