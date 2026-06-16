/*
  # Create Artist Section Management

  1. New Tables
    - `artist_section`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL for artist photo
      - `title` (text) - Section title (e.g., "About the Artist")
      - `paragraph_1` (text) - First paragraph content
      - `paragraph_2` (text) - Second paragraph content
      - `paragraph_3` (text) - Third paragraph content
      - `linktree_url` (text) - Linktree URL
      - `email` (text) - Contact email
      - `press_kit_url` (text) - Press kit URL
      - `is_active` (boolean) - Whether this content is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `artist_section` table
    - Add policy for public read access
    - Add policies for authenticated admin users to manage content

  3. Initial Data
    - Insert default artist section content
*/

CREATE TABLE IF NOT EXISTS artist_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL DEFAULT 'About the Artist',
  paragraph_1 text NOT NULL,
  paragraph_2 text NOT NULL,
  paragraph_3 text NOT NULL,
  linktree_url text DEFAULT '',
  email text DEFAULT 'hello@chazzgold.art',
  press_kit_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE artist_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active artist section"
  ON artist_section
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert artist section"
  ON artist_section
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update artist section"
  ON artist_section
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete artist section"
  ON artist_section
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO artist_section (
  image_url,
  title,
  paragraph_1,
  paragraph_2,
  paragraph_3,
  linktree_url,
  email,
  press_kit_url
) VALUES (
  'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&w=800',
  'About the Artist',
  'Chazz Gold is a photographer, DJ, and AI artist creating Techno-Divine Cybernetic Art — exploring sacred architecture, glitch halos, and human emotion through technology.',
  'After surviving a traumatic brain injury, Chazz rebuilt a creative life using the non-dominant hand, blending portrait photography and AI to craft surreal visual mythologies.',
  'Exhibited globally from NFT LA to NFT Paris, with work featured on Times Square billboards.',
  '#',
  'hello@chazzgold.art',
  '#'
);