/*
  # Add Auto-Sync Features to Events

  1. Changes to `events` table
    - Add `auto_approve_photos` (boolean) - Whether to automatically approve synced photos
    - Add `sync_interval_minutes` (integer) - How often to sync in minutes (default: 5)
    - Add `last_synced_at` (timestamptz) - Track last successful sync time
    - Add `google_refresh_token` (text) - Store OAuth refresh token for auto-sync
  
  2. Purpose
    - Enable real-time automatic photo syncing from Google Drive
    - Allow per-event control over photo approval workflow
    - Track sync status for each event
*/

ALTER TABLE events
ADD COLUMN IF NOT EXISTS auto_approve_photos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_interval_minutes integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
ADD COLUMN IF NOT EXISTS google_refresh_token text;