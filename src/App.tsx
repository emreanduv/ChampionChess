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
  const [existingSeason, setExistingSeason] = useState<(Season & { team: Team }) | null>(null)

  useEffect(() => {
    checkForActiveSeason()
  }, [])

  const checkForActiveSeason = async () => {
    setLoading(true)
    const { data: season } = await supabase
      .from('seasons')
      .select(`
        *,
        team:teams!seasons_selected_team_id_fkey(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (season) {
      setExistingSeason(season as any)
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

  const handleLoadSeason = async () => {
    if (existingSeason) {
      setActiveSeason(existingSeason)
      setUserTeam(existingSeason.team)
      setShowLoadScreen(false)
    }
  }

  const handleNewSeason = async () => {
    if (existingSeason) {
      const confirmed = confirm(
        'Mevcut sezonunuz silinecek ve yeni bir sezon başlatılacak. Devam etmek istiyor musunuz?'
      )
      if (!confirmed) return

      await supabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', existingSeason.id)
    }

    setShowLoadScreen(false)
    setActiveSeason(null)
    setUserTeam(null)
    setExistingSeason(null)
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

  if (showLoadScreen && existingSeason) {
    return (
      <div className="app">
        <div className="load-screen">
          <h1>Türkiye Süper Ligi</h1>
          <p className="subtitle">Championship Manager</p>

          <div className="load-options">
            <div className="existing-season-info">
              <h2>Devam Eden Sezon</h2>
              <div className="season-card-large">
                <div
                  className="team-colors-banner"
                  style={{
                    background: `linear-gradient(135deg, ${existingSeason.team.primary_color} 0%, ${existingSeason.team.secondary_color} 100%)`,
                  }}
                ></div>
                <div className="season-info-content">
                  <h3>{existingSeason.team.name}</h3>
                  <p className="player-name">Menajer: {existingSeason.player_name}</p>
                  <p className="week-info">Hafta: {existingSeason.current_week} / 34</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleLoadSeason} className="continue-button">
                Devam Et
              </button>
              <button onClick={handleNewSeason} className="new-season-button">
                Yeni Sezon Başlat
              </button>
            </div>
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
