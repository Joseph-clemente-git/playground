export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = readonly Cell[]
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Outcome = { winner: Mark; line: readonly number[] } | { winner: 'draw' }

/** Every row, column and diagonal, as cell indexes 0–8 read left to right, top to bottom. */
export const LINES: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** How often the computer plays a random move instead of its best one. */
const MISTAKE_RATE: Record<Difficulty, number> = { easy: 0.7, medium: 0.3, hard: 0 }

export function emptyBoard(): Cell[] {
  return Array<Cell>(9).fill(null)
}

export function other(mark: Mark): Mark {
  return mark === 'X' ? 'O' : 'X'
}

/** Whose move it is, given who opened the round. */
export function currentTurn(board: Board, starter: Mark): Mark {
  const filled = board.filter(Boolean).length
  return filled % 2 === 0 ? starter : other(starter)
}

/** The finished result, or `null` while the round is still being played. */
export function getOutcome(board: Board): Outcome | null {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = board[a]
    if (mark && mark === board[b] && mark === board[c]) return { winner: mark, line }
  }
  return board.every(Boolean) ? { winner: 'draw' } : null
}

export function emptyCells(board: Board): number[] {
  return board.flatMap((cell, index) => (cell ? [] : [index]))
}

/**
 * Minimax score for `mark` moving next. Wins found sooner score higher and
 * losses found later score higher, so the computer finishes fast and resists long.
 */
function score(board: Cell[], mark: Mark, me: Mark, depth: number): number {
  const outcome = getOutcome(board)
  if (outcome) {
    if (outcome.winner === 'draw') return 0
    return outcome.winner === me ? 10 - depth : depth - 10
  }
  let best = mark === me ? -Infinity : Infinity
  for (const index of emptyCells(board)) {
    board[index] = mark
    const result = score(board, other(mark), me, depth + 1)
    board[index] = null
    best = mark === me ? Math.max(best, result) : Math.min(best, result)
  }
  return best
}

/** Every move that is optimal for `mark`, so the computer can vary its play. */
export function bestMoves(board: Board, mark: Mark): number[] {
  const scratch = [...board]
  let best = -Infinity
  let moves: number[] = []
  for (const index of emptyCells(board)) {
    scratch[index] = mark
    const result = score(scratch, other(mark), mark, 1)
    scratch[index] = null
    if (result > best) {
      best = result
      moves = [index]
    } else if (result === best) {
      moves.push(index)
    }
  }
  return moves
}

/** The computer's move. Only `hard` is unbeatable; easier levels sometimes play at random. */
export function chooseMove(board: Board, mark: Mark, difficulty: Difficulty, random: () => number = Math.random): number {
  const open = emptyCells(board)
  if (open.length === 0) throw new Error('No moves left')
  const pick = (moves: number[]) => moves[Math.floor(random() * moves.length)]
  if (random() < MISTAKE_RATE[difficulty]) return pick(open)
  return pick(bestMoves(board, mark))
}
