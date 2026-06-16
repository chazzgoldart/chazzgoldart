/*
  # Create Storage Buckets and Policies

  1. Storage Buckets
    - Creates 5 public buckets for different media types:
      - artworks: For artwork images and videos
      - collections: For collection cover images
      - slideshow: For homepage slideshow images
      - gallery-slideshow: For gallery slideshow images
      - blog-images: For blog post images
    
  2. Security Policies
    - Public read access for all buckets
    - Authenticated users can upload, update, and delete files
    - 50MB file size limit per bucket
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('artworks', 'artworks', true, 52428800, NULL),
  ('collections', 'collections', true, 52428800, NULL),
  ('slideshow', 'slideshow', true, 52428800, NULL),
  ('gallery-slideshow', 'gallery-slideshow', true, 52428800, NULL),
  ('blog-images', 'blog-images', true, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Artworks bucket policies
DROP POLICY IF EXISTS "Public access to artworks" ON storage.objects;
CREATE POLICY "Public access to artworks" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Authenticated users can upload artworks" ON storage.objects;
CREATE POLICY "Authenticated users can upload artworks" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Authenticated users can update artworks" ON storage.objects;
CREATE POLICY "Authenticated users can update artworks" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'artworks');

DROP POLICY IF EXISTS "Authenticated users can delete artworks" ON storage.objects;
CREATE POLICY "Authenticated users can delete artworks" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'artworks');

-- Collections bucket policies
DROP POLICY IF EXISTS "Public access to collections" ON storage.objects;
CREATE POLICY "Public access to collections" ON storage.objects
  FOR SELECT USING (bucket_id = 'collections');

DROP POLICY IF EXISTS "Authenticated users can upload collections" ON storage.objects;
CREATE POLICY "Authenticated users can upload collections" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'collections');

DROP POLICY IF EXISTS "Authenticated users can update collections" ON storage.objects;
CREATE POLICY "Authenticated users can update collections" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'collections');

DROP POLICY IF EXISTS "Authenticated users can delete collections" ON storage.objects;
CREATE POLICY "Authenticated users can delete collections" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'collections');

-- Slideshow bucket policies
DROP POLICY IF EXISTS "Public access to slideshow" ON storage.objects;
CREATE POLICY "Public access to slideshow" ON storage.objects
  FOR SELECT USING (bucket_id = 'slideshow');

DROP POLICY IF EXISTS "Authenticated users can upload slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can upload slideshow" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'slideshow');

DROP POLICY IF EXISTS "Authenticated users can update slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can update slideshow" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'slideshow');

DROP POLICY IF EXISTS "Authenticated users can delete slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can delete slideshow" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'slideshow');

-- Gallery slideshow bucket policies
DROP POLICY IF EXISTS "Public access to gallery-slideshow" ON storage.objects;
CREATE POLICY "Public access to gallery-slideshow" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-slideshow');

DROP POLICY IF EXISTS "Authenticated users can upload gallery-slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can upload gallery-slideshow" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery-slideshow');

DROP POLICY IF EXISTS "Authenticated users can update gallery-slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can update gallery-slideshow" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'gallery-slideshow');

DROP POLICY IF EXISTS "Authenticated users can delete gallery-slideshow" ON storage.objects;
CREATE POLICY "Authenticated users can delete gallery-slideshow" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'gallery-slideshow');

-- Blog images bucket policies
DROP POLICY IF EXISTS "Public access to blog-images" ON storage.objects;
CREATE POLICY "Public access to blog-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated users can upload blog-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload blog-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated users can update blog-images" ON storage.objects;
CREATE POLICY "Authenticated users can update blog-images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Authenticated users can delete blog-images" ON storage.objects;
CREATE POLICY "Authenticated users can delete blog-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'blog-images');
