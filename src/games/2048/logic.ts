export const SIZE = 4
export const WIN_VALUE = 2048

export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * - `static`: was on the board before this move (it may have slid).
 * - `new`: spawned after this move.
 * - `merged`: created by joining two tiles on this move.
 * - `consumed`: one of the two tiles that joined. It slides into place under
 *   the merged tile and is dropped on the next move.
 */
export type TileKind = 'static' | 'new' | 'merged' | 'consumed'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  kind: TileKind
}

export interface GameState {
  tiles: Tile[]
  score: number
  /** A 2048 tile has been made. Play can continue past it. */
  won: boolean
  /** No move changes the board. */
  over: boolean
  nextId: number
}

export type Random = () => number

export function createGame(random: Random = Math.random): GameState {
  let state: GameState = { tiles: [], score: 0, won: false, over: false, nextId: 1 }
  state = spawn(state, random)
  return spawn(state, random)
}

/** Builds a game from rows of values (0 for empty). Handy for tests and restoring. */
export function fromGrid(grid: number[][], score = 0): GameState {
  const tiles: Tile[] = []
  let nextId = 1
  grid.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value) tiles.push({ id: nextId++, value, row: r, col: c, kind: 'static' })
    }),
  )
  return finish({ tiles, score, won: false, over: false, nextId })
}

export function toGrid(state: GameState): number[][] {
  const grid = emptyGrid(0)
  for (const tile of liveTiles(state)) grid[tile.row][tile.col] = tile.value
  return grid
}

/** Tiles that are still in play, ignoring ones consumed by the last merge. */
export function liveTiles(state: GameState): Tile[] {
  return state.tiles.filter((tile) => tile.kind !== 'consumed')
}

/** Slides every tile in `direction`. Returns `state` unchanged if nothing moves. */
export function move(state: GameState, direction: Direction, random: Random = Math.random): GameState {
  if (state.over) return state

  const grid = emptyGrid<Tile | null>(null)
  for (const tile of liveTiles(state)) grid[tile.row][tile.col] = tile

  const tiles: Tile[] = []
  let { score, nextId } = state
  let moved = false

  for (let i = 0; i < SIZE; i++) {
    const cells = line(direction, i)
    let target = 0
    // The last tile placed in this line, if it can still take a merge.
    let open: { tile: Tile; row: number; col: number } | null = null

    for (const [row, col] of cells) {
      const tile = grid[row][col]
      if (!tile) continue

      if (open && open.tile.value === tile.value) {
        const value = tile.value * 2
        tiles.push(
          { ...open.tile, row: open.row, col: open.col, kind: 'consumed' },
          { ...tile, row: open.row, col: open.col, kind: 'consumed' },
          { id: nextId++, value, row: open.row, col: open.col, kind: 'merged' },
        )
        score += value
        moved = true
        open = null
        continue
      }

      if (open) tiles.push({ ...open.tile, row: open.row, col: open.col, kind: 'static' })
      const [toRow, toCol] = cells[target++]
      if (toRow !== row || toCol !== col) moved = true
      open = { tile, row: toRow, col: toCol }
    }

    if (open) tiles.push({ ...open.tile, row: open.row, col: open.col, kind: 'static' })
  }

  if (!moved) return state
  return spawn({ ...state, tiles, score, nextId }, random)
}

export function canMove(state: GameState): boolean {
  const grid = toGrid(state)
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = grid[r][c]
      if (value === 0) return true
      if (c + 1 < SIZE && grid[r][c + 1] === value) return true
      if (r + 1 < SIZE && grid[r + 1][c] === value) return true
    }
  }
  return false
}

/** Adds a 2 (90%) or 4 (10%) to a random empty cell. */
function spawn(state: GameState, random: Random): GameState {
  const grid = toGrid(state)
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c])
  if (empty.length === 0) return finish(state)

  const [row, col] = empty[Math.floor(random() * empty.length)]
  const value = random() < 0.9 ? 2 : 4
  const tile: Tile = { id: state.nextId, value, row, col, kind: 'new' }
  return finish({ ...state, tiles: [...state.tiles, tile], nextId: state.nextId + 1 })
}

function finish(state: GameState): GameState {
  return {
    ...state,
    won: state.won || liveTiles(state).some((tile) => tile.value >= WIN_VALUE),
    over: !canMove(state),
  }
}

/** The cells of row or column `i`, ordered from the edge tiles slide toward. */
function line(direction: Direction, i: number): [number, number][] {
  const cells: [number, number][] = []
  for (let j = 0; j < SIZE; j++) {
    const k = direction === 'right' || direction === 'down' ? SIZE - 1 - j : j
    cells.push(direction === 'left' || direction === 'right' ? [i, k] : [k, i])
  }
  return cells
}

function emptyGrid<T>(fill: T): T[][] {
  return Array.from({ length: SIZE }, () => Array<T>(SIZE).fill(fill))
}
