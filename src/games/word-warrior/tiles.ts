/** A tile's letter: `a`–`z` except `q`, which only ever comes as `qu`. */
export type Letter = string

export type Gem = 'amethyst' | 'emerald' | 'sapphire' | 'ruby' | 'diamond'

export type Hazard =
  /** Can't be picked until it unlocks. */
  | { kind: 'locked'; turns: number }
  /** Still spells, but adds no damage. */
  | { kind: 'smashed' }
  /** Burns out after `turns` enemy turns, hurting the hero, unless it's used first. */
  | { kind: 'burning'; turns: number }

export interface Tile {
  id: number
  letter: Letter
  gem?: Gem
  hazard?: Hazard
}

export type Rng = () => number

export const SIZE = 4
export const TILE_COUNT = SIZE * SIZE
export const MIN_VOWELS = 4
/** No letter appears more than this many times at once, and `qu` only once. */
const MAX_SAME = 3
/** How much more likely a missing letter of the bonus word is to drop in. */
const BONUS_BIAS = 2.5

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

/** Roughly English letter frequency, so most grids hold plenty of words. */
const WEIGHTS: Record<Letter, number> = {
  e: 12, a: 9, i: 8, o: 8, n: 6, r: 6, t: 6, s: 5, l: 4, u: 4, d: 4, g: 3,
  b: 2, c: 2, m: 2, p: 2, f: 2, h: 2, v: 1.5, w: 1.5, y: 1.5, k: 1, j: 0.6, x: 0.6, z: 0.6, qu: 0.6,
}
export const LETTERS = Object.keys(WEIGHTS)

/** Damage each letter adds: rarer letters are worth more. */
export const VALUES: Record<Letter, number> = Object.fromEntries(
  LETTERS.map((letter) => [letter, valueOf(letter)]),
)

function valueOf(letter: Letter): number {
  if (letter === 'qu') return 2.75
  if ('xz'.includes(letter)) return 2
  if ('jk'.includes(letter)) return 1.75
  if ('vwy'.includes(letter)) return 1.5
  if ('bcfhmp'.includes(letter)) return 1.25
  return 1
}

export function isVowel(letter: Letter) {
  return VOWELS.has(letter)
}

/** Splits a word into tile letters, or null if it has a `q` without a `u`. */
export function toLetters(word: string): Letter[] | null {
  const letters: Letter[] = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== 'q') {
      letters.push(word[i])
    } else if (word[i + 1] === 'u') {
      letters.push('qu')
      i++
    } else {
      return null
    }
  }
  return letters
}

/** Picks a letter by weight, leaving out ones the grid already has enough of. */
export function drawLetter(rng: Rng, onBoard: Letter[], bonusWord = '', pool: Letter[] = LETTERS): Letter {
  const missing = new Set(bonusLettersMissing(bonusWord, onBoard))
  const weights = pool.map((letter) => {
    const count = onBoard.filter((other) => other === letter).length
    if (count >= (letter === 'qu' ? 1 : MAX_SAME)) return 0
    return WEIGHTS[letter] * (missing.has(letter) ? BONUS_BIAS : 1)
  })
  let roll = rng() * weights.reduce((sum, weight) => sum + weight, 0)
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll < 0) return pool[i]
  }
  return pool.findLast((_, i) => weights[i] > 0) ?? pool[0]
}

/** Letters of the bonus word the board doesn't have enough of yet. */
function bonusLettersMissing(bonusWord: string, onBoard: Letter[]): Letter[] {
  const remaining = [...onBoard]
  const missing: Letter[] = []
  for (const letter of toLetters(bonusWord) ?? []) {
    const at = remaining.indexOf(letter)
    if (at >= 0) remaining.splice(at, 1)
    else missing.push(letter)
  }
  return missing
}

export interface Refill {
  grid: Tile[]
  nextId: number
  /** Indices of the tiles that just dropped in. */
  fresh: number[]
  /** How many rows each tile fell, for the drop animation. */
  fall: number[]
}

/**
 * Lets the remaining tiles fall to the bottom of each column and drops new
 * ones in from the top, topping the vowels back up if the new tiles allow.
 */
export function refill(cells: (Tile | null)[], rng: Rng, nextId: number, bonusWord = ''): Refill {
  const grid: (Tile | null)[] = Array(TILE_COUNT).fill(null)
  const fall: number[] = Array(TILE_COUNT).fill(0)
  const fresh: number[] = []

  for (let column = 0; column < SIZE; column++) {
    let target = SIZE - 1
    for (let row = SIZE - 1; row >= 0; row--) {
      const tile = cells[row * SIZE + column]
      if (!tile) continue
      grid[target * SIZE + column] = tile
      fall[target * SIZE + column] = target - row
      target--
    }
    for (let row = target; row >= 0; row--) {
      fresh.push(row * SIZE + column)
      fall[row * SIZE + column] = target + 1
    }
  }

  // Draw top to bottom, left to right, so each draw sees what's already there.
  fresh.sort((a, b) => a - b)
  for (const index of fresh) {
    const onBoard = grid.filter((tile) => tile !== null).map((tile) => tile.letter)
    grid[index] = { id: nextId++, letter: drawLetter(rng, onBoard, bonusWord) }
  }

  const tiles = grid as Tile[]
  let vowels = tiles.filter((tile) => isVowel(tile.letter)).length
  for (const index of fresh) {
    if (vowels >= MIN_VOWELS) break
    if (isVowel(tiles[index].letter)) continue
    const onBoard = tiles.filter((_, i) => i !== index).map((tile) => tile.letter)
    tiles[index] = { ...tiles[index], letter: drawLetter(rng, onBoard, bonusWord, [...VOWELS]) }
    vowels++
  }

  return { grid: tiles, nextId, fresh, fall }
}

export function newGrid(rng: Rng, nextId: number, bonusWord = ''): Refill {
  return refill(Array(TILE_COUNT).fill(null), rng, nextId, bonusWord)
}

export function isLocked(tile: Tile) {
  return tile.hazard?.kind === 'locked'
}

export function wordOf(tiles: Tile[]) {
  return tiles.map((tile) => tile.letter).join('')
}
