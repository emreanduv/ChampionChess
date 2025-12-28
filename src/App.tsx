import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Season, Team } from './types'
import { createSeason } from './utils/seasonUtils'
import TeamSelection from './components/TeamSelection'
import SeasonManager from './components/SeasonManager'
import './App.css'

export default function App() {
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoadScreen, setShowLoadScreen] = useState(false)
  const [savedSeasons, setSavedSeasons] = useState<(Season & { team: Team })[]>([])

  useEffect(() => {
    checkForActiveSeason()
  }, [])

  const checkForActiveSeason = async () => {
    setLoading(true)
    const { data: seasons } = await supabase
      .from('seasons')
      .select(`
        *,
        team:teams!seasons_selected_team_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (seasons && seasons.length > 0) {
      setSavedSeasons(seasons as any)
      setShowLoadScreen(true)
    }
    setLoading(false)
  }

  const handleTeamSelected = async (teamId: string, playerName: string) => {
    try {
      const season = await createSeason(playerName, teamId)
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (team) {
        setActiveSeason(season)
        setUserTeam(team)
      }
    } catch (error) {
      console.error('Error creating season:', error)
      alert('Sezon oluşturulurken bir hata oluştu.')
    }
  }

  const handleLoadSeason = async (season: Season & { team: Team }) => {
    setActiveSeason(season)
    setUserTeam(season.team)
    setShowLoadScreen(false)
  }

  const handleNewSeason = () => {
    setShowLoadScreen(false)
    setActiveSeason(null)
    setUserTeam(null)
  }

  const handleSeasonEnd = () => {
    setActiveSeason(null)
    setUserTeam(null)
    checkForActiveSeason()
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  if (showLoadScreen && savedSeasons.length > 0) {
    return (
      <div className="app">
        <div className="load-screen">
          <h1>Türkiye Süper Ligi</h1>
          <p className="subtitle">Championship Manager</p>

          <div className="load-options">
            <div className="saved-seasons">
              <h2>Kayıtlı Sezonlar</h2>
              {savedSeasons.map((season) => (
                <div
                  key={season.id}
                  className="saved-season-card"
                  onClick={() => handleLoadSeason(season)}
                >
                  <div
                    className="team-color-bar"
                    style={{ backgroundColor: season.team.primary_color }}
                  ></div>
                  <div className="season-details">
                    <h3>{season.team.name}</h3>
                    <p className="player-name">{season.player_name}</p>
                    <p className="week">Hafta {season.current_week}</p>
                    <span className={`status ${season.status}`}>
                      {season.status === 'active' ? 'Devam Ediyor' : 'Tamamlandı'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleNewSeason} className="new-season-button">
              Yeni Sezon Başlat
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!activeSeason || !userTeam) {
    return (
      <div className="app">
        <TeamSelection onTeamSelected={handleTeamSelected} />
      </div>
    )
  }

  return (
    <div className="app">
      <SeasonManager
        season={activeSeason}
        userTeam={userTeam}
        playerName={activeSeason.player_name}
        onSeasonEnd={handleSeasonEnd}
      />
    </div>
  )
}
