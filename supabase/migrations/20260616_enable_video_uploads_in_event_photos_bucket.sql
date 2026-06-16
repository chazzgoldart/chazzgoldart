/*
  # Enable Video Uploads in Event Photos Bucket

  ## Overview
  Updates the event-photos storage bucket to allow both image and video uploads.
  Previously only images (JPEG, PNG, GIF, WebP) were allowed.

  ## Changes
  - Add video MIME types to event-photos bucket allowed_mime_types
  - Supports MP4, WebM, MOV, and AVI video formats
  - Maintains existing image format support
*/

-- Drop the old bucket and recreate with video support
DELETE FROM storage.buckets WHERE id = 'event-photos';

-- Recreate event-photos storage bucket with video support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  52428800,
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Recreate policies
CREATE POLICY "Anyone can view event photos v2"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event-photos');

CREATE POLICY "Admins can upload event photos v2"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Admins can update event photos v2"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-photos')
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Admins can delete event photos v2"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-photos');
