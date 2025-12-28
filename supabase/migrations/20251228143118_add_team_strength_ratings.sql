/*
  # Add Team Strength Rating System

  ## Overview
  Adds strength ratings (1-10) to teams to ensure realistic match results
  and season outcomes based on real-world team performance levels.

  ## Changes
  1. Modifications
    - Add `strength` column to `teams` table (integer 1-10)
    - Default value: 5 (average)
  
  2. Data Updates
    - Top tier teams (8-9): Galatasaray, Fenerbahçe, Beşiktaş, Trabzonspor
    - Mid tier teams (6-7): Başakşehir, Konyaspor, Alanyaspor, Sivasspor
    - Lower tier teams (4-5): Other teams
  
  3. Notes
    - Higher strength = better performance in matches
    - Used for AI difficulty in chess matches
    - Used for dice roll modifiers in quick matches
*/

-- Add strength column to teams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'strength'
  ) THEN
    ALTER TABLE teams ADD COLUMN strength integer DEFAULT 5;
  END IF;
END $$;

-- Update team strength ratings based on real-world performance
UPDATE teams SET strength = 9 WHERE name = 'Galatasaray';
UPDATE teams SET strength = 9 WHERE name = 'Fenerbahçe';
UPDATE teams SET strength = 8 WHERE name = 'Beşiktaş';
UPDATE teams SET strength = 8 WHERE name = 'Trabzonspor';
UPDATE teams SET strength = 7 WHERE name = 'Başakşehir';
UPDATE teams SET strength = 7 WHERE name = 'Konyaspor';
UPDATE teams SET strength = 7 WHERE name = 'Alanyaspor';
UPDATE teams SET strength = 6 WHERE name = 'Sivasspor';
UPDATE teams SET strength = 6 WHERE name = 'Antalyaspor';
UPDATE teams SET strength = 6 WHERE name = 'Adana Demirspor';
UPDATE teams SET strength = 5 WHERE name = 'Kasımpaşa';
UPDATE teams SET strength = 5 WHERE name = 'Gaziantep FK';
UPDATE teams SET strength = 5 WHERE name = 'Kayserispor';
UPDATE teams SET strength = 5 WHERE name = 'Samsunspor';
UPDATE teams SET strength = 4 WHERE name = 'Hatayspor';
UPDATE teams SET strength = 4 WHERE name = 'Rizespor';
UPDATE teams SET strength = 4 WHERE name = 'Fatih Karagümrük';
UPDATE teams SET strength = 4 WHERE name = 'Pendikspor';
