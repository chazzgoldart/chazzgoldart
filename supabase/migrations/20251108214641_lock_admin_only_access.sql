/*
  # Lock Down Admin-Only Access

  ## Security Changes
  This migration restricts ALL data modification operations to admin users only.
  
  ## Tables Affected
  - artworks
  - platforms
  - chains
  - collections
  - blog_posts
  - blog_images
  - artist_section
  - exhibitions
  - slideshow_images
  - gallery_slideshow_images
  - social_links
  - contact_links
  - hero_slideshow_images
  - hero_parallax_gallery

  ## Policy Changes
  1. **Public Read Access**: All users can view published content (SELECT policies remain public)
  2. **Admin-Only Write Access**: Only authenticated users with `is_admin = true` can INSERT, UPDATE, DELETE
  
  ## Security Model
  - Checks `auth.jwt() -> 'app_metadata' -> 'is_admin'` for all write operations
  - Public users can only read data
  - Non-admin authenticated users can only read data
  - Only admin users can modify any data

  ## Important Notes
  - This completely locks down the admin panel
  - Only users with `is_admin = true` in their app_metadata can make changes
  - Public signup is disabled at the application level
*/

-- Drop all existing policies that allow unauthorized modifications
DO $$ 
DECLARE
  tbl text;
  pol record;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'artworks', 'platforms', 'chains', 'collections', 
      'blog_posts', 'blog_images', 'artist_section', 'exhibitions',
      'slideshow_images', 'gallery_slideshow_images', 
      'social_links', 'contact_links',
      'hero_slideshow_images', 'hero_parallax_gallery'
    )
  LOOP
    FOR pol IN 
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ARTWORKS POLICIES
CREATE POLICY "Public can view artworks"
  ON artworks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert artworks"
  ON artworks FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update artworks"
  ON artworks FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete artworks"
  ON artworks FOR DELETE
  TO authenticated
  USING (is_admin());

-- PLATFORMS POLICIES
CREATE POLICY "Public can view platforms"
  ON platforms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert platforms"
  ON platforms FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update platforms"
  ON platforms FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete platforms"
  ON platforms FOR DELETE
  TO authenticated
  USING (is_admin());

-- CHAINS POLICIES
CREATE POLICY "Public can view chains"
  ON chains FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert chains"
  ON chains FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update chains"
  ON chains FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete chains"
  ON chains FOR DELETE
  TO authenticated
  USING (is_admin());

-- COLLECTIONS POLICIES
CREATE POLICY "Public can view collections"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (is_admin());

-- BLOG POSTS POLICIES
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_admin());

-- BLOG IMAGES POLICIES
CREATE POLICY "Public can view blog images"
  ON blog_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert blog images"
  ON blog_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update blog images"
  ON blog_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete blog images"
  ON blog_images FOR DELETE
  TO authenticated
  USING (is_admin());

-- ARTIST SECTION POLICIES
CREATE POLICY "Public can view artist section"
  ON artist_section FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert artist section"
  ON artist_section FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update artist section"
  ON artist_section FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete artist section"
  ON artist_section FOR DELETE
  TO authenticated
  USING (is_admin());

-- EXHIBITIONS POLICIES
CREATE POLICY "Public can view exhibitions"
  ON exhibitions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert exhibitions"
  ON exhibitions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update exhibitions"
  ON exhibitions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete exhibitions"
  ON exhibitions FOR DELETE
  TO authenticated
  USING (is_admin());

-- SLIDESHOW IMAGES POLICIES
CREATE POLICY "Public can view slideshow images"
  ON slideshow_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert slideshow images"
  ON slideshow_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update slideshow images"
  ON slideshow_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete slideshow images"
  ON slideshow_images FOR DELETE
  TO authenticated
  USING (is_admin());

-- GALLERY SLIDESHOW IMAGES POLICIES
CREATE POLICY "Public can view gallery slideshow images"
  ON gallery_slideshow_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert gallery slideshow images"
  ON gallery_slideshow_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update gallery slideshow images"
  ON gallery_slideshow_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete gallery slideshow images"
  ON gallery_slideshow_images FOR DELETE
  TO authenticated
  USING (is_admin());

-- SOCIAL LINKS POLICIES
CREATE POLICY "Public can view social links"
  ON social_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update social links"
  ON social_links FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (is_admin());

-- CONTACT LINKS POLICIES
CREATE POLICY "Public can view contact links"
  ON contact_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert contact links"
  ON contact_links FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update contact links"
  ON contact_links FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete contact links"
  ON contact_links FOR DELETE
  TO authenticated
  USING (is_admin());

-- HERO SLIDESHOW IMAGES POLICIES
CREATE POLICY "Public can view hero slideshow images"
  ON hero_slideshow_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert hero slideshow images"
  ON hero_slideshow_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update hero slideshow images"
  ON hero_slideshow_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete hero slideshow images"
  ON hero_slideshow_images FOR DELETE
  TO authenticated
  USING (is_admin());

-- HERO PARALLAX GALLERY POLICIES
CREATE POLICY "Public can view hero parallax gallery"
  ON hero_parallax_gallery FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert hero parallax gallery"
  ON hero_parallax_gallery FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can update hero parallax gallery"
  ON hero_parallax_gallery FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete hero parallax gallery"
  ON hero_parallax_gallery FOR DELETE
  TO authenticated
  USING (is_admin());