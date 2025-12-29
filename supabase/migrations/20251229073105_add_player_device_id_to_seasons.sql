/*
  # Add Player Device ID to Seasons

  ## Changes
  1. Tables Modified
    - `seasons`
      - Add `player_device_id` column (text, nullable initially for existing records)
      - Add index on `player_device_id` for faster lookups
  
  ## Purpose
  - Enable multiple players to have independent seasons on different devices
  - Each device gets a unique ID stored in localStorage
  - Seasons are filtered by device ID so each player sees only their own games
  
  ## Notes
  - Existing seasons will have NULL player_device_id (can be cleaned up later)
  - New seasons will always include device ID
*/

-- Add player_device_id column to seasons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seasons' AND column_name = 'player_device_id'
  ) THEN
    ALTER TABLE seasons ADD COLUMN player_device_id text;
  END IF;
END $$;

-- Create index for faster device-based queries
CREATE INDEX IF NOT EXISTS idx_seasons_player_device_id 
  ON seasons(player_device_id) 
  WHERE player_device_id IS NOT NULL;

-- Create index for device + status queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_seasons_device_status 
  ON seasons(player_device_id, status) 
  WHERE player_device_id IS NOT NULL;