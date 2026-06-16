/*
  # Create Exhibitions Table

  1. New Tables
    - `exhibitions`
      - `id` (uuid, primary key)
      - `event_date` (date) - The date of the exhibition
      - `title` (text) - Name of the event
      - `location` (text) - City, State/Country
      - `venue` (text) - Specific venue or organizer
      - `artwork` (text, optional) - Featured artwork at the event
      - `notes` (text, optional) - Additional information
      - `display_order` (integer) - For custom ordering
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `exhibitions` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date date NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  venue text DEFAULT '',
  artwork text DEFAULT '',
  notes text DEFAULT '',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exhibitions"
  ON exhibitions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert exhibitions"
  ON exhibitions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update exhibitions"
  ON exhibitions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete exhibitions"
  ON exhibitions
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS exhibitions_event_date_idx ON exhibitions(event_date DESC);
CREATE INDEX IF NOT EXISTS exhibitions_display_order_idx ON exhibitions(display_order);
