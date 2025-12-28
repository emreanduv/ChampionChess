import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { supabase } from '../lib/supabase'

interface ChessGameProps {
  gameId: string | null
  onGameEnd: (result: string) => void
}

export default function ChessGame({ gameId, onGameEnd }: ChessGameProps) {
  const [game, setGame] = useState(new Chess())
  const [currentGameId, setCurrentGameId] = useState<string | null>(gameId)
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  useEffect(() => {
    if (gameId) {
      loadGame(gameId)
    }
  }, [gameId])

  const loadGame = async (id: string) => {
    const { data, error } = await supabase
      .from('chess_games')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (data && !error) {
      const loadedGame = new Chess(data.current_fen)
      setGame(loadedGame)
      setMoveHistory(data.moves ? data.moves.split(',').filter(Boolean) : [])
    }
  }

  const saveGame = async (gameInstance: Chess, move: string) => {
    const newMoves = [...moveHistory, move]
    const status = gameInstance.isGameOver()
      ? gameInstance.isCheckmate()
        ? gameInstance.turn() === 'w'
          ? 'black_won'
          : 'white_won'
        : 'draw'
      : 'ongoing'

    if (currentGameId) {
      await supabase
        .from('chess_games')
        .update({
          moves: newMoves.join(','),
          current_fen: gameInstance.fen(),
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentGameId)
    } else {
      const { data } = await supabase
        .from('chess_games')
        .insert({
          moves: newMoves.join(','),
          current_fen: gameInstance.fen(),
          status,
        })
        .select()
        .single()

      if (data) {
        setCurrentGameId(data.id)
      }
    }

    if (status !== 'ongoing') {
      onGameEnd(status)
    }
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
      const moveNotation = move.san
      setMoveHistory([...moveHistory, moveNotation])
      saveGame(gameCopy, moveNotation)

      return true
    } catch (error) {
      return false
    }
  }

  const resetGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setMoveHistory([])
    setCurrentGameId(null)
  }

  return (
    <div className="chess-game">
      <div className="game-info">
        <h2>Champion Chess</h2>
        <div className="turn-indicator">
          Sıra: {game.turn() === 'w' ? 'Beyaz' : 'Siyah'}
        </div>
        {game.isCheck() && <div className="check-warning">ŞAH!</div>}
        {game.isGameOver() && (
          <div className="game-over">
            {game.isCheckmate()
              ? `Oyun Bitti! ${game.turn() === 'w' ? 'Siyah' : 'Beyaz'} Kazandı!`
              : 'Oyun Berabere!'}
          </div>
        )}
      </div>

      <div className="board-container">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={560}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      <div className="game-controls">
        <button onClick={resetGame} className="reset-button">
          Yeni Oyun
        </button>
      </div>

      <div className="move-history">
        <h3>Hamle Geçmişi</h3>
        <div className="moves-list">
          {moveHistory.map((move, index) => (
            <span key={index} className="move-item">
              {Math.floor(index / 2) + 1}
              {index % 2 === 0 ? '. ' : '... '}
              {move}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
