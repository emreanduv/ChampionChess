import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Team } from '../types'

interface TeamSelectionProps {
  onTeamSelected: (teamId: string, playerName: string) => void
}

export default function TeamSelection({ onTeamSelected }: TeamSelectionProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [playerName, setPlayerName] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (data && !error) {
      setTeams(data)
    }
    setLoading(false)
  }

  const handleStart = () => {
    if (selectedTeam && playerName.trim()) {
      onTeamSelected(selectedTeam, playerName.trim())
    }
  }

  if (loading) {
    return (
      <div className="team-selection-loading">
        <div className="spinner"></div>
        <p>Takımlar yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="team-selection">
      <div className="selection-header">
        <h1>Türkiye Süper Ligi</h1>
        <p className="subtitle">Championship Manager</p>
      </div>

      <div className="player-name-section">
        <label htmlFor="playerName">Adınız</label>
        <input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Menajer adınızı girin"
          maxLength={30}
        />
      </div>

      <div className="team-grid">
        <h2>Takımınızı Seçin</h2>
        <div className="teams-container">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`team-card ${selectedTeam === team.id ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team.id)}
              style={{
                borderColor: selectedTeam === team.id ? team.primary_color : 'transparent',
              }}
            >
              <div
                className="team-colors"
                style={{
                  background: `linear-gradient(135deg, ${team.primary_color} 0%, ${team.secondary_color} 100%)`,
                }}
              ></div>
              <div className="team-info">
                <h3>{team.name}</h3>
                <p className="manager">Teknik Direktör: {team.manager}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="start-button-container">
        <button
          onClick={handleStart}
          disabled={!selectedTeam || !playerName.trim()}
          className="start-season-button"
        >
          Sezonu Başlat
        </button>
      </div>
    </div>
  )
}
