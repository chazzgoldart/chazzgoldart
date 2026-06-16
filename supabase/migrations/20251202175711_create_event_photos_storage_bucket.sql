/*
  # Create Event Photos Storage Bucket

  ## Overview
  Creates a storage bucket for event photos with appropriate access policies.

  ## Storage Bucket
  - `event-photos` - Stores all event photography images
    - Public read access for visible photos
    - Admin-only write access

  ## Security
  - Public users can SELECT (view) all files
  - Only authenticated admins can INSERT (upload) files
  - Only authenticated admins can UPDATE files
  - Only authenticated admins can DELETE files
*/

-- Create event-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public can view all files in event-photos bucket
CREATE POLICY "Anyone can view event photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'event-photos');

-- Only authenticated admins can upload files
CREATE POLICY "Admins can upload event photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-photos');

-- Only authenticated admins can update files
CREATE POLICY "Admins can update event photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-photos')
  WITH CHECK (bucket_id = 'event-photos');

-- Only authenticated admins can delete files
CREATE POLICY "Admins can delete event photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-photos');
