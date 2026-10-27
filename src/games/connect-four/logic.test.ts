import { describe, expect, it } from 'vitest'
import { bestMoves, chooseMove, COLUMNS, currentTurn, drop, emptyBoard, getOutcome, landingRow, openColumns, type Cell, type Disc } from './logic'

/** Builds a board from six 7-character rows, top row first, where '.' is empty. */
function parse(...rows: string[]): Cell[] {
  return rows.join('').split('').map((cell) => (cell === '.' ? null : (cell as Disc)))
}

const at = (row: number, column: number) => row * COLUMNS + column

describe('drop', () => {
  it('stacks discs from the bottom up', () => {
    let board = emptyBoard()
    expect(landingRow(board, 3)).toBe(5)
    board = drop(board, 3, 'R')
    board = drop(board, 3, 'Y')
    expect(board[at(5, 3)]).toBe('R')
    expect(board[at(4, 3)]).toBe('Y')
    expect(landingRow(board, 3)).toBe(3)
  })

  it('refuses a full column', () => {
    let board = emptyBoard()
    for (let i = 0; i < 6; i++) board = drop(board, 0, i % 2 ? 'Y' : 'R')
    expect(landingRow(board, 0)).toBe(-1)
    expect(openColumns(board)).toEqual([1, 2, 3, 4, 5, 6])
    expect(() => drop(board, 0, 'R')).toThrow()
  })
})

describe('getOutcome', () => {
  it('is null while the round is in play', () => {
    expect(getOutcome(emptyBoard())).toBeNull()
  })

  it('finds rows, columns and both diagonals', () => {
    expect(getOutcome(parse('.......', '.......', '.......', '.......', 'YYY....', 'RRRR...'))).toEqual({
      winner: 'R',
      line: [at(5, 0), at(5, 1), at(5, 2), at(5, 3)],
    })
    expect(getOutcome(parse('.......', '.......', '......Y', '......Y', 'R.....Y', 'RR....Y'))).toEqual({
      winner: 'Y',
      line: [at(2, 6), at(3, 6), at(4, 6), at(5, 6)],
    })
    expect(getOutcome(parse('.......', '.......', 'R......', 'YR.....', 'YYR....', 'YRYR...'))).toEqual({
      winner: 'R',
      line: [at(2, 0), at(3, 1), at(4, 2), at(5, 3)],
    })
    expect(getOutcome(parse('.......', '.......', '...Y...', '..YR...', '.YRR...', 'YRRY...'))).toEqual({
      winner: 'Y',
      line: [at(2, 3), at(3, 2), at(4, 1), at(5, 0)],
    })
  })

  it('calls a full board with no line a draw', () => {
    const rows = ['RRYYRRY', 'YYRRYYR', 'RRYYRRY', 'YYRRYYR', 'RRYYRRY', 'YYRRYYR']
    expect(getOutcome(parse(...rows))).toEqual({ winner: 'draw' })
  })
})

describe('currentTurn', () => {
  it('alternates from whoever started', () => {
    expect(currentTurn(emptyBoard(), 'Y')).toBe('Y')
    expect(currentTurn(drop(emptyBoard(), 3, 'Y'), 'Y')).toBe('R')
  })
})

describe('bestMoves', () => {
  it('takes a winning move', () => {
    const board = parse('.......', '.......', '.......', '.......', 'RRR....', 'YYY.R..')
    expect(bestMoves(board, 'Y', 4)).toEqual([3])
  })

  it('blocks the opponent', () => {
    const board = parse('.......', '.......', '.......', 'R......', 'R......', 'RYY....')
    expect(bestMoves(board, 'Y', 4)).toEqual([0])
  })

  it('stops an open-ended three before it becomes unstoppable', () => {
    // Red threatens to drop in 1 or 5 with an open three on the bottom row.
    const board = parse('.......', '.......', '.......', '.......', '...Y...', '..RRY..')
    expect(bestMoves(board, 'Y', 4)).not.toContain(6)
    const reply = parse('.......', '.......', '.......', '.......', '.......', '..RR...')
    expect(bestMoves(reply, 'Y', 4).every((column) => column === 1 || column === 4)).toBe(true)
  })

  it('opens in the centre', () => {
    expect(bestMoves(emptyBoard(), 'R', 7)).toEqual([3])
  })
})

describe('chooseMove', () => {
  it('only picks open columns', () => {
    let board = emptyBoard()
    for (const column of [0, 1, 2, 4, 5, 6]) for (let i = 0; i < 6; i++) board = drop(board, column, (i + column) % 2 ? 'Y' : 'R')
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let i = 0; i < 10; i++) expect(chooseMove(board, 'Y', difficulty)).toBe(3)
    }
  })

  it('makes random mistakes on easy but never on hard', () => {
    // A random roll of 0 always triggers the mistake branch when one is allowed.
    const board = parse('.......', '.......', '.......', '.......', 'RRR....', 'YYY.R..')
    expect(chooseMove(board, 'Y', 'easy', () => 0)).toBe(0)
    expect(chooseMove(board, 'Y', 'easy', () => 0.99)).toBe(3)
    expect(chooseMove(board, 'Y', 'hard', () => 0)).toBe(3)
  })

  it('thinks fast enough on hard to feel instant', () => {
    let board = emptyBoard()
    const started = performance.now()
    for (const column of [3, 3, 2, 4]) {
      chooseMove(board, currentTurn(board, 'R'), 'hard')
      board = drop(board, column, currentTurn(board, 'R'))
    }
    expect((performance.now() - started) / 4).toBeLessThan(250)
  })
})
