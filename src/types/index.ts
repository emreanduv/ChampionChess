export interface Team {
  id: string
  name: string
  short_name: string
  manager: string
  primary_color: string
  secondary_color: string
  logo_url?: string
}

export interface Season {
  id: string
  player_name: string
  selected_team_id: string
  current_week: number
  status: 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface LeagueStanding {
  id: string
  season_id: string
  team_id: string
  team?: Team
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
}

export interface Match {
  id: string
  season_id: string
  week: number
  home_team_id: string
  away_team_id: string
  home_team?: Team
  away_team?: Team
  home_score: number | null
  away_score: number | null
  match_type: 'chess' | 'dice' | null
  status: 'pending' | 'completed'
  played_at: string | null
  created_at: string
}
