/*
  # Fix Security Issues

  This migration addresses several security and performance issues identified in the database audit:

  ## Changes

  1. **Remove Unused Index**
     - Drop `exhibitions_display_order_idx` on `exhibitions` table (not being used)

  2. **Consolidate Blog Posts Policies**
     - Remove conflicting permissive SELECT policies for `blog_posts`
     - Replace with single policy that allows:
       - Anonymous users to view published posts only
       - Authenticated users to view all posts

  3. **Consolidate Social Links Policies**
     - Remove conflicting permissive SELECT policies for `social_links`
     - Replace with single policy that allows:
       - Anonymous users to view active links only
       - Authenticated users to view all links

  4. **Fix Function Search Path**
     - Add immutable search_path to `update_updated_at_column` function to prevent role-based path manipulation

  ## Security Notes
  - All policies maintain existing access patterns
  - No data access changes for end users
  - Function now protected against search path manipulation attacks
*/

-- 1. Drop unused index on exhibitions table
DROP INDEX IF EXISTS exhibitions_display_order_idx;

-- 2. Fix blog_posts policies - consolidate multiple permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON blog_posts;

CREATE POLICY "Public can view published posts, authenticated can view all"
  ON blog_posts
  FOR SELECT
  USING (
    CASE
      WHEN auth.role() = 'authenticated' THEN true
      ELSE status = 'published'
    END
  );

-- 3. Fix social_links policies - consolidate multiple permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can view active social links" ON social_links;
DROP POLICY IF EXISTS "Authenticated users can view all social links" ON social_links;

CREATE POLICY "Public can view active links, authenticated can view all"
  ON social_links
  FOR SELECT
  USING (
    CASE
      WHEN auth.role() = 'authenticated' THEN true
      ELSE is_active = true
    END
  );

-- 4. Fix function search path vulnerability
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';
