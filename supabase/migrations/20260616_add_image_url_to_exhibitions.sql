/*
  # Add Image Upload Support to Exhibitions

  ## Changes
  - Add `image_url` column to exhibitions table to store exhibition images/artwork
  - Allows admins to upload artwork or event photos for each exhibition
*/

ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS image_url text;
