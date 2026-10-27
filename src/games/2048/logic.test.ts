import { describe, expect, it } from 'vitest'
import { canMove, createGame, fromGrid, liveTiles, move, toGrid, type GameState } from './logic'

// Always picks the first empty cell and spawns a 2.
const first = () => 0

/** The board after a move, with the spawned tile removed. */
function slid(state: GameState): number[][] {
  return toGrid({ ...state, tiles: state.tiles.filter((tile) => tile.kind !== 'new') })
}

describe('createGame', () => {
  it('starts with two tiles', () => {
    const game = createGame()
    expect(liveTiles(game)).toHaveLength(2)
    for (const tile of game.tiles) expect([2, 4]).toContain(tile.value)
    expect(game.score).toBe(0)
  })
})

describe('move', () => {
  it('slides tiles to the edge', () => {
    const game = fromGrid([
      [0, 0, 0, 2],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
      [8, 0, 0, 0],
    ])
    expect(slid(move(game, 'left', first))).toEqual([
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [8, 0, 0, 0],
    ])
    expect(slid(move(game, 'down', first))).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [8, 4, 0, 2],
    ])
  })

  it('merges each pair once and scores the new values', () => {
    const game = fromGrid([
      [2, 2, 2, 2],
      [2, 2, 4, 0],
      [4, 0, 4, 4],
      [0, 0, 0, 0],
    ])
    const next = move(game, 'left', first)
    expect(slid(next)).toEqual([
      [4, 4, 0, 0],
      [4, 4, 0, 0],
      [8, 4, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(next.score).toBe(4 + 4 + 4 + 8)
  })

  it('merges toward the direction of travel', () => {
    const game = fromGrid([
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(slid(move(game, 'right', first))[0]).toEqual([0, 0, 2, 4])
  })

  it('keeps merged-away tiles for animation, then drops them', () => {
    const game = fromGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const next = move(game, 'left', first)
    expect(next.tiles.filter((tile) => tile.kind === 'consumed').map((tile) => tile.id)).toEqual([1, 2])
    expect(next.tiles.find((tile) => tile.kind === 'merged')).toMatchObject({ value: 4, row: 0, col: 0 })

    const after = move(next, 'down', first)
    expect(after.tiles.some((tile) => tile.kind === 'consumed')).toBe(false)
  })

  it('spawns one tile after a move', () => {
    const game = fromGrid([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const next = move(game, 'left', first)
    expect(liveTiles(next)).toHaveLength(2)
    expect(next.tiles.filter((tile) => tile.kind === 'new')).toHaveLength(1)
  })

  it('does nothing when no tile can move that way', () => {
    const game = fromGrid([
      [2, 4, 0, 0],
      [8, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(move(game, 'left', first)).toBe(game)
    expect(move(game, 'up', first)).toBe(game)
  })

  it('flags a win when 2048 is made', () => {
    const game = fromGrid([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    expect(game.won).toBe(false)
    expect(move(game, 'left', first).won).toBe(true)
  })
})

describe('canMove', () => {
  it('is false only for a full board with no neighbouring pairs', () => {
    const stuck = fromGrid([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ])
    expect(canMove(stuck)).toBe(false)
    expect(stuck.over).toBe(true)

    const pair = fromGrid([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ])
    expect(canMove(pair)).toBe(true)
    expect(pair.over).toBe(false)
  })
})
