import { describe, expect, it } from 'vitest'
import { bestMoves, chooseMove, currentTurn, emptyBoard, getOutcome, other, type Board, type Cell, type Mark } from './logic'

/** Builds a board from a 9-character string such as 'XO.X.....', where '.' is empty. */
function parse(cells: string): Cell[] {
  return [...cells].map((cell) => (cell === '.' ? null : (cell as Mark)))
}

describe('getOutcome', () => {
  it('is null while the round is in play', () => {
    expect(getOutcome(emptyBoard())).toBeNull()
    expect(getOutcome(parse('XO.X.....'))).toBeNull()
  })

  it('finds rows, columns and diagonals', () => {
    expect(getOutcome(parse('XXXOO....'))).toEqual({ winner: 'X', line: [0, 1, 2] })
    expect(getOutcome(parse('XO.XO..O.'))).toEqual({ winner: 'O', line: [1, 4, 7] })
    expect(getOutcome(parse('OXXXOX..O'))).toEqual({ winner: 'O', line: [0, 4, 8] })
    expect(getOutcome(parse('OOX.X.X..'))).toEqual({ winner: 'X', line: [2, 4, 6] })
  })

  it('calls a full board with no line a draw', () => {
    expect(getOutcome(parse('XOXXOOOXX'))).toEqual({ winner: 'draw' })
  })

  it('prefers a win on the final move over a draw', () => {
    expect(getOutcome(parse('XOXOXOOXX'))).toEqual({ winner: 'X', line: [0, 4, 8] })
  })
})

describe('currentTurn', () => {
  it('alternates from whoever started', () => {
    expect(currentTurn(emptyBoard(), 'X')).toBe('X')
    expect(currentTurn(emptyBoard(), 'O')).toBe('O')
    expect(currentTurn(parse('O........'), 'O')).toBe('X')
    expect(currentTurn(parse('O...X....'), 'O')).toBe('O')
  })
})

describe('bestMoves', () => {
  it('takes a winning move', () => {
    expect(bestMoves(parse('OO.XX....'), 'O')).toEqual([2])
  })

  it('blocks the opponent', () => {
    expect(bestMoves(parse('XX..O....'), 'O')).toEqual([2])
  })

  it('answers a corner opening with the centre', () => {
    expect(bestMoves(parse('X........'), 'O')).toEqual([4])
  })
})

describe('chooseMove', () => {
  it('only picks empty cells', () => {
    const board = parse('XOXOX.O.X')
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let i = 0; i < 20; i++) expect([5, 7]).toContain(chooseMove(board, 'O', difficulty))
    }
  })

  it('makes random mistakes on easy but never on hard', () => {
    // A random roll of 0 always triggers the mistake branch when one is allowed.
    const board = parse('OO.XX....')
    expect(chooseMove(board, 'O', 'easy', () => 0)).toBe(2)
    expect(chooseMove(board, 'O', 'easy', () => 0.99)).toBe(2)
    expect(chooseMove(board, 'O', 'easy', () => 0.5)).not.toBe(2)
    expect(chooseMove(board, 'O', 'hard', () => 0.5)).toBe(2)
  })

  it('is unbeatable on hard, whoever starts', () => {
    // Plays every possible opponent line against every optimal computer reply.
    function opponentCanWin(board: Board, turn: Mark, computer: Mark): boolean {
      const outcome = getOutcome(board)
      if (outcome) return outcome.winner === other(computer)
      const moves = turn === computer ? bestMoves(board, computer) : board.flatMap((cell, i) => (cell ? [] : [i]))
      return moves.some((move) => {
        const next = [...board]
        next[move] = turn
        return opponentCanWin(next, other(turn), computer)
      })
    }
    expect(opponentCanWin(emptyBoard(), 'X', 'O')).toBe(false)
    expect(opponentCanWin(emptyBoard(), 'O', 'O')).toBe(false)
  })
})
