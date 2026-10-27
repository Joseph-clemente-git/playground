export type Disc = 'R' | 'Y'
export type Cell = Disc | null
/** Cells read left to right, top to bottom: index = row * COLUMNS + column, row 0 at the top. */
export type Board = readonly Cell[]
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Outcome = { winner: Disc; line: readonly number[] } | { winner: 'draw' }

export const COLUMNS = 7
export const ROWS = 6

/** How many moves ahead the computer looks. */
const SEARCH_DEPTH: Record<Difficulty, number> = { easy: 2, medium: 4, hard: 6 }
/** How often the computer drops into a random column instead of its best one. */
const MISTAKE_RATE: Record<Difficulty, number> = { easy: 0.35, medium: 0.1, hard: 0 }

/** Columns from the centre outwards: central moves are usually best, which speeds up pruning. */
const SEARCH_ORDER = [3, 2, 4, 1, 5, 0, 6]

/** Right, down, down-right and down-left: every line is found once from its first cell. */
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const

/** Every run of four cells a line can be made in. */
const WINDOWS: readonly (readonly number[])[] = (() => {
  const windows: number[][] = []
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * 3
        const endColumn = column + dc * 3
        if (endRow >= ROWS || endColumn < 0 || endColumn >= COLUMNS) continue
        windows.push([0, 1, 2, 3].map((step) => (row + dr * step) * COLUMNS + column + dc * step))
      }
    }
  }
  return windows
})()

const WIN_SCORE = 1_000_000

export function emptyBoard(): Cell[] {
  return Array<Cell>(ROWS * COLUMNS).fill(null)
}

export function other(disc: Disc): Disc {
  return disc === 'R' ? 'Y' : 'R'
}

/** Whose move it is, given who opened the round. */
export function currentTurn(board: Board, starter: Disc): Disc {
  const filled = board.filter(Boolean).length
  return filled % 2 === 0 ? starter : other(starter)
}

/** The row a disc dropped in `column` lands on, or -1 if the column is full. */
export function landingRow(board: Board, column: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row * COLUMNS + column]) return row
  }
  return -1
}

export function openColumns(board: Board): number[] {
  return SEARCH_ORDER.filter((column) => !board[column]).sort((a, b) => a - b)
}

/** A copy of the board with `disc` dropped into `column`. */
export function drop(board: Board, column: number, disc: Disc): Cell[] {
  const row = landingRow(board, column)
  if (row < 0) throw new Error(`Column ${column} is full`)
  const next = [...board]
  next[row * COLUMNS + column] = disc
  return next
}

/** The finished result, or `null` while the round is still being played. */
export function getOutcome(board: Board): Outcome | null {
  for (const line of WINDOWS) {
    const disc = board[line[0]]
    if (disc && line.every((index) => board[index] === disc)) return { winner: disc, line }
  }
  return board.every(Boolean) ? { winner: 'draw' } : null
}

/** Whether the disc at `index` is part of four in a row. Cheaper than `getOutcome` mid-search. */
function winsAt(board: Board, index: number): boolean {
  const disc = board[index]
  const row = Math.floor(index / COLUMNS)
  const column = index % COLUMNS
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let c = column + dc * sign
      while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r * COLUMNS + c] === disc) {
        count++
        r += dr * sign
        c += dc * sign
      }
    }
    if (count >= 4) return true
  }
  return false
}

/** How promising the board looks for `me`: open threes and twos count, and so does the centre column. */
function evaluate(board: Board, me: Disc): number {
  const them = other(me)
  let total = 0
  for (let row = 0; row < ROWS; row++) {
    const cell = board[row * COLUMNS + 3]
    if (cell === me) total += 3
    else if (cell === them) total -= 3
  }
  for (const window of WINDOWS) {
    let mine = 0
    let theirs = 0
    for (const index of window) {
      if (board[index] === me) mine++
      else if (board[index] === them) theirs++
    }
    if (theirs === 0) total += mine === 3 ? 5 : mine === 2 ? 2 : 0
    else if (mine === 0) total -= theirs === 3 ? 4 : theirs === 2 ? 2 : 0
  }
  return total
}

/**
 * Alpha-beta minimax score for `turn` moving next, from `me`'s side. Wins found
 * sooner score higher and losses found later score higher, so the computer
 * finishes fast and resists long.
 */
function search(board: Cell[], depth: number, alpha: number, beta: number, turn: Disc, me: Disc, ply: number): number {
  if (depth === 0) return evaluate(board, me)
  const maximising = turn === me
  let best = maximising ? -Infinity : Infinity
  let moved = false
  for (const column of SEARCH_ORDER) {
    const row = landingRow(board, column)
    if (row < 0) continue
    moved = true
    const index = row * COLUMNS + column
    board[index] = turn
    const result = winsAt(board, index)
      ? (maximising ? 1 : -1) * (WIN_SCORE - ply)
      : search(board, depth - 1, alpha, beta, other(turn), me, ply + 1)
    board[index] = null
    if (maximising) {
      best = Math.max(best, result)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, result)
      beta = Math.min(beta, best)
    }
    if (alpha >= beta) break
  }
  return moved ? best : 0
}

/** Every column that scores best for `disc` when looking `depth` moves ahead, so the computer can vary its play. */
export function bestMoves(board: Board, disc: Disc, depth: number): number[] {
  const scratch = [...board]
  let best = -Infinity
  let moves: number[] = []
  for (const column of SEARCH_ORDER) {
    const row = landingRow(scratch, column)
    if (row < 0) continue
    const index = row * COLUMNS + column
    scratch[index] = disc
    // Searching just below the best so far keeps ties exact while still pruning worse moves.
    const result = winsAt(scratch, index)
      ? WIN_SCORE
      : search(scratch, depth - 1, best - 1, Infinity, other(disc), disc, 1)
    scratch[index] = null
    if (result > best) {
      best = result
      moves = [column]
    } else if (result === best) {
      moves.push(column)
    }
  }
  return moves.sort((a, b) => a - b)
}

/** The column the computer drops into. Easier levels look less far ahead and sometimes play at random. */
export function chooseMove(board: Board, disc: Disc, difficulty: Difficulty, random: () => number = Math.random): number {
  const open = openColumns(board)
  if (open.length === 0) throw new Error('No moves left')
  const pick = (moves: number[]) => moves[Math.floor(random() * moves.length)]
  if (random() < MISTAKE_RATE[difficulty]) return pick(open)
  return pick(bestMoves(board, disc, SEARCH_DEPTH[difficulty]))
}
