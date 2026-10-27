import { VALUES, type Gem, type Tile } from './tiles'

export interface Modifiers {
  /** The hero is weakened and hits softer. */
  weakened?: boolean
  /** A Power potion boosts this one word. */
  powered?: boolean
  /** The enemy's shield halves the hit. */
  shielded?: boolean
  /** The Golden Quill makes rare letters worth more. */
  quill?: boolean
}

const WEAKENED = 0.6
const POWERED = 1.5
const SHIELDED = 0.5
const AMETHYST = 0.25
const DIAMOND = 2
/** Each letter past the third adds this much to the word's multiplier. */
const PER_EXTRA_LETTER = 0.25
const QUILL_BONUS = 0.5

export const MIN_LETTERS = 3

/** Letters a word spells, counting `qu` as two. */
export function letterCount(tiles: Tile[]) {
  return tiles.reduce((sum, tile) => sum + tile.letter.length, 0)
}

export function tileValue(tile: Tile, quill = false): number {
  if (tile.hazard?.kind === 'smashed') return 0
  const value = VALUES[tile.letter]
  return quill && value >= 1.5 ? value + QUILL_BONUS : value
}

/** Damage a word deals: its letter values, multiplied up for length, gems and statuses. */
export function wordDamage(tiles: Tile[], modifiers: Modifiers = {}): number {
  const base = tiles.reduce((sum, tile) => sum + tileValue(tile, modifiers.quill), 0)
  if (base === 0) return 0
  let damage = base * (1 + PER_EXTRA_LETTER * Math.max(0, letterCount(tiles) - MIN_LETTERS))
  const amethysts = tiles.filter((tile) => tile.gem === 'amethyst').length
  damage *= 1 + AMETHYST * amethysts
  if (tiles.some((tile) => tile.gem === 'diamond')) damage *= DIAMOND
  if (modifiers.weakened) damage *= WEAKENED
  if (modifiers.powered) damage *= POWERED
  if (modifiers.shielded) damage *= SHIELDED
  return Math.max(1, Math.round(damage))
}

/** The gem a word of this many letters leaves behind, if any. */
export function gemFor(letters: number): Gem | undefined {
  if (letters >= 10) return 'diamond'
  if (letters >= 8) return 'ruby'
  if (letters === 7) return 'sapphire'
  if (letters === 6) return 'emerald'
  if (letters === 5) return 'amethyst'
  return undefined
}
