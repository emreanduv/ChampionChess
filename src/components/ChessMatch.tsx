import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { Team } from '../types'

interface ChessMatchProps {
  homeTeam: Team
  awayTeam: Team
  isHomeTeam: boolean
  playerName: string
  onMatchComplete: (homeScore: number, awayScore: number, matchType: 'chess') => void
  onCancel: () => void
}

export default function ChessMatch({
  homeTeam,
  awayTeam,
  isHomeTeam,
  playerName,
  onMatchComplete,
  onCancel,
}: ChessMatchProps) {
  const [game, setGame] = useState(new Chess())
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  const boardColors = {
    lightSquare: isHomeTeam ? homeTeam.secondary_color : awayTeam.secondary_color,
    darkSquare: isHomeTeam ? homeTeam.primary_color : awayTeam.primary_color,
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })

      if (move === null) return false

      setGame(gameCopy)
      setMoveHistory([...moveHistory, move.san])

      if (gameCopy.isGameOver()) {
        setTimeout(() => {
          let homeScore = 0
          let awayScore = 0

          if (gameCopy.isCheckmate()) {
            if (gameCopy.turn() === 'w') {
              awayScore = 1
            } else {
              homeScore = 1
            }
          }

          onMatchComplete(homeScore, awayScore, 'chess')
        }, 500)
      }

      return true
    } catch (error) {
      return false
    }
  }

  const handleForfeit = () => {
    if (confirm('Maçı terk etmek istediğinize emin misiniz? Bu maç yenilgi olarak kaydedilecek.')) {
      const homeScore = isHomeTeam ? 0 : 1
      const awayScore = isHomeTeam ? 1 : 0
      onMatchComplete(homeScore, awayScore, 'chess')
    }
  }

  return (
    <div className="chess-match">
      <div className="match-info">
        <div className="team-info">
          <div
            className="team-color-strip"
            style={{ backgroundColor: homeTeam.primary_color }}
          ></div>
          <div>
            <h3>{homeTeam.name}</h3>
            <p>{isHomeTeam ? playerName : homeTeam.manager}</p>
          </div>
        </div>
        <div className="match-status">
          <div className="turn-indicator">
            Sıra: {game.turn() === 'w' ? 'Beyaz' : 'Siyah'}
          </div>
          {game.isCheck() && <div className="check-warning">ŞAH!</div>}
          {game.isGameOver() && (
            <div className="game-over">
              {game.isCheckmate()
                ? `${game.turn() === 'w' ? 'Siyah' : 'Beyaz'} Kazandı!`
                : 'Berabere!'}
            </div>
          )}
        </div>
        <div className="team-info">
          <div
            className="team-color-strip"
            style={{ backgroundColor: awayTeam.primary_color }}
          ></div>
          <div>
            <h3>{awayTeam.name}</h3>
            <p>{!isHomeTeam ? playerName : awayTeam.manager}</p>
          </div>
        </div>
      </div>

      <div className="chess-board-wrapper">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={560}
          customLightSquareStyle={{ backgroundColor: boardColors.lightSquare }}
          customDarkSquareStyle={{ backgroundColor: boardColors.darkSquare }}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      <div className="match-controls">
        <button onClick={handleForfeit} className="forfeit-button">
          Maçı Terk Et
        </button>
        <button onClick={onCancel} className="back-button">
          Geri Dön
        </button>
      </div>

      {moveHistory.length > 0 && (
        <div className="moves-display">
          <h4>Hamleler</h4>
          <div className="moves-scroll">
            {moveHistory.map((move, index) => (
              <span key={index} className="move">
                {Math.floor(index / 2) + 1}
                {index % 2 === 0 ? '. ' : '... '}
                {move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
