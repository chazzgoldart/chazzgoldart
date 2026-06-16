/*
  # Add Blog Images Support

  1. New Tables
    - `blog_images`
      - `id` (uuid, primary key) - Unique identifier
      - `blog_post_id` (uuid, foreign key) - Reference to blog post
      - `image_url` (text) - URL to the uploaded image
      - `caption` (text, nullable) - Optional image caption
      - `display_order` (integer) - Order of images in the post
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `blog_images` table
    - Public can read images from published posts
    - Authenticated users can manage images

  3. Changes
    - Allows multiple images per blog post
    - Images can be ordered and captioned
*/

CREATE TABLE IF NOT EXISTS blog_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images from published posts"
  ON blog_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_images.blog_post_id
      AND blog_posts.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can view all blog images"
  ON blog_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blog images"
  ON blog_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog images"
  ON blog_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog images"
  ON blog_images
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_order ON blog_images(blog_post_id, display_order);
