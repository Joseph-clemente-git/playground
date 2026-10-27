import { describe, expect, it } from 'vitest'
import {
  canDrink,
  canSelect,
  drinkPotion,
  enemyTurn,
  playWord,
  previewDamage,
  scramble,
  startBattle,
  type BattleState,
  type EnemyDef,
} from './battle'
import { fixed, seeded, tilesOf } from './test-utils'
import type { Tile } from './tiles'

const RAT: EnemyDef = { name: 'Rat', emoji: '🐀', hp: 20, attack: 3, verb: 'bites', abilities: [] }

/** A battle whose grid spells `letters` row by row, with `Q` for `qu`. */
function battle(letters = 'catsdogsratsbeen', enemy: EnemyDef = RAT, changes: Partial<BattleState> = {}): BattleState {
  const state = startBattle(
    {
      enemy,
      hp: 30,
      maxHp: 40,
      potions: { health: 1, purity: 1, power: 1 },
      bonus: { word: 'dogs', reward: 'health' },
      perks: { quill: false, bookmark: false },
    },
    seeded(1),
  )
  return { ...state, grid: tilesOf(letters).map((tile) => ({ ...tile, id: tile.id + 100 })), ...changes }
}

/** Replaces some tiles of the grid. */
function withTiles(state: BattleState, tiles: Record<number, Partial<Tile>>): BattleState {
  return { ...state, grid: state.grid.map((tile, i) => (tiles[i] ? { ...tile, ...tiles[i] } : tile)) }
}

describe('playWord', () => {
  it('damages the enemy, refills the grid and hands the turn over', () => {
    const state = battle()
    expect(previewDamage(state, [0, 1, 2])).toBe(3)
    const next = playWord(state, [0, 1, 2], seeded(2))
    expect(next.enemy.hp).toBe(17)
    expect(next.phase).toBe('enemy')
    expect(next.enemyFx).toMatchObject({ amount: 3, kind: 'damage' })
    expect(next.message).toBe('CAT hits for 3')
    expect(next.grid).toHaveLength(16)
    // The three used tiles are gone and three new ones dropped in.
    const ids = new Set(next.grid.map((tile) => tile.id))
    expect([100, 101, 102].some((id) => ids.has(id))).toBe(false)
    expect(next.grid.filter((tile) => tile.id < 100)).toHaveLength(3)
  })

  it('wins when the enemy runs out of health', () => {
    const next = playWord({ ...battle(), enemy: { ...battle().enemy, hp: 2 } }, [0, 1, 2], seeded(2))
    expect(next.enemy.hp).toBe(0)
    expect(next.phase).toBe('won')
  })

  it('refuses locked tiles, repeats and out-of-turn plays', () => {
    const locked = withTiles(battle(), { 1: { hazard: { kind: 'locked', turns: 2 } } })
    expect(canSelect(locked, [0, 1, 2])).toBe(false)
    expect(playWord(locked, [0, 1, 2], seeded(2))).toBe(locked)
    expect(canSelect(battle(), [0, 0, 1])).toBe(false)
    const waiting = { ...battle(), phase: 'enemy' as const }
    expect(playWord(waiting, [0, 1, 2], seeded(2))).toBe(waiting)
  })

  it('leaves a gem behind for a long word', () => {
    // "dogsr" isn't a word, but playWord trusts its caller; five letters make an Amethyst.
    const next = playWord(battle(), [4, 5, 6, 7, 8], seeded(4))
    expect(next.grid.filter((tile) => tile.gem === 'amethyst')).toHaveLength(1)
    expect(next.message).toContain('Amethyst made')
  })

  it('triggers gem effects when a gem is spelled', () => {
    let state = withTiles(battle(), { 0: { gem: 'emerald' }, 1: { gem: 'sapphire' }, 2: { gem: 'ruby' } })
    state = playWord(state, [0, 1, 2], seeded(2))
    expect(state.hero.hp).toBe(38)
    expect(state.heroFx).toMatchObject({ amount: 8, kind: 'heal' })
    expect(state.enemy.frozen).toBe(true)
    expect(state.enemy.burn).toEqual({ turns: 3, amount: 2 })
  })

  it('pays out a potion for the bonus word once', () => {
    const next = playWord(battle(), [4, 5, 6, 7], seeded(2))
    expect(next.potions.health).toBe(2)
    expect(next.bonus.found).toBe(true)
    expect(next.message).toContain('bonus word')
  })

  it('uses up a Power potion on the next word', () => {
    const powered = drinkPotion(battle(), 'power')
    expect(powered.hero.powered).toBe(true)
    expect(powered.phase).toBe('player')
    expect(previewDamage(powered, [0, 1, 2])).toBe(5)
    expect(playWord(powered, [0, 1, 2], seeded(2)).hero.powered).toBe(false)
  })
})

describe('enemyTurn', () => {
  const afterWord = (state: BattleState) => ({ ...state, phase: 'enemy' as const })

  it('attacks and gives the turn back', () => {
    const next = enemyTurn(afterWord(battle()), fixed(0.5))
    expect(next.hero.hp).toBe(27)
    expect(next.heroFx).toMatchObject({ amount: 3, kind: 'damage' })
    expect(next.message).toBe('The Rat bites for 3')
    expect(next.phase).toBe('player')
  })

  it('beats the hero when health runs out', () => {
    const state = afterWord(battle())
    const next = enemyTurn({ ...state, hero: { ...state.hero, hp: 2 } }, fixed(0.5))
    expect(next.hero.hp).toBe(0)
    expect(next.phase).toBe('lost')
  })

  it('skips its turn while frozen', () => {
    const state = afterWord(battle())
    const next = enemyTurn({ ...state, enemy: { ...state.enemy, frozen: true } }, fixed(0.5))
    expect(next.hero.hp).toBe(30)
    expect(next.enemy.frozen).toBe(false)
  })

  it('burns, and can burn to death', () => {
    const state = afterWord(battle())
    const burning = enemyTurn({ ...state, enemy: { ...state.enemy, burn: { turns: 1, amount: 4 } } }, fixed(0.5))
    expect(burning.enemy.hp).toBe(16)
    expect(burning.enemy.burn).toBeNull()
    const dead = enemyTurn({ ...state, enemy: { ...state.enemy, hp: 3, burn: { turns: 2, amount: 4 } } }, fixed(0.5))
    expect(dead.phase).toBe('won')
  })

  it('winds up a charged blow a turn ahead', () => {
    const ogre: EnemyDef = { ...RAT, name: 'Ogre', abilities: [{ kind: 'charge', chance: 1 }] }
    const charging = enemyTurn(afterWord(battle(undefined, ogre)), fixed(0.5))
    expect(charging.enemy.charging).toBe(true)
    expect(charging.hero.hp).toBe(30)
    const hit = enemyTurn(afterWord(charging), fixed(0.5))
    expect(hit.hero.hp).toBe(30 - 8)
    expect(hit.enemy.charging).toBe(false)
  })

  it('poisons, and poison keeps hurting for a few turns', () => {
    const snake: EnemyDef = { ...RAT, name: 'Snake', abilities: [{ kind: 'poison', chance: 1 }] }
    let state = enemyTurn(afterWord(battle(undefined, snake)), fixed(0.5))
    // Half an attack, plus the first tick of poison.
    expect(state.hero.hp).toBe(30 - 2 - 1)
    expect(state.hero.poison).toEqual({ turns: 2, amount: 1 })
    state = enemyTurn(afterWord(state), fixed(0.5))
    expect(state.hero.hp).toBe(27 - 3 - 1)
    expect(state.hero.poison).toEqual({ turns: 1, amount: 1 })
  })

  it('locks tiles, which unlock after a couple of turns', () => {
    const spider: EnemyDef = { ...RAT, name: 'Spider', abilities: [{ kind: 'lock', chance: 1 }] }
    let state = enemyTurn(afterWord(battle(undefined, spider)), seeded(5))
    const locked = state.grid.flatMap((tile, i) => (tile.hazard?.kind === 'locked' ? [i] : []))
    expect(locked).toHaveLength(2)
    expect(state.grid[locked[0]].hazard).toEqual({ kind: 'locked', turns: 2 })
    const noAbilities = { ...state.enemy, def: RAT }
    state = enemyTurn(afterWord({ ...state, enemy: noAbilities }), fixed(0.5))
    state = enemyTurn(afterWord(state), fixed(0.5))
    expect(state.grid.some((tile) => tile.hazard)).toBe(false)
  })

  it('sets fires that scorch the hero if left to burn out', () => {
    const witch: EnemyDef = { ...RAT, name: 'Witch', abilities: [{ kind: 'burn', chance: 1 }] }
    let state = enemyTurn(afterWord(battle(undefined, witch)), seeded(5))
    const at = state.grid.findIndex((tile) => tile.hazard?.kind === 'burning')
    expect(state.grid[at].hazard).toEqual({ kind: 'burning', turns: 3 })
    state = { ...state, enemy: { ...state.enemy, def: RAT } }
    state = enemyTurn(afterWord(state), fixed(0.5))
    state = enemyTurn(afterWord(state), fixed(0.5))
    const hp = state.hero.hp
    state = enemyTurn(afterWord(state), fixed(0.5))
    expect(state.hero.hp).toBe(hp - 3 - 3)
    expect(state.message).toContain('burning tile')
    expect(state.grid.some((tile) => tile.hazard)).toBe(false)
    expect(state.grid).toHaveLength(16)
  })

  it('shields itself, halving your damage for the next turns', () => {
    const skeleton: EnemyDef = { ...RAT, name: 'Skeleton', abilities: [{ kind: 'shield', chance: 1 }] }
    const state = enemyTurn(afterWord(battle(undefined, skeleton)), fixed(0.5))
    expect(state.enemy.shield).toBe(3)
    expect(previewDamage(battle(), [0, 1, 2, 3])).toBe(5)
    expect(previewDamage(state, [0, 1, 2, 3])).toBe(3)
  })
})

describe('scramble', () => {
  it('costs a turn but keeps gems and hazards in place', () => {
    const state = withTiles(battle(), { 3: { gem: 'emerald' }, 5: { hazard: { kind: 'smashed' } } })
    const next = scramble(state, seeded(9))
    expect(next.phase).toBe('enemy')
    expect(next.grid[3].gem).toBe('emerald')
    expect(next.grid[5].hazard).toEqual({ kind: 'smashed' })
    expect(next.grid.map((tile) => tile.letter).join('')).not.toBe('catsdogsratsbeen')
  })

  it('is free when there are no words to make', () => {
    expect(scramble(battle(), seeded(9), true).phase).toBe('player')
  })
})

describe('drinkPotion', () => {
  it('heals with a Health potion', () => {
    const next = drinkPotion(battle(), 'health')
    expect(next.hero.hp).toBe(40)
    expect(next.potions.health).toBe(0)
    expect(canDrink(next, 'health')).toBe(false)
  })

  it('cures and mends with a Purity potion, but only when needed', () => {
    expect(canDrink(battle(), 'purity')).toBe(false)
    const state = withTiles(battle(), { 2: { hazard: { kind: 'locked', turns: 2 } } })
    const sick = { ...state, hero: { ...state.hero, weak: 2, poison: { turns: 2, amount: 1 } } }
    const cured = drinkPotion(sick, 'purity')
    expect(cured.hero.weak).toBe(0)
    expect(cured.hero.poison).toBeNull()
    expect(cured.grid.some((tile) => tile.hazard)).toBe(false)
    expect(cured.potions.purity).toBe(0)
  })
})
