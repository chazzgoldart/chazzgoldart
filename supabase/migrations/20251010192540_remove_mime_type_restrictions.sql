/*
  # Remove MIME Type Restrictions from Storage Buckets

  ## Changes
  - Remove MIME type restrictions to allow all file types
  - Keep file size limits for safety
*/

-- Remove MIME type restrictions from artwork-media bucket
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'artwork-media';

-- Remove MIME type restrictions from artwork-thumbs bucket
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'artwork-thumbs';
