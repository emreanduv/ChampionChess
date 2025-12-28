import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LeagueStanding, Team } from '../types'

interface LeagueTableProps {
  seasonId: string
  userTeamId: string
}

export default function LeagueTable({ seasonId, userTeamId }: LeagueTableProps) {
  const [standings, setStandings] = useState<(LeagueStanding & { team: Team })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStandings()
  }, [seasonId])

  const loadStandings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('league_standings')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('season_id', seasonId)
      .order('points', { ascending: false })
      .order('goals_for', { ascending: false })

    if (data && !error) {
      setStandings(data as any)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="loading">Puan durumu yükleniyor...</div>
  }

  return (
    <div className="league-table">
      <h2>Puan Durumu</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="pos">#</th>
              <th className="team">Takım</th>
              <th>O</th>
              <th>G</th>
              <th>B</th>
              <th>M</th>
              <th>A</th>
              <th>Y</th>
              <th>AV</th>
              <th className="points">P</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr
                key={standing.id}
                className={standing.team_id === userTeamId ? 'user-team' : ''}
              >
                <td className="pos">{index + 1}</td>
                <td className="team">
                  <div className="team-cell">
                    <div
                      className="team-color-indicator"
                      style={{ backgroundColor: standing.team.primary_color }}
                    ></div>
                    <span>{standing.team.short_name}</span>
                  </div>
                </td>
                <td>{standing.played}</td>
                <td>{standing.won}</td>
                <td>{standing.drawn}</td>
                <td>{standing.lost}</td>
                <td>{standing.goals_for}</td>
                <td>{standing.goals_against}</td>
                <td>{standing.goals_for - standing.goals_against}</td>
                <td className="points">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-legend">
        <span>O: Oynanan</span>
        <span>G: Galibiyet</span>
        <span>B: Beraberlik</span>
        <span>M: Mağlubiyet</span>
        <span>A: Atılan</span>
        <span>Y: Yenilen</span>
        <span>AV: Averaj</span>
        <span>P: Puan</span>
      </div>
    </div>
  )
}
