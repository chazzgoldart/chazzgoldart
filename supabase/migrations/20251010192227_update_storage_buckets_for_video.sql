/*
  # Update Storage Buckets for Video Support

  ## Changes
  - Update `artwork-media` bucket to allow video MIME types
  - Set file size limit to 50 MB (52428800 bytes)
  - Allow image and video MIME types explicitly
*/

-- Update artwork-media bucket to allow videos and set size limit
UPDATE storage.buckets
SET 
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ]
WHERE id = 'artwork-media';

-- Update artwork-thumbs bucket (images only, smaller limit)
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
WHERE id = 'artwork-thumbs';
