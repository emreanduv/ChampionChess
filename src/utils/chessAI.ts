import { Chess } from 'chess.js'

export function makeAIMove(game: Chess, opponentStrength: number): boolean {
  const possibleMoves = game.moves({ verbose: true })

  if (possibleMoves.length === 0) {
    return false
  }

  const skillLevel = Math.min(10, Math.max(1, opponentStrength))
  const randomnessFactor = 11 - skillLevel

  let selectedMove

  if (Math.random() * 10 < randomnessFactor) {
    selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
  } else {
    const evaluatedMoves = possibleMoves.map(move => {
      const gameCopy = new Chess(game.fen())
      gameCopy.move(move)
      return {
        move,
        score: evaluatePosition(gameCopy, skillLevel)
      }
    })

    evaluatedMoves.sort((a, b) => b.score - a.score)

    const topMoves = evaluatedMoves.slice(0, Math.max(1, Math.floor(skillLevel / 2)))
    selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move
  }

  game.move(selectedMove)
  return true
}

function evaluatePosition(game: Chess, skillLevel: number): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -10000 : 10000
  }

  if (game.isDraw() || game.isStalemate()) {
    return 0
  }

  let score = 0
  const board = game.board()

  const pieceValues: { [key: string]: number } = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        const value = pieceValues[piece.type] || 0
        if (piece.color === 'b') {
          score += value
        } else {
          score -= value
        }
      }
    }
  }

  if (skillLevel >= 7) {
    if (game.isCheck()) {
      score += game.turn() === 'w' ? -20 : 20
    }

    const mobility = game.moves().length
    score += game.turn() === 'b' ? mobility * 0.5 : -mobility * 0.5
  }

  return score
}

export function shouldAIResign(game: Chess, opponentStrength: number): boolean {
  if (opponentStrength < 5) {
    return false
  }

  const board = game.board()
  let materialDifference = 0

  const pieceValues: { [key: string]: number } = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        const value = pieceValues[piece.type] || 0
        if (piece.color === 'b') {
          materialDifference += value
        } else {
          materialDifference -= value
        }
      }
    }
  }

  const resignThreshold = -15 + (opponentStrength - 5)

  return materialDifference < resignThreshold
}
