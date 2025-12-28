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
    const playerColor = isHomeTeam ? homeTeam.primary_color : awayTeam.primary_color;
    const opponentColor = isHomeTeam ? awayTeam.primary_color : homeTeam.primary_color;
    const state = createInitialBackgammonState(playerColor, opponentColor);
    setGameState(state);
  }, [homeTeam, awayTeam, isHomeTeam]);

  const handleRollDice = () => {
    if (!gameState || gameState.availableMoves.length > 0 || isRolling) return;

    setIsRolling(true);
    const dice = rollDice();

    setTimeout(() => {
      const newState = { ...gameState, dice, availableMoves: [...dice] };
      setGameState(newState);
      setMessage(`Zarlar: ${dice.join(', ')} geldi! Kalan: ${dice.length} hamle. Taşını seç.`);
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
      if (moves.length > 0) {
        const bearOffText = moves.includes(-1) ? ' veya Taşı Topla butonuna bas' : '';
        setMessage(`Nokta ${pointIndex} seçildi. Yeşil işaretli noktaya tıkla${bearOffText}.`);
      } else {
        setMessage(`Nokta ${pointIndex}'den hamle yok. Başka taş seç.`);
      }
    } else if (selectedPoint !== null && possibleMoves.includes(pointIndex)) {
      executeMove(selectedPoint, pointIndex);
    } else if (pieces.length === 0 || pieces[0] !== playerNum) {
      setMessage('Kendi taşlarını seç! Zarlar: ' + gameState.dice.join(', '));
    }
  };

  const handleBearOff = () => {
    if (selectedPoint !== null && possibleMoves.includes(-1)) {
      executeMove(selectedPoint, -1);
    }
  };

  const executeMove = (from: number, to: number) => {
    if (!gameState) return;

    const playerNum = getPlayerNumber('home');
    const opponentNum = playerNum === 1 ? 2 : 1;

    let moveMessage = '';
    if (to >= 0 && to < 24) {
      const targetPieces = gameState.points[to];
      if (targetPieces.length === 1 && targetPieces[0] === opponentNum) {
        moveMessage = '💥 Rakibin taşını vurdun! ';
      }
    } else if (to === -1) {
      moveMessage = '✅ Taş toplandı! ';
    }

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
      setMessage(moveMessage + 'Tüm hamleler yapıldı. Rakibin sırası...');
      setTimeout(() => aiTurn(newState), 1000);
    } else {
      setMessage(moveMessage + `Kalan: ${newState.availableMoves.length} hamle. Taşını seç ve hamle yap.`);
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

    const colorPattern = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1];
    const isEvenPoint = colorPattern[pointIndex] === 1;
    const pointColor = isEvenPoint ? '#D2691E' : '#F4A460';

    return (
      <div
        key={pointIndex}
        onClick={() => handlePointClick(pointIndex)}
        style={{
          width: '35px',
          height: '160px',
          background: `linear-gradient(${isTop ? '180deg' : '0deg'}, ${pointColor} 0%, ${pointColor}dd 100%)`,
          clipPath: isTop
            ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
            : 'polygon(0% 0%, 100% 0%, 50% 100%)',
          position: 'relative',
          cursor: 'pointer',
          border: isSelected ? '4px solid #FFD700' : isPossibleMove ? '4px solid #00FF00' : '1px solid rgba(0,0,0,0.2)',
          boxShadow: isSelected ? '0 0 20px #FFD700, inset 0 0 10px #FFD700' : isPossibleMove ? '0 0 20px #00FF00, inset 0 0 10px #00FF00' : 'none',
          transition: 'all 0.2s',
          transform: isSelected ? 'scale(1.05)' : isPossibleMove ? 'scale(1.03)' : 'scale(1)'
        }}
      >
        <div style={{
          position: 'absolute',
          [isTop ? 'top' : 'bottom']: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          zIndex: 100
        }}>
          {pointIndex}
        </div>
        <div style={{
          position: 'absolute',
          top: isTop ? '20px' : 'auto',
          bottom: !isTop ? '20px' : 'auto',
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
                width: '28px',
                height: '28px',
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
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
          {Array.from({ length: 6 }, (_, i) => i + 12).map(renderPoint)}
          <div style={{ width: '60px', background: '#8B4513', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>BAR</div>
          {Array.from({ length: 6 }, (_, i) => i + 18).map(renderPoint)}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px 0',
          gap: '20px'
        }}>
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
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: isRolling ? 'roll 0.5s ease-in-out' : 'none'
                  }}
                >
                  {die}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                  transition: 'all 0.3s'
                }}
              >
                {isRolling ? '🎲' : 'Zarları At'}
              </button>

              {possibleMoves.includes(-1) && (
                <button
                  onClick={handleBearOff}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #FF6B6B, #E74C3C)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  Taşı Topla
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
          {Array.from({ length: 6 }, (_, i) => 11 - i).map(renderPoint)}
          <div style={{ width: '60px', background: '#8B4513', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>OFF</div>
          {Array.from({ length: 6 }, (_, i) => 5 - i).map(renderPoint)}
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
