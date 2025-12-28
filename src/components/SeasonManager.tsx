import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Season, Match, Team } from '../types'
import { updateMatchResult, simulateRemainingMatches } from '../utils/seasonUtils'
import MatchScreen from './MatchScreen'
import LeagueTable from './LeagueTable'

interface SeasonManagerProps {
  season: Season
  userTeam: Team
  playerName: string
  onSeasonEnd: () => void
}

export default function SeasonManager({
  season,
  userTeam,
  playerName,
  onSeasonEnd,
}: SeasonManagerProps) {
  const [currentMatches, setCurrentMatches] = useState<(Match & { home_team: Team; away_team: Team })[]>([])
  const [selectedMatch, setSelectedMatch] = useState<(Match & { home_team: Team; away_team: Team }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    loadCurrentWeekMatches()
  }, [season.current_week])

  const loadCurrentWeekMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('season_id', season.id)
      .eq('week', season.current_week)
      .eq('status', 'pending')

    if (data && !error) {
      setCurrentMatches(data as any)
    }
    setLoading(false)
  }

  const handleMatchComplete = async (homeScore: number, awayScore: number, matchType: 'chess' | 'dice' | 'backgammon') => {
    if (!selectedMatch) return

    try {
      await updateMatchResult(selectedMatch.id, homeScore, awayScore, matchType)

      setSelectedMatch(null)
      setLoading(true)

      await simulateRemainingMatches(season.id, season.current_week)

      const nextWeek = season.current_week + 1
      if (nextWeek <= 34) {
        await supabase
          .from('seasons')
          .update({ current_week: nextWeek, updated_at: new Date().toISOString() })
          .eq('id', season.id)

        window.location.reload()
      } else {
        await supabase
          .from('seasons')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', season.id)

        alert('Sezon tamamlandı! Tebrikler!')
        onSeasonEnd()
      }
    } catch (error) {
      console.error('Error updating match:', error)
      alert('Maç sonucu kaydedilirken bir hata oluştu.')
      setLoading(false)
    }
  }

  const getUserMatch = () => {
    return currentMatches.find(
      (m) => m.home_team_id === userTeam.id || m.away_team_id === userTeam.id
    )
  }

  if (selectedMatch) {
    return (
      <MatchScreen
        match={selectedMatch}
        userTeamId={userTeam.id}
        playerName={playerName}
        onMatchComplete={handleMatchComplete}
        onCancel={() => setSelectedMatch(null)}
      />
    )
  }

  if (loading) {
    return <div className="loading">Maçlar yükleniyor...</div>
  }

  const userMatch = getUserMatch()

  return (
    <div className="season-manager">
      <div className="season-header">
        <div className="season-info">
          <h1>Türkiye Süper Ligi</h1>
          <div className="season-details">
            <span className="week">Hafta {season.current_week}</span>
            <span className="team">
              <div
                className="team-color"
                style={{ backgroundColor: userTeam.primary_color }}
              ></div>
              {userTeam.name}
            </span>
            <span className="manager">{playerName}</span>
          </div>
        </div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="toggle-table-button"
        >
          {showTable ? 'Maçları Göster' : 'Puan Durumu'}
        </button>
      </div>

      {showTable ? (
        <LeagueTable seasonId={season.id} userTeamId={userTeam.id} />
      ) : (
        <div className="matches-container">
          <h2>Bu Haftanın Maçları</h2>

          {userMatch && (
            <div className="user-match-section">
              <h3>Sizin Maçınız</h3>
              <div
                className="match-card user-match"
                onClick={() => setSelectedMatch(userMatch)}
              >
                <div className="match-teams-display">
                  <div className="team">
                    <div
                      className="team-color"
                      style={{ backgroundColor: userMatch.home_team.primary_color }}
                    ></div>
                    <span>{userMatch.home_team.short_name}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="team">
                    <div
                      className="team-color"
                      style={{ backgroundColor: userMatch.away_team.primary_color }}
                    ></div>
                    <span>{userMatch.away_team.short_name}</span>
                  </div>
                </div>
                <button className="play-button">Maçı Oyna</button>
              </div>
            </div>
          )}

          <div className="other-matches-section">
            <h3>Diğer Maçlar</h3>
            <div className="matches-grid">
              {currentMatches
                .filter((m) => m.id !== userMatch?.id)
                .map((match) => (
                  <div key={match.id} className="match-card">
                    <div className="match-teams-display">
                      <div className="team">
                        <div
                          className="team-color"
                          style={{ backgroundColor: match.home_team.primary_color }}
                        ></div>
                        <span>{match.home_team.short_name}</span>
                      </div>
                      <span className="vs">-</span>
                      <div className="team">
                        <div
                          className="team-color"
                          style={{ backgroundColor: match.away_team.primary_color }}
                        ></div>
                        <span>{match.away_team.short_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
