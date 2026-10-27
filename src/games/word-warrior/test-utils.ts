import type { Rng } from './tiles'
import type { Tile } from './tiles'

/** A repeatable random sequence (mulberry32), so tests can replay a battle. */
export function seeded(seed: number): Rng {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Always rolls the same number. */
export const fixed = (value: number): Rng => () => value

/** Tiles spelling `word`, with `qu` written as `Q`. */
export function tilesOf(word: string, extra: Partial<Tile> = {}): Tile[] {
  return [...word].map((letter, id) => ({ id, letter: letter === 'Q' ? 'qu' : letter, ...extra }))
}
