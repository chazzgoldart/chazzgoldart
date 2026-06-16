/*
  # Create Hero Slideshow Storage Bucket

  1. Storage
    - Create `hero-slideshow` bucket for storing hero slideshow images
    - Set bucket to public access for image display
    - Configure file size limits (50 MB max)

  2. Security
    - Add policy for public read access to all images
    - Add policy for authenticated users to upload images
    - Add policy for authenticated users to update/delete images
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-slideshow',
  'hero-slideshow',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for hero slideshow images'
  ) THEN
    CREATE POLICY "Public read access for hero slideshow images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hero-slideshow');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload hero slideshow images'
  ) THEN
    CREATE POLICY "Authenticated users can upload hero slideshow images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hero-slideshow');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update hero slideshow images'
  ) THEN
    CREATE POLICY "Authenticated users can update hero slideshow images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'hero-slideshow')
    WITH CHECK (bucket_id = 'hero-slideshow');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete hero slideshow images'
  ) THEN
    CREATE POLICY "Authenticated users can delete hero slideshow images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'hero-slideshow');
  END IF;
END $$;