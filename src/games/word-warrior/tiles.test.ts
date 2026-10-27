import { describe, expect, it } from 'vitest'
import { seeded } from './test-utils'
import { drawLetter, isVowel, MIN_VOWELS, newGrid, refill, TILE_COUNT, toLetters, type Tile } from './tiles'

describe('toLetters', () => {
  it('turns qu into a single tile', () => {
    expect(toLetters('quiz')).toEqual(['qu', 'i', 'z'])
    expect(toLetters('cat')).toEqual(['c', 'a', 't'])
    expect(toLetters('qat')).toBeNull()
  })
})

describe('newGrid', () => {
  it('fills all 16 tiles with unique ids and enough vowels', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { grid, nextId } = newGrid(seeded(seed), 100)
      expect(grid).toHaveLength(TILE_COUNT)
      expect(new Set(grid.map((tile) => tile.id)).size).toBe(TILE_COUNT)
      expect(nextId).toBe(116)
      expect(grid.filter((tile) => isVowel(tile.letter)).length).toBeGreaterThanOrEqual(MIN_VOWELS)
      expect(grid.filter((tile) => tile.letter === 'qu').length).toBeLessThanOrEqual(1)
      expect(grid.some((tile) => tile.letter === 'q')).toBe(false)
    }
  })

  it('never has more than three of a letter', () => {
    for (let seed = 0; seed < 200; seed++) {
      const counts = new Map<string, number>()
      for (const tile of newGrid(seeded(seed), 0).grid) counts.set(tile.letter, (counts.get(tile.letter) ?? 0) + 1)
      expect(Math.max(...counts.values())).toBeLessThanOrEqual(3)
    }
  })
})

describe('refill', () => {
  it('drops the remaining tiles to the bottom and fills from the top', () => {
    const { grid } = newGrid(seeded(1), 0)
    // Remove the bottom two tiles of the first column.
    const cells: (Tile | null)[] = grid.map((tile, i) => (i === 8 || i === 12 ? null : tile))
    const result = refill(cells, seeded(2), 16)
    expect(result.grid[12]).toBe(grid[4])
    expect(result.grid[8]).toBe(grid[0])
    expect(result.fall[12]).toBe(2)
    expect(result.fall[8]).toBe(2)
    expect(result.fresh).toEqual([0, 4])
    expect(result.grid[0].id).toBeGreaterThanOrEqual(16)
    expect(result.fall[0]).toBe(2)
    // Other columns don't move.
    expect(result.grid[13]).toBe(grid[13])
    expect(result.fall[13]).toBe(0)
  })
})

describe('drawLetter', () => {
  it('favours letters the bonus word is missing', () => {
    const rng = seeded(7)
    let hits = 0
    for (let i = 0; i < 2000; i++) if (drawLetter(rng, [], 'zzz') === 'z') hits++
    // z is about 0.6% on its own; the bias makes it noticeably more common.
    expect(hits / 2000).toBeGreaterThan(0.01)
  })

  it('skips letters the board already has three of', () => {
    const rng = seeded(3)
    for (let i = 0; i < 500; i++) expect(drawLetter(rng, ['e', 'e', 'e', 'qu'])).not.toMatch(/^(e|qu)$/)
  })
})
