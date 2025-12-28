import { useState } from 'react'
import { Team, Match } from '../types'
import ChessMatch from './ChessMatch'
import DiceMatch from './DiceMatch'

interface MatchScreenProps {
  match: Match & { home_team: Team; away_team: Team }
  userTeamId: string
  playerName: string
  onMatchComplete: (homeScore: number, awayScore: number, matchType: 'chess' | 'dice') => void
  onCancel: () => void
}

export default function MatchScreen({
  match,
  userTeamId,
  playerName,
  onMatchComplete,
  onCancel,
}: MatchScreenProps) {
  const [selectedMode, setSelectedMode] = useState<'chess' | 'dice' | null>(null)
  const isHomeTeam = match.home_team_id === userTeamId

  if (!selectedMode) {
    return (
      <div className="match-mode-selection">
        <div className="match-header">
          <h2>Hafta {match.week}</h2>
          <div className="match-teams">
            <div className="team-display home">
              <div
                className="team-color-box"
                style={{
                  background: `linear-gradient(135deg, ${match.home_team.primary_color} 0%, ${match.home_team.secondary_color} 100%)`,
                }}
              ></div>
              <div className="team-details">
                <h3>{match.home_team.name}</h3>
                <p>{isHomeTeam ? playerName : match.home_team.manager}</p>
              </div>
            </div>
            <div className="vs">VS</div>
            <div className="team-display away">
              <div
                className="team-color-box"
                style={{
                  background: `linear-gradient(135deg, ${match.away_team.primary_color} 0%, ${match.away_team.secondary_color} 100%)`,
                }}
              ></div>
              <div className="team-details">
                <h3>{match.away_team.name}</h3>
                <p>{!isHomeTeam ? playerName : match.away_team.manager}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mode-selection">
          <h3>Oyun Modunu Seç</h3>
          <div className="mode-buttons">
            <button
              className="mode-button chess"
              onClick={() => setSelectedMode('chess')}
            >
              <div className="mode-icon">♔</div>
              <h4>Satranç Oyna</h4>
              <p>Strateji ile maçı kazan</p>
            </button>
            <button
              className="mode-button dice"
              onClick={() => setSelectedMode('dice')}
            >
              <div className="mode-icon">⚅</div>
              <h4>Hızlı Maç</h4>
              <p>Zar atarak sonucu belirle</p>
            </button>
          </div>
        </div>

        <button className="cancel-button" onClick={onCancel}>
          İptal
        </button>
      </div>
    )
  }

  if (selectedMode === 'chess') {
    return (
      <ChessMatch
        homeTeam={match.home_team}
        awayTeam={match.away_team}
        isHomeTeam={isHomeTeam}
        playerName={playerName}
        onMatchComplete={onMatchComplete}
        onCancel={() => setSelectedMode(null)}
      />
    )
  }

  return (
    <DiceMatch
      homeTeam={match.home_team}
      awayTeam={match.away_team}
      isHomeTeam={isHomeTeam}
      playerName={playerName}
      onMatchComplete={onMatchComplete}
      onCancel={() => setSelectedMode(null)}
    />
  )
}
