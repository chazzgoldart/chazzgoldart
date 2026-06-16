/*
  # Create Blog System

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text) - Blog post title
      - `slug` (text, unique) - URL-friendly identifier
      - `content` (text) - Main blog content
      - `excerpt` (text) - Short preview text
      - `featured_media_url` (text, nullable) - URL to featured image/video
      - `featured_media_type` (text, nullable) - Type: 'image' or 'video'
      - `featured_thumb_url` (text, nullable) - Thumbnail for video
      - `status` (text) - 'draft' or 'published'
      - `published_at` (timestamptz, nullable) - Publication timestamp
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `blog_posts` table
    - Public can read published posts
    - Only authenticated users can manage posts

  3. Storage
    - Create 'blog-media' bucket for blog images and videos
    - Public read access for published content
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  featured_media_url text,
  featured_media_type text,
  featured_thumb_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view blog media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can upload blog media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can update blog media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-media')
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can delete blog media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-media');