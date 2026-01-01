export interface BackgammonPiece {
  point: number;
  player: 'home' | 'away';
}

export interface BackgammonState {
  points: number[][];
  bar: { home: number; away: number };
  off: { home: number; away: number };
  dice: number[];
  currentPlayer: 'home' | 'away';
  availableMoves: number[];
  selectedPoint: number | null;
  winner: 'home' | 'away' | null;
  homeColor: string;
  awayColor: string;
}

export const createInitialBackgammonState = (homeColor: string, awayColor: string): BackgammonState => {
  const points: number[][] = Array(24).fill(null).map(() => []);

  points[0] = [1, 1];
  points[11] = [1, 1, 1, 1, 1];
  points[16] = [1, 1, 1];
  points[18] = [1, 1, 1, 1, 1];

  points[23] = [2, 2];
  points[12] = [2, 2, 2, 2, 2];
  points[7] = [2, 2, 2];
  points[5] = [2, 2, 2, 2, 2];

  return {
    points,
    bar: { home: 0, away: 0 },
    off: { home: 0, away: 0 },
    dice: [],
    currentPlayer: 'home',
    availableMoves: [],
    selectedPoint: null,
    winner: null,
    homeColor,
    awayColor
  };
};

export const rollDice = (): number[] => {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;

  if (die1 === die2) {
    return [die1, die1, die1, die1];
  }
  return [die1, die2];
};

export const getPlayerNumber = (player: 'home' | 'away'): number => {
  return player === 'home' ? 1 : 2;
};

export const isValidMove = (
  state: BackgammonState,
  fromPoint: number,
  toPoint: number,
  _dieValue: number
): boolean => {
  const playerNum = getPlayerNumber(state.currentPlayer);

  if (fromPoint === -1) {
    return false;
  }

  if (fromPoint >= 0 && fromPoint < 24) {
    const pieces = state.points[fromPoint];
    if (pieces.length === 0 || pieces[0] !== playerNum) {
      return false;
    }
  }

  if (toPoint < -1 || toPoint > 23) {
    return false;
  }

  if (toPoint >= 0 && toPoint < 24) {
    const targetPieces = state.points[toPoint];
    const opponentNum = playerNum === 1 ? 2 : 1;
    if (targetPieces.length > 1 && targetPieces[0] === opponentNum) {
      return false;
    }
  }

  return true;
};

export const canBearOff = (state: BackgammonState, player: 'home' | 'away'): boolean => {
  const playerNum = getPlayerNumber(player);
  const homeBoard = player === 'home' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];

  if (state.bar[player] > 0) {
    return false;
  }

  for (let i = 0; i < 24; i++) {
    if (!homeBoard.includes(i)) {
      const pieces = state.points[i];
      if (pieces.length > 0 && pieces[0] === playerNum) {
        return false;
      }
    }
  }

  return true;
};

export const getPossibleMoves = (
  state: BackgammonState,
  fromPoint: number
): number[] => {
  const moves: number[] = [];
  const player = state.currentPlayer;
  const playerNum = getPlayerNumber(player);
  const direction = player === 'home' ? 1 : -1;

  if (fromPoint === -1 || !state.availableMoves.length) {
    return moves;
  }

  const pieces = state.points[fromPoint];
  if (pieces.length === 0 || pieces[0] !== playerNum) {
    return moves;
  }

  const uniqueDice = [...new Set(state.availableMoves)];

  for (const die of uniqueDice) {
    const toPoint = fromPoint + (die * direction);

    if (canBearOff(state, player)) {
      const homeBoard = player === 'home' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];
      if (homeBoard.includes(fromPoint)) {
        if ((player === 'home' && toPoint >= 24) || (player === 'away' && toPoint < 0)) {
          if (!moves.includes(-1)) {
            moves.push(-1);
          }
          continue;
        }
      }
    }

    if (toPoint >= 0 && toPoint < 24) {
      if (isValidMove(state, fromPoint, toPoint, die)) {
        moves.push(toPoint);
      }
    }
  }

  return [...new Set(moves)];
};

export const makeMove = (
  state: BackgammonState,
  fromPoint: number,
  toPoint: number
): BackgammonState => {
  const newState = JSON.parse(JSON.stringify(state)) as BackgammonState;
  const playerNum = getPlayerNumber(state.currentPlayer);
  const opponentNum = playerNum === 1 ? 2 : 1;
  const opponent = state.currentPlayer === 'home' ? 'away' : 'home';
  const direction = state.currentPlayer === 'home' ? 1 : -1;

  if (fromPoint >= 0 && fromPoint < 24) {
    newState.points[fromPoint] = newState.points[fromPoint].slice(1);
  }

  if (toPoint === -1) {
    newState.off[state.currentPlayer]++;

    const distanceNeeded = state.currentPlayer === 'home'
      ? 24 - fromPoint
      : fromPoint + 1;

    let dieToUse = distanceNeeded;
    if (!newState.availableMoves.includes(distanceNeeded)) {
      const validDice = newState.availableMoves.filter(d => d >= distanceNeeded);
      if (validDice.length > 0) {
        dieToUse = Math.min(...validDice);
      } else {
        dieToUse = newState.availableMoves[0];
      }
    }

    const dieIndex = newState.availableMoves.indexOf(dieToUse);
    if (dieIndex !== -1) {
      newState.availableMoves.splice(dieIndex, 1);
    }
  } else if (toPoint >= 0 && toPoint < 24) {
    const targetPieces = newState.points[toPoint];

    if (targetPieces.length === 1 && targetPieces[0] === opponentNum) {
      newState.bar[opponent]++;
      newState.points[toPoint] = [playerNum];
    } else {
      newState.points[toPoint].push(playerNum);
    }

    const dieUsed = (toPoint - fromPoint) * direction;
    const dieIndex = newState.availableMoves.indexOf(dieUsed);
    if (dieIndex !== -1) {
      newState.availableMoves.splice(dieIndex, 1);
    }
  }

  if (newState.off[state.currentPlayer] === 15) {
    newState.winner = state.currentPlayer;
  }

  return newState;
};

export const makeAIMove = (state: BackgammonState): BackgammonState => {
  let currentState = JSON.parse(JSON.stringify(state)) as BackgammonState;

  while (currentState.availableMoves.length > 0) {
    let bestMove: { from: number; to: number; score: number } | null = null;

    for (let point = 0; point < 24; point++) {
      const possibleMoves = getPossibleMoves(currentState, point);

      for (const toPoint of possibleMoves) {
        const score = Math.random();

        if (!bestMove || score > bestMove.score) {
          bestMove = { from: point, to: toPoint, score };
        }
      }
    }

    if (!bestMove) {
      break;
    }

    currentState = makeMove(currentState, bestMove.from, bestMove.to);
  }

  return currentState;
};
