import { useState } from 'react'
import { Team } from '../types'

interface DiceMatchProps {
  homeTeam: Team
  awayTeam: Team
  isHomeTeam: boolean
  playerName: string
  onMatchComplete: (homeScore: number, awayScore: number, matchType: 'dice') => void
  onCancel: () => void
}

export default function DiceMatch({
  homeTeam,
  awayTeam,
  isHomeTeam,
  playerName,
  onMatchComplete,
  onCancel,
}: DiceMatchProps) {
  const [homeScore, setHomeScore] = useState<number | null>(null)
  const [awayScore, setAwayScore] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [completed, setCompleted] = useState(false)

  const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1
  }

  const handleRoll = () => {
    setRolling(true)
    setHomeScore(null)
    setAwayScore(null)

    setTimeout(() => {
      const home = rollDice()
      const away = rollDice()
      setHomeScore(home)
      setAwayScore(away)
      setRolling(false)
      setCompleted(true)
    }, 1500)
  }

  const handleConfirm = () => {
    if (homeScore !== null && awayScore !== null) {
      onMatchComplete(homeScore, awayScore, 'dice')
    }
  }

  const getDiceEmoji = (score: number | null) => {
    if (score === null) return '⚀'
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
    return diceEmojis[score - 1]
  }

  return (
    <div className="dice-match">
      <div className="dice-header">
        <h2>Hızlı Maç - Zar Atma</h2>
        <p>Her takım için bir zar atılacak, sonuç maç skorunu belirleyecek</p>
      </div>

      <div className="dice-teams">
        <div className="dice-team home">
          <div
            className="team-color-banner"
            style={{
              background: `linear-gradient(135deg, ${homeTeam.primary_color} 0%, ${homeTeam.secondary_color} 100%)`,
            }}
          ></div>
          <h3>{homeTeam.name}</h3>
          <p className="manager">{isHomeTeam ? playerName : homeTeam.manager}</p>
          <div className={`dice-display ${rolling ? 'rolling' : ''}`}>
            {getDiceEmoji(homeScore)}
          </div>
          {homeScore !== null && (
            <div className="score-display">{homeScore}</div>
          )}
        </div>

        <div className="dice-vs">VS</div>

        <div className="dice-team away">
          <div
            className="team-color-banner"
            style={{
              background: `linear-gradient(135deg, ${awayTeam.primary_color} 0%, ${awayTeam.secondary_color} 100%)`,
            }}
          ></div>
          <h3>{awayTeam.name}</h3>
          <p className="manager">{!isHomeTeam ? playerName : awayTeam.manager}</p>
          <div className={`dice-display ${rolling ? 'rolling' : ''}`}>
            {getDiceEmoji(awayScore)}
          </div>
          {awayScore !== null && (
            <div className="score-display">{awayScore}</div>
          )}
        </div>
      </div>

      {completed && homeScore !== null && awayScore !== null && (
        <div className="match-result">
          {homeScore > awayScore && (
            <p className="result-text win">{homeTeam.name} Kazandı!</p>
          )}
          {awayScore > homeScore && (
            <p className="result-text win">{awayTeam.name} Kazandı!</p>
          )}
          {homeScore === awayScore && (
            <p className="result-text draw">Maç Berabere!</p>
          )}
        </div>
      )}

      <div className="dice-controls">
        {!completed && (
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="roll-button"
          >
            {rolling ? 'Zarlar Atılıyor...' : 'Zarları At'}
          </button>
        )}
        {completed && (
          <button onClick={handleConfirm} className="confirm-button">
            Sonucu Onayla
          </button>
        )}
        <button onClick={onCancel} className="cancel-button">
          İptal
        </button>
      </div>
    </div>
  )
}
