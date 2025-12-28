import { useState } from 'react'
import ChessGame from './components/ChessGame'
import GameHistory from './components/GameHistory'
import './App.css'

export default function App() {
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleGameEnd = (result: string) => {
    setTimeout(() => {
      alert(`Oyun sona erdi: ${result}`)
    }, 100)
  }

  const handleLoadGame = (gameId: string) => {
    setCurrentGameId(gameId)
    setShowHistory(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Champion Chess</h1>
        <p className="tagline">Profesyonel Satranç Platformu</p>
      </header>

      <main className="app-main">
        <div className="content-wrapper">
          <div className="left-panel">
            <ChessGame gameId={currentGameId} onGameEnd={handleGameEnd} />
          </div>

          <div className="right-panel">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="toggle-history"
            >
              {showHistory ? 'Geçmişi Gizle' : 'Oyun Geçmişini Göster'}
            </button>
            {showHistory && <GameHistory onLoadGame={handleLoadGame} />}
          </div>
        </div>
      </main>
    </div>
  )
}
