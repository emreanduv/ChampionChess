/*
  # Turkish Super League Football Manager System

  ## Overview
  Championship Manager style football management game using chess/dice mechanics
  for Turkish Super League teams.

  ## New Tables

  ### `teams`
  - `id` (uuid, primary key) - Unique team identifier
  - `name` (text) - Team name (e.g., "Fenerbahçe")
  - `short_name` (text) - Short name (e.g., "FB")
  - `manager` (text) - Team manager/coach name
  - `primary_color` (text) - Primary team color (hex)
  - `secondary_color` (text) - Secondary team color (hex)
  - `logo_url` (text) - Team logo URL (optional)
  - `created_at` (timestamptz) - Creation timestamp

  ### `seasons`
  - `id` (uuid, primary key) - Unique season identifier
  - `player_name` (text) - User's name
  - `selected_team_id` (uuid) - User's selected team
  - `current_week` (integer) - Current match week (1-34)
  - `status` (text) - Season status (active, completed)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `league_standings`
  - `id` (uuid, primary key) - Unique standing identifier
  - `season_id` (uuid) - Reference to season
  - `team_id` (uuid) - Reference to team
  - `played` (integer) - Matches played
  - `won` (integer) - Matches won
  - `drawn` (integer) - Matches drawn
  - `lost` (integer) - Matches lost
  - `goals_for` (integer) - Goals scored
  - `goals_against` (integer) - Goals conceded
  - `points` (integer) - Total points

  ### `matches`
  - `id` (uuid, primary key) - Unique match identifier
  - `season_id` (uuid) - Reference to season
  - `week` (integer) - Match week number
  - `home_team_id` (uuid) - Home team
  - `away_team_id` (uuid) - Away team
  - `home_score` (integer) - Home team score (nullable until played)
  - `away_score` (integer) - Away team score (nullable until played)
  - `match_type` (text) - Match type (chess, dice)
  - `status` (text) - Match status (pending, completed)
  - `played_at` (timestamptz) - When match was played
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Allow public read access for teams
  - Allow public read/write for seasons, standings, and matches
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  manager text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  selected_team_id uuid NOT NULL REFERENCES teams(id),
  current_week integer DEFAULT 1,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- League standings table
CREATE TABLE IF NOT EXISTS league_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id),
  played integer DEFAULT 0,
  won integer DEFAULT 0,
  drawn integer DEFAULT 0,
  lost integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  points integer DEFAULT 0,
  UNIQUE(season_id, team_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  week integer NOT NULL,
  home_team_id uuid NOT NULL REFERENCES teams(id),
  away_team_id uuid NOT NULL REFERENCES teams(id),
  home_score integer,
  away_score integer,
  match_type text,
  status text DEFAULT 'pending',
  played_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Teams policies (read-only for everyone)
CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  TO anon
  USING (true);

-- Seasons policies
CREATE POLICY "Anyone can view seasons"
  ON seasons FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create seasons"
  ON seasons FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update seasons"
  ON seasons FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- League standings policies
CREATE POLICY "Anyone can view standings"
  ON league_standings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create standings"
  ON league_standings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update standings"
  ON league_standings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Matches policies
CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create matches"
  ON matches FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
  ON matches FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_league_standings_season ON league_standings(season_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_points ON league_standings(season_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season_id);
CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(season_id, week);
