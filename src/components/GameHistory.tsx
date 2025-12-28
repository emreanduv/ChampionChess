import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Game {
  id: string
  player_white: string
  player_black: string
  status: string
  created_at: string
}

interface GameHistoryProps {
  onLoadGame: (gameId: string) => void
}

export default function GameHistory({ onLoadGame }: GameHistoryProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('chess_games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      setGames(data)
    }
    setLoading(false)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Devam Ediyor'
      case 'white_won':
        return 'Beyaz Kazandı'
      case 'black_won':
        return 'Siyah Kazandı'
      case 'draw':
        return 'Berabere'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>
  }

  return (
    <div className="game-history">
      <div className="history-header">
        <h2>Oyun Geçmişi</h2>
        <button onClick={loadGames} className="refresh-button">
          Yenile
        </button>
      </div>

      <div className="games-list">
        {games.length === 0 ? (
          <p className="no-games">Henüz oyun kaydı yok.</p>
        ) : (
          games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-players">
                <span className="player white">{game.player_white}</span>
                <span className="vs">vs</span>
                <span className="player black">{game.player_black}</span>
              </div>
              <div className="game-meta">
                <span className={`status ${game.status}`}>
                  {getStatusText(game.status)}
                </span>
                <span className="date">{formatDate(game.created_at)}</span>
              </div>
              {game.status === 'ongoing' && (
                <button
                  onClick={() => onLoadGame(game.id)}
                  className="load-button"
                >
                  Devam Et
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
