import { supabase } from '../lib/supabase'

export async function createSeason(playerName: string, selectedTeamId: string) {
  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .insert({
      player_name: playerName,
      selected_team_id: selectedTeamId,
      current_week: 1,
      status: 'active',
    })
    .select()
    .single()

  if (seasonError || !season) {
    throw new Error('Failed to create season')
  }

  const { data: teams } = await supabase.from('teams').select('id')

  if (!teams) {
    throw new Error('Failed to load teams')
  }

  for (const team of teams) {
    await supabase.from('league_standings').insert({
      season_id: season.id,
      team_id: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    })
  }

  await generateFixtures(season.id, teams)

  return season
}

async function generateFixtures(seasonId: string, teams: { id: string }[]) {
  const teamIds = teams.map((t) => t.id)
  const numTeams = teamIds.length
  const fixtures: any[] = []

  if (numTeams % 2 !== 0) {
    teamIds.push('BYE')
  }

  const totalRounds = teamIds.length - 1
  const matchesPerRound = teamIds.length / 2

  for (let round = 0; round < totalRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (teamIds.length - 1)
      const away = (teamIds.length - 1 - match + round) % (teamIds.length - 1)

      let homeTeam = match === 0 ? teamIds[teamIds.length - 1] : teamIds[home]
      let awayTeam = teamIds[away]

      if (homeTeam !== 'BYE' && awayTeam !== 'BYE') {
        fixtures.push({
          season_id: seasonId,
          week: round + 1,
          home_team_id: homeTeam,
          away_team_id: awayTeam,
          status: 'pending',
        })
      }
    }
  }

  for (let round = 0; round < totalRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (teamIds.length - 1)
      const away = (teamIds.length - 1 - match + round) % (teamIds.length - 1)

      let homeTeam = match === 0 ? teamIds[teamIds.length - 1] : teamIds[home]
      let awayTeam = teamIds[away]

      if (homeTeam !== 'BYE' && awayTeam !== 'BYE') {
        fixtures.push({
          season_id: seasonId,
          week: round + totalRounds + 1,
          home_team_id: awayTeam,
          away_team_id: homeTeam,
          status: 'pending',
        })
      }
    }
  }

  await supabase.from('matches').insert(fixtures)
}

async function updateStandings(
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number
) {
  const { data: homeStanding } = await supabase
    .from('league_standings')
    .select('*')
    .eq('season_id', seasonId)
    .eq('team_id', homeTeamId)
    .single()

  const { data: awayStanding } = await supabase
    .from('league_standings')
    .select('*')
    .eq('season_id', seasonId)
    .eq('team_id', awayTeamId)
    .single()

  if (homeStanding && awayStanding) {
    let homePoints = 0
    let awayPoints = 0
    let homeWon = 0
    let awayWon = 0
    let homeDrawn = 0
    let awayDrawn = 0
    let homeLost = 0
    let awayLost = 0

    if (homeScore > awayScore) {
      homePoints = 3
      homeWon = 1
      awayLost = 1
    } else if (awayScore > homeScore) {
      awayPoints = 3
      awayWon = 1
      homeLost = 1
    } else {
      homePoints = 1
      awayPoints = 1
      homeDrawn = 1
      awayDrawn = 1
    }

    await supabase
      .from('league_standings')
      .update({
        played: homeStanding.played + 1,
        won: homeStanding.won + homeWon,
        drawn: homeStanding.drawn + homeDrawn,
        lost: homeStanding.lost + homeLost,
        goals_for: homeStanding.goals_for + homeScore,
        goals_against: homeStanding.goals_against + awayScore,
        points: homeStanding.points + homePoints,
      })
      .eq('id', homeStanding.id)

    await supabase
      .from('league_standings')
      .update({
        played: awayStanding.played + 1,
        won: awayStanding.won + awayWon,
        drawn: awayStanding.drawn + awayDrawn,
        lost: awayStanding.lost + awayLost,
        goals_for: awayStanding.goals_for + awayScore,
        goals_against: awayStanding.goals_against + homeScore,
        points: awayStanding.points + awayPoints,
      })
      .eq('id', awayStanding.id)
  }
}

export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  matchType: 'chess' | 'dice'
) {
  const { data: match } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .eq('id', matchId)
    .single()

  if (!match) {
    throw new Error('Match not found')
  }

  await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      match_type: matchType,
      status: 'completed',
      played_at: new Date().toISOString(),
    })
    .eq('id', matchId)

  await updateStandings(match.season_id, match.home_team_id, match.away_team_id, homeScore, awayScore)
}

function simulateMatchScore(homeStrength: number, awayStrength: number): { homeScore: number; awayScore: number } {
  const strengthDiff = homeStrength - awayStrength

  let homeAdvantage = 0.3
  if (homeStrength >= 8) {
    homeAdvantage = 0.5
  } else if (homeStrength >= 6) {
    homeAdvantage = 0.4
  }

  let awayPenalty = 0
  if (awayStrength >= 8) {
    awayPenalty = 0.3
  } else if (awayStrength >= 6) {
    awayPenalty = 0.2
  }

  const baseWinChance = 0.5 + (strengthDiff / 15)
  const homeWinChance = Math.min(0.85, Math.max(0.15, baseWinChance + homeAdvantage / 10))
  const awayWinChance = Math.min(0.85, Math.max(0.15, 1 - homeWinChance - awayPenalty / 10))
  const drawChance = 1 - homeWinChance - awayWinChance

  const outcome = Math.random()
  let homeScore = 0
  let awayScore = 0

  if (outcome < homeWinChance) {
    homeScore = Math.floor(Math.random() * 3) + 1
    awayScore = Math.random() < 0.4 ? 0 : Math.floor(Math.random() * 2)

    if (homeStrength >= 8 && awayStrength <= 5) {
      homeScore += Math.random() < 0.4 ? 1 : 0
    }
  } else if (outcome < homeWinChance + drawChance) {
    const drawScore = Math.random() < 0.5 ? (Math.random() < 0.6 ? 1 : 2) : 0
    homeScore = drawScore
    awayScore = drawScore
  } else {
    awayScore = Math.floor(Math.random() * 3) + 1
    homeScore = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 2)

    if (awayStrength - homeStrength >= 3) {
      awayScore += Math.random() < 0.3 ? 1 : 0
    }
  }

  if (homeScore > 5) homeScore = 5
  if (awayScore > 5) awayScore = 5

  return { homeScore, awayScore }
}

export async function simulateRemainingMatches(seasonId: string, week: number) {
  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .eq('season_id', seasonId)
    .eq('week', week)
    .eq('status', 'pending')

  if (!matches || matches.length === 0) {
    return
  }

  for (const match of matches) {
    const homeTeam = match.home_team as any
    const awayTeam = match.away_team as any

    const { homeScore, awayScore } = simulateMatchScore(homeTeam.strength, awayTeam.strength)

    await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        match_type: 'dice',
        status: 'completed',
        played_at: new Date().toISOString(),
      })
      .eq('id', match.id)

    await updateStandings(seasonId, match.home_team_id, match.away_team_id, homeScore, awayScore)
  }
}
