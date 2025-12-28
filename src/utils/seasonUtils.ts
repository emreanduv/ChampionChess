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

  const teamLastWeekHome: Record<string, boolean> = {}
  teamIds.forEach(id => {
    teamLastWeekHome[id] = false
  })

  for (let round = 0; round < totalRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (teamIds.length - 1)
      const away = (teamIds.length - 1 - match + round) % (teamIds.length - 1)

      let team1 = match === 0 ? teamIds[teamIds.length - 1] : teamIds[home]
      let team2 = teamIds[away]

      if (team1 !== 'BYE' && team2 !== 'BYE') {
        let homeTeam = team1
        let awayTeam = team2

        const team1WasHome = teamLastWeekHome[team1]
        const team2WasHome = teamLastWeekHome[team2]

        if (team1WasHome && !team2WasHome) {
          homeTeam = team2
          awayTeam = team1
        }

        fixtures.push({
          season_id: seasonId,
          week: round + 1,
          home_team_id: homeTeam,
          away_team_id: awayTeam,
          status: 'pending',
        })

        teamLastWeekHome[homeTeam] = true
        teamLastWeekHome[awayTeam] = false
      }
    }
  }

  for (let round = 0; round < totalRounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (teamIds.length - 1)
      const away = (teamIds.length - 1 - match + round) % (teamIds.length - 1)

      let team1 = match === 0 ? teamIds[teamIds.length - 1] : teamIds[home]
      let team2 = teamIds[away]

      if (team1 !== 'BYE' && team2 !== 'BYE') {
        let homeTeam = team2
        let awayTeam = team1

        const team1WasHome = teamLastWeekHome[team1]
        const team2WasHome = teamLastWeekHome[team2]

        if (team2WasHome && !team1WasHome) {
          homeTeam = team1
          awayTeam = team2
        }

        fixtures.push({
          season_id: seasonId,
          week: round + totalRounds + 1,
          home_team_id: homeTeam,
          away_team_id: awayTeam,
          status: 'pending',
        })

        teamLastWeekHome[homeTeam] = true
        teamLastWeekHome[awayTeam] = false
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
  matchType: 'chess' | 'dice' | 'backgammon'
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
  const calculateScore = (teamStrength: number, opponentStrength: number, isHome: boolean): number => {
    const strengthDiff = teamStrength - opponentStrength
    const homeAdvantage = isHome ? 0.5 : 0
    const effectiveStrength = teamStrength + homeAdvantage + (strengthDiff * 0.3)

    let goals = 0

    const roll1 = Math.random() * 10
    const roll2 = Math.random() * 10
    const roll3 = Math.random() * 10

    if (roll1 < effectiveStrength) goals++
    if (roll2 < effectiveStrength) goals++
    if (roll3 < effectiveStrength - 2) goals++

    const surpriseFactor = Math.random()
    if (surpriseFactor < 0.15 && strengthDiff < -2) {
      goals = Math.min(goals + 1, 4)
    }

    if (surpriseFactor > 0.85 && strengthDiff > 2) {
      goals = Math.max(goals - 1, 0)
    }

    return Math.min(goals, 4)
  }

  const homeScore = calculateScore(homeStrength, awayStrength, true)
  const awayScore = calculateScore(awayStrength, homeStrength, false)

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
