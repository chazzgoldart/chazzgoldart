/*
  # Add Media Type Support to Collections

  1. Changes
    - Add `media_type` column to collections table to support both images and videos
    - Default to 'image' for existing entries

  2. Notes
    - This allows collection boxes to display either images or videos
    - Frontend will check media_type to render appropriate element
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'collections' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE collections ADD COLUMN media_type text DEFAULT 'image' NOT NULL;
  END IF;
END $$;