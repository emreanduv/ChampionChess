import { useState, useEffect } from 'react';
import { Team } from '../types';
import {
  BackgammonState,
  createInitialBackgammonState,
  rollDice,
  getPossibleMoves,
  makeMove,
  makeAIMove,
  getPlayerNumber
} from '../utils/backgammonAI';

interface BackgammonMatchProps {
  homeTeam: Team;
  awayTeam: Team;
  isHomeTeam: boolean;
  playerName: string;
  onMatchComplete: (homeScore: number, awayScore: number, matchType: 'backgammon') => void;
  onCancel: () => void;
}

const BackgammonMatch = ({ homeTeam, awayTeam, isHomeTeam, onMatchComplete }: BackgammonMatchProps) => {
  const [gameState, setGameState] = useState<BackgammonState | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<number[]>([]);
  const [message, setMessage] = useState('Zarları at!');
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    const state = createInitialBackgammonState(homeTeam.primary_color, awayTeam.primary_color);
    setGameState(state);
  }, [homeTeam, awayTeam]);

  const handleRollDice = () => {
    if (!gameState || gameState.availableMoves.length > 0 || isRolling) return;

    setIsRolling(true);
    const dice = rollDice();

    setTimeout(() => {
      const newState = { ...gameState, dice, availableMoves: [...dice] };
      setGameState(newState);
      setMessage(`${dice.join(', ')} geldi! Taşını seç.`);
      setIsRolling(false);
    }, 500);
  };

  const handlePointClick = (pointIndex: number) => {
    if (!gameState || gameState.currentPlayer !== 'home' || gameState.availableMoves.length === 0) {
      return;
    }

    const playerNum = getPlayerNumber('home');
    const pieces = gameState.points[pointIndex];

    if (pieces.length > 0 && pieces[0] === playerNum) {
      setSelectedPoint(pointIndex);
      const moves = getPossibleMoves(gameState, pointIndex);
      setPossibleMoves(moves);
      setMessage('Hedef noktayı seç.');
    } else if (selectedPoint !== null && possibleMoves.includes(pointIndex)) {
      executeMove(selectedPoint, pointIndex);
    }
  };

  const handleBearOff = () => {
    if (selectedPoint !== null && possibleMoves.includes(-1)) {
      executeMove(selectedPoint, -1);
    }
  };

  const executeMove = (from: number, to: number) => {
    if (!gameState) return;

    const newState = makeMove(gameState, from, to);
    setGameState(newState);
    setSelectedPoint(null);
    setPossibleMoves([]);

    if (newState.winner === 'home') {
      setMessage(isHomeTeam ? 'Kazandınız!' : 'Rakip kazandı!');
      setTimeout(() => {
        onMatchComplete(3, 0, 'backgammon');
      }, 1000);
      return;
    }

    if (newState.availableMoves.length === 0) {
      setMessage('Rakibin sırası...');
      setTimeout(() => aiTurn(newState), 1000);
    } else {
      setMessage('Hamlenizi yapın.');
    }
  };

  const aiTurn = (state: BackgammonState) => {
    const dice = rollDice();
    const stateWithDice = { ...state, dice, availableMoves: [...dice], currentPlayer: 'away' as const };

    setTimeout(() => {
      const newState = makeAIMove(stateWithDice);

      if (newState.winner === 'away') {
        setGameState(newState);
        setMessage(isHomeTeam ? 'Rakip kazandı!' : 'Kazandınız!');
        setTimeout(() => {
          onMatchComplete(0, 3, 'backgammon');
        }, 1000);
        return;
      }

      const finalState = {
        ...newState,
        currentPlayer: 'home' as const,
        availableMoves: [],
        dice: []
      };

      setGameState(finalState);
      setMessage('Senin sıran! Zarları at.');
    }, 1500);
  };

  const renderPoint = (pointIndex: number) => {
    if (!gameState) return null;

    const pieces = gameState.points[pointIndex];
    const isTop = pointIndex >= 12;
    const isSelected = selectedPoint === pointIndex;
    const isPossibleMove = possibleMoves.includes(pointIndex);

    const playerNum = pieces.length > 0 ? pieces[0] : 0;
    const color = playerNum === 1 ? homeTeam.primary_color : playerNum === 2 ? awayTeam.primary_color : '#8B4513';

    const isEvenPoint = pointIndex % 2 === (pointIndex < 12 ? 0 : 1);
    const pointColor = isEvenPoint ? '#D2691E' : '#F4A460';

    return (
      <div
        key={pointIndex}
        onClick={() => handlePointClick(pointIndex)}
        style={{
          width: '40px',
          height: '180px',
          background: `linear-gradient(${isTop ? '180deg' : '0deg'}, ${pointColor} 0%, ${pointColor}dd 100%)`,
          clipPath: isTop
            ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
            : 'polygon(0% 0%, 100% 0%, 50% 100%)',
          position: 'relative',
          cursor: 'pointer',
          border: isSelected ? '3px solid #FFD700' : isPossibleMove ? '3px solid #32CD32' : 'none',
          boxShadow: isSelected ? '0 0 15px #FFD700' : isPossibleMove ? '0 0 10px #32CD32' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          position: 'absolute',
          top: isTop ? '10px' : 'auto',
          bottom: !isTop ? '10px' : 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: isTop ? 'column' : 'column-reverse',
          gap: '2px',
          alignItems: 'center'
        }}>
          {pieces.slice(0, 5).map((_, i) => (
            <div
              key={i}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color})`,
                border: '2px solid rgba(0,0,0,0.3)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          ))}
          {pieces.length > 5 && (
            <div style={{
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              marginTop: '4px'
            }}>
              +{pieces.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!gameState) return <div>Yükleniyor...</div>;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '15px',
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        borderRadius: '12px',
        color: '#fff'
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            {homeTeam.name}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Toplanan: {gameState.off.home}/15</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            {awayTeam.name}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Toplanan: {gameState.off.away}/15</div>
        </div>
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${homeTeam.primary_color}20, ${homeTeam.primary_color}10)`,
        border: `4px solid ${homeTeam.primary_color}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '10px' }}>
          {Array.from({ length: 6 }, (_, i) => i + 12).map(renderPoint)}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          margin: '0 20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8B4513, #A0522D)',
            padding: '20px',
            borderRadius: '12px',
            minWidth: '120px',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>Bar</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {gameState.bar.home} | {gameState.bar.away}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px',
              justifyContent: 'center'
            }}>
              {gameState.dice.map((die, i) => (
                <div
                  key={i}
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #fff, #f0f0f0)',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: isRolling ? 'roll 0.5s ease-in-out' : 'none'
                  }}
                >
                  {die}
                </div>
              ))}
            </div>

            <button
              onClick={handleRollDice}
              disabled={gameState.availableMoves.length > 0 || isRolling || gameState.currentPlayer !== 'home'}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: gameState.availableMoves.length === 0 && !isRolling && gameState.currentPlayer === 'home'
                  ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                  : 'linear-gradient(135deg, #999, #888)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: gameState.availableMoves.length === 0 && !isRolling && gameState.currentPlayer === 'home' ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s',
                marginBottom: '10px'
              }}
            >
              {isRolling ? '🎲' : 'Zarları At'}
            </button>

            {possibleMoves.includes(-1) && (
              <button
                onClick={handleBearOff}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #FF6B6B, #E74C3C)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  marginLeft: '10px'
                }}
              >
                Taşı Topla
              </button>
            )}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8B4513, #A0522D)',
            padding: '20px',
            borderRadius: '12px',
            minWidth: '120px',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>Toplanan</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {gameState.off.home} | {gameState.off.away}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
          {Array.from({ length: 6 }, (_, i) => 11 - i).map(renderPoint)}
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: 'linear-gradient(135deg, #34495e, #2c3e50)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        {message}
      </div>

      <style>
        {`
          @keyframes roll {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(90deg); }
            50% { transform: rotate(180deg); }
            75% { transform: rotate(270deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BackgammonMatch;
