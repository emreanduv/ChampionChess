/*
  # Champion Chess Database Schema

  1. New Tables
    - `chess_games`
      - `id` (uuid, primary key) - Unique game identifier
      - `player_white` (text) - White player name
      - `player_black` (text) - Black player name
      - `moves` (text) - Game moves in PGN format
      - `status` (text) - Game status (ongoing, white_won, black_won, draw)
      - `current_fen` (text) - Current board position in FEN notation
      - `created_at` (timestamptz) - Game creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      
  2. Security
    - Enable RLS on `chess_games` table
    - Add policy for public read access (anyone can view games)
    - Add policy for public insert access (anyone can create games)
    - Add policy for public update access (anyone can update games)
*/

CREATE TABLE IF NOT EXISTS chess_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_white text NOT NULL DEFAULT 'White Player',
  player_black text NOT NULL DEFAULT 'Black Player',
  moves text DEFAULT '',
  status text NOT NULL DEFAULT 'ongoing',
  current_fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games"
  ON chess_games
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create games"
  ON chess_games
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON chess_games
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
