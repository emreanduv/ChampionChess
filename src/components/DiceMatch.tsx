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

  const handleRoll = () => {
    setRolling(true)
    setHomeScore(null)
    setAwayScore(null)

    setTimeout(() => {
      const homeFinal = calculateScore(homeTeam.strength, awayTeam.strength, true)
      const awayFinal = calculateScore(awayTeam.strength, homeTeam.strength, false)

      setHomeScore(homeFinal)
      setAwayScore(awayFinal)
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
    if (score === null) return '⚽'
    return '⚽'.repeat(Math.max(1, score))
  }

  return (
    <div className="dice-match">
      <div className="dice-header">
        <h2>Hızlı Maç - Simülasyon</h2>
        <p>Takım güçlerine göre maç simüle edilecek ve sonuç hesaplanacak</p>
        <div className="team-strengths">
          <span className="strength-info">
            {homeTeam.short_name}: Güç {homeTeam.strength}/10
          </span>
          <span className="strength-divider">|</span>
          <span className="strength-info">
            {awayTeam.short_name}: Güç {awayTeam.strength}/10
          </span>
        </div>
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
            {rolling ? 'Maç Oynanıyor...' : 'Maçı Oyna'}
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
