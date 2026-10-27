import { gemFor, letterCount, wordDamage } from './damage'
import { isLocked, newGrid, refill, TILE_COUNT, wordOf, type Gem, type Rng, type Tile } from './tiles'

export type PotionKind = 'health' | 'purity' | 'power'
export type Potions = Record<PotionKind, number>
export const MAX_POTIONS = 5

export type AbilityKind = 'poison' | 'weaken' | 'shield' | 'heal' | 'charge' | 'lock' | 'smash' | 'burn'

export interface EnemyDef {
  name: string
  emoji: string
  hp: number
  attack: number
  /** What its normal attack does, as in "Rat bites for 3". */
  verb: string
  /** Tried in order each turn; the first one that rolls under its chance is used. */
  abilities: { kind: AbilityKind; chance: number }[]
}

export interface Fx {
  amount: number
  kind: 'damage' | 'heal'
  /** Changes on every hit, so the same number twice still animates. */
  key: number
}

export interface BattleState {
  grid: Tile[]
  nextId: number
  /** Rows each tile fell in the last refill, for the drop animation. */
  fall: number[]
  hero: {
    hp: number
    maxHp: number
    poison: { turns: number; amount: number } | null
    weak: number
    powered: boolean
  }
  enemy: {
    def: EnemyDef
    hp: number
    maxHp: number
    /** Enemy turns the shield has left. */
    shield: number
    frozen: boolean
    burn: { turns: number; amount: number } | null
    charging: boolean
  }
  potions: Potions
  bonus: { word: string; reward: PotionKind; found: boolean }
  perks: Perks
  phase: 'player' | 'enemy' | 'won' | 'lost'
  message: string
  heroFx: Fx | null
  enemyFx: Fx | null
  /** Counts every action, and keys the effects. */
  tick: number
}

export interface Perks {
  /** Golden Quill: rare letters are worth more. */
  quill: boolean
  /** Bookmark: every battle starts with an Amethyst on the board. */
  bookmark: boolean
}

export interface BattleSetup {
  enemy: EnemyDef
  hp: number
  maxHp: number
  potions: Potions
  bonus: { word: string; reward: PotionKind }
  perks: Perks
}

const POTION_NAME: Record<PotionKind, string> = { health: 'Health', purity: 'Purity', power: 'Power' }

const HEALTH_POTION = 0.5
const EMERALD_HEAL = 0.2
const DIAMOND_HEAL = 0.4
const ENEMY_HEAL = 0.2
const CHARGED = 2.5
const STATUS_TURNS = 3
const SHIELD_TURNS = 3
const LOCK_TURNS = 3
const BURN_TURNS = 3
const HAZARD_TILES = 2

export function startBattle(setup: BattleSetup, rng: Rng): BattleState {
  const { grid, nextId, fall } = newGrid(rng, 0, setup.bonus.word)
  if (setup.perks.bookmark) grid[Math.floor(rng() * TILE_COUNT)].gem = 'amethyst'
  return {
    grid,
    nextId,
    fall,
    hero: { hp: setup.hp, maxHp: setup.maxHp, poison: null, weak: 0, powered: false },
    enemy: {
      def: setup.enemy,
      hp: setup.enemy.hp,
      maxHp: setup.enemy.hp,
      shield: 0,
      frozen: false,
      burn: null,
      charging: false,
    },
    potions: { ...setup.potions },
    bonus: { ...setup.bonus, found: false },
    perks: setup.perks,
    phase: 'player',
    message: `A ${setup.enemy.name} blocks the way!`,
    heroFx: null,
    enemyFx: null,
    tick: 0,
  }
}

/** Tiles that can go into a word: no locked ones, none twice. */
export function canSelect(state: BattleState, indices: number[]) {
  return new Set(indices).size === indices.length && indices.every((i) => state.grid[i] && !isLocked(state.grid[i]))
}

export function previewDamage(state: BattleState, indices: number[]) {
  return wordDamage(indices.map((i) => state.grid[i]), modifiers(state))
}

function modifiers(state: BattleState) {
  return {
    weakened: state.hero.weak > 0,
    powered: state.hero.powered,
    shielded: state.enemy.shield > 0,
    quill: state.perks.quill,
  }
}

/** The hero attacks with a word the caller has already checked is real. */
export function playWord(state: BattleState, indices: number[], rng: Rng): BattleState {
  if (state.phase !== 'player' || !canSelect(state, indices)) return state
  const tiles = indices.map((i) => state.grid[i])
  const word = wordOf(tiles)
  const damage = wordDamage(tiles, modifiers(state))
  const gems = new Set<Gem>(tiles.flatMap((tile) => (tile.gem ? [tile.gem] : [])))
  const tick = state.tick + 1

  const hero = { ...state.hero, powered: false }
  const enemy = { ...state.enemy, hp: Math.max(0, state.enemy.hp - damage) }
  const potions = { ...state.potions }
  const bonus = { ...state.bonus }
  const notes: string[] = []

  let heal = 0
  if (gems.has('emerald')) heal += Math.round(hero.maxHp * EMERALD_HEAL)
  if (gems.has('diamond')) heal += Math.round(hero.maxHp * DIAMOND_HEAL)
  heal = Math.min(heal, hero.maxHp - hero.hp)
  if (heal > 0) {
    hero.hp += heal
    notes.push(`you heal ${heal}`)
  }
  if (gems.has('sapphire')) {
    enemy.frozen = true
    notes.push(`the ${enemy.def.name} is frozen`)
  }
  if (gems.has('ruby')) {
    enemy.burn = { turns: BURN_TURNS, amount: Math.max(2, Math.round(damage * 0.25)) }
    notes.push(`the ${enemy.def.name} catches fire`)
  }
  if (word === bonus.word && !bonus.found) {
    bonus.found = true
    potions[bonus.reward] = Math.min(MAX_POTIONS, potions[bonus.reward] + 1)
    notes.push(`bonus word! +1 ${POTION_NAME[bonus.reward]} potion`)
  }

  const cells: (Tile | null)[] = state.grid.map((tile, i) => (indices.includes(i) ? null : tile))
  const { grid, nextId, fresh, fall } = refill(cells, rng, state.nextId, bonus.word)
  const gem = gemFor(letterCount(tiles))
  if (gem) {
    const at = fresh[Math.floor(rng() * fresh.length)]
    grid[at] = { ...grid[at], gem }
    notes.push(`${GEM_NAME[gem]} made`)
  }

  const won = enemy.hp <= 0
  return {
    ...state,
    grid,
    nextId,
    fall,
    hero,
    enemy,
    potions,
    bonus,
    phase: won ? 'won' : 'enemy',
    message: sentence(`${word.toUpperCase()} hits for ${damage}`, notes),
    heroFx: heal > 0 ? { amount: heal, kind: 'heal', key: tick } : state.heroFx,
    enemyFx: { amount: damage, kind: 'damage', key: tick },
    tick,
  }
}

export const GEM_NAME: Record<Gem, string> = {
  amethyst: 'Amethyst',
  emerald: 'Emerald',
  sapphire: 'Sapphire',
  ruby: 'Ruby',
  diamond: 'Diamond',
}

/** New letters, for the cost of a turn. `free` when the board has no words at all. */
export function scramble(state: BattleState, rng: Rng, free = false): BattleState {
  if (state.phase !== 'player') return state
  // Gems and hazards stay put; only the letters change.
  const { grid: fresh, nextId, fall } = newGrid(rng, state.nextId, state.bonus.word)
  const grid = fresh.map((tile, i) => ({ ...state.grid[i], id: tile.id, letter: tile.letter }))
  return {
    ...state,
    grid,
    nextId,
    fall,
    phase: free ? 'player' : 'enemy',
    message: free ? 'No words left, so the letters shuffle for free' : 'You shuffle the letters',
    tick: state.tick + 1,
  }
}

export function drinkPotion(state: BattleState, kind: PotionKind): BattleState {
  if (state.phase !== 'player' || state.potions[kind] <= 0) return state
  const tick = state.tick + 1
  const potions = { ...state.potions, [kind]: state.potions[kind] - 1 }
  const hero = { ...state.hero }
  let grid = state.grid
  let heroFx = state.heroFx
  let message: string

  if (kind === 'health') {
    if (hero.hp >= hero.maxHp) return state
    const heal = Math.min(hero.maxHp - hero.hp, Math.round(hero.maxHp * HEALTH_POTION))
    hero.hp += heal
    heroFx = { amount: heal, kind: 'heal', key: tick }
    message = `You drink a Health potion and heal ${heal}`
  } else if (kind === 'purity') {
    if (!hasAilment(state)) return state
    hero.poison = null
    hero.weak = 0
    grid = grid.map((tile) => (tile.hazard ? { ...tile, hazard: undefined } : tile))
    message = 'A Purity potion cures you and mends every tile'
  } else {
    if (hero.powered) return state
    hero.powered = true
    message = 'Power surges through you: your next word hits harder'
  }

  return { ...state, potions, hero, grid, heroFx, message, tick }
}

/** Whether a Purity potion would do anything. */
export function hasAilment(state: BattleState) {
  return state.hero.poison !== null || state.hero.weak > 0 || state.grid.some((tile) => tile.hazard)
}

/** Whether the potion can be drunk right now. */
export function canDrink(state: BattleState, kind: PotionKind) {
  if (state.phase !== 'player' || state.potions[kind] <= 0) return false
  if (kind === 'health') return state.hero.hp < state.hero.maxHp
  if (kind === 'purity') return hasAilment(state)
  return !state.hero.powered
}

/** The enemy's reply, then poison, locks and fires tick down. */
export function enemyTurn(state: BattleState, rng: Rng): BattleState {
  if (state.phase !== 'enemy') return state
  const tick = state.tick + 1
  const def = state.enemy.def
  const hero = { ...state.hero }
  const enemy = { ...state.enemy }
  let grid = state.grid.map((tile) => ({ ...tile }))
  let nextId = state.nextId
  let fall: number[] = Array(TILE_COUNT).fill(0)
  let enemyFx = state.enemyFx
  let heroDamage = 0
  // A fresh shield doesn't tick down on the turn it goes up.
  let raisedShield = false
  const notes: string[] = []
  let message: string

  if (enemy.burn) {
    enemy.hp = Math.max(0, enemy.hp - enemy.burn.amount)
    enemyFx = { amount: enemy.burn.amount, kind: 'damage', key: tick }
    if (enemy.hp <= 0) {
      return { ...state, enemy, enemyFx, phase: 'won', message: `The ${def.name} burns up!`, tick }
    }
    enemy.burn = enemy.burn.turns > 1 ? { ...enemy.burn, turns: enemy.burn.turns - 1 } : null
  }

  const attack = () => Math.max(1, def.attack + Math.floor(rng() * 3) - 1)
  const pick = (count: number, allowed: (tile: Tile) => boolean) => {
    const open = grid.flatMap((tile, i) => (allowed(tile) ? [i] : []))
    const picked: number[] = []
    while (picked.length < count && open.length > 0) picked.push(...open.splice(Math.floor(rng() * open.length), 1))
    return picked
  }
  const plain = (tile: Tile) => !tile.hazard && !tile.gem

  if (enemy.frozen) {
    enemy.frozen = false
    message = `The ${def.name} is frozen solid and can't move`
  } else if (enemy.charging) {
    enemy.charging = false
    heroDamage = Math.round(attack() * CHARGED)
    message = `The ${def.name} unleashes a huge blow for ${heroDamage}!`
  } else {
    const usable = (kind: AbilityKind) => {
      switch (kind) {
        case 'poison':
          return hero.poison === null
        case 'weaken':
          return hero.weak === 0
        case 'shield':
          return enemy.shield === 0
        case 'heal':
          return enemy.hp < enemy.maxHp * 0.7
        case 'charge':
          return true
        case 'lock':
        case 'smash':
        case 'burn':
          return grid.some(plain)
      }
    }
    const ability = def.abilities.find(({ kind, chance }) => usable(kind) && rng() < chance)?.kind
    const halfAttack = () => Math.max(1, Math.round(attack() / 2))

    switch (ability) {
      case 'poison':
        heroDamage = halfAttack()
        hero.poison = { turns: STATUS_TURNS, amount: Math.max(1, Math.round(def.attack / 3)) }
        message = `The ${def.name} poisons you for ${heroDamage}`
        break
      case 'weaken':
        heroDamage = halfAttack()
        hero.weak = STATUS_TURNS
        message = `The ${def.name} weakens you for ${heroDamage}: your words hit softer`
        break
      case 'shield':
        enemy.shield = SHIELD_TURNS
        raisedShield = true
        message = `The ${def.name} raises a shield`
        break
      case 'heal': {
        const heal = Math.min(enemy.maxHp - enemy.hp, Math.round(enemy.maxHp * ENEMY_HEAL))
        enemy.hp += heal
        enemyFx = { amount: heal, kind: 'heal', key: tick }
        message = `The ${def.name} heals ${heal}`
        break
      }
      case 'charge':
        enemy.charging = true
        message = `The ${def.name} is winding up a huge blow!`
        break
      case 'lock':
      case 'smash':
      case 'burn': {
        heroDamage = halfAttack()
        const picked = pick(ability === 'burn' ? 1 : HAZARD_TILES, plain)
        for (const i of picked) {
          grid[i].hazard =
            ability === 'lock'
              ? { kind: 'locked', turns: LOCK_TURNS }
              : ability === 'smash'
                ? { kind: 'smashed' }
                : // One extra, as it ticks down at the end of this turn too.
                  { kind: 'burning', turns: BURN_TURNS + 1 }
        }
        const what =
          ability === 'lock' ? `locks ${picked.length} tiles` : ability === 'smash' ? `smashes ${picked.length} tiles` : 'sets a tile on fire'
        message = `The ${def.name} ${what} and hits for ${heroDamage}`
        break
      }
      case undefined:
        heroDamage = attack()
        message = `The ${def.name} ${def.verb} for ${heroDamage}`
        break
    }
  }

  // Ongoing effects tick down at the end of the enemy's turn.
  if (hero.poison) {
    heroDamage += hero.poison.amount
    notes.push(`poison does ${hero.poison.amount}`)
    hero.poison = hero.poison.turns > 1 ? { ...hero.poison, turns: hero.poison.turns - 1 } : null
  }
  if (hero.weak > 0) hero.weak--
  if (enemy.shield > 0 && !raisedShield) enemy.shield--

  let burnedOut = 0
  const cells: (Tile | null)[] = grid.map((tile) => {
    const hazard = tile.hazard
    if (hazard?.kind === 'locked') return { ...tile, hazard: hazard.turns > 1 ? { ...hazard, turns: hazard.turns - 1 } : undefined }
    if (hazard?.kind === 'burning') {
      if (hazard.turns > 1) return { ...tile, hazard: { ...hazard, turns: hazard.turns - 1 } }
      burnedOut++
      return null
    }
    return tile
  })
  if (burnedOut > 0) {
    const burn = burnedOut * def.attack
    heroDamage += burn
    notes.push(`a burning tile scorches you for ${burn}`)
    ;({ grid, nextId, fall } = refill(cells, rng, nextId, state.bonus.word))
  } else {
    grid = cells as Tile[]
  }

  hero.hp = Math.max(0, hero.hp - heroDamage)
  const heroFx = heroDamage > 0 ? ({ amount: heroDamage, kind: 'damage', key: tick } as const) : state.heroFx

  return {
    ...state,
    grid,
    nextId,
    fall,
    hero,
    enemy,
    phase: hero.hp <= 0 ? 'lost' : 'player',
    message: sentence(message, notes),
    heroFx,
    enemyFx,
    tick,
  }
}

function sentence(main: string, notes: string[]) {
  return notes.length === 0 ? main : `${main}, ${notes.join(', ')}`
}
