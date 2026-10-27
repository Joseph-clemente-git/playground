import { describe, expect, it } from 'vitest'
import {
  afterLoss,
  afterWin,
  BASE_HP,
  battleAt,
  CHAPTERS,
  maxHp,
  newProgress,
  parseProgress,
  perks,
  startingHp,
  TOTAL_BATTLES,
  treasuresOwned,
} from './campaign'

describe('the book', () => {
  it('has three chapters of five battles, each ending with a boss', () => {
    expect(TOTAL_BATTLES).toBe(15)
    for (const chapter of CHAPTERS) {
      expect(chapter.enemies).toHaveLength(5)
      expect(chapter.bonus).toHaveLength(5)
    }
    expect(battleAt(4).isBoss).toBe(true)
    expect(battleAt(5)).toMatchObject({ chapterIndex: 1, place: 0, isBoss: false })
    expect(battleAt(14).enemy.name).toBe('Dragon')
  })

  it('gets harder as it goes', () => {
    for (const chapter of CHAPTERS) {
      const hps = chapter.enemies.map((enemy) => enemy.hp)
      expect(hps).toEqual([...hps].sort((a, b) => a - b))
    }
    for (let i = 1; i < CHAPTERS.length; i++) {
      expect(CHAPTERS[i].enemies[0].hp).toBeGreaterThan(CHAPTERS[i - 1].enemies[3].hp)
      expect(CHAPTERS[i].enemies[4].hp).toBeGreaterThan(CHAPTERS[i - 1].enemies[4].hp)
    }
  })
})

describe('progress', () => {
  it('opens the next battle on a win and heals a third', () => {
    const progress = afterWin(newProgress(), 0, 20, { health: 0, purity: 0, power: 0 })
    expect(progress.cleared).toBe(1)
    expect(progress.hp).toBe(33)
    expect(startingHp(progress, 1)).toBe(33)
  })

  it('starts each chapter and every replay at full health', () => {
    const progress = { ...newProgress(), cleared: 6, hp: 12 }
    expect(startingHp(progress, 6)).toBe(12)
    expect(startingHp(progress, 2)).toBe(maxHp(6))
    expect(startingHp({ ...progress, cleared: 5 }, 5)).toBe(maxHp(5))
  })

  it("doesn't move forward on a replay", () => {
    const progress = { ...newProgress(), cleared: 3, hp: 10 }
    const potions = { health: 2, purity: 0, power: 0 }
    expect(afterWin(progress, 1, 5, potions)).toEqual({ cleared: 3, hp: 10, potions })
  })

  it('retries at full health after a loss', () => {
    expect(afterLoss({ ...newProgress(), cleared: 2, hp: 4 }).hp).toBe(BASE_HP)
  })

  it('earns a treasure from each boss', () => {
    expect(treasuresOwned(4)).toEqual([])
    expect(treasuresOwned(5)).toEqual(['inkwell'])
    expect(maxHp(5)).toBe(BASE_HP + 10)
    expect(perks(10)).toEqual({ quill: false, bookmark: true })
    expect(perks(15)).toEqual({ quill: true, bookmark: true })
  })
})

describe('parseProgress', () => {
  it('falls back to a fresh book for missing or broken saves', () => {
    expect(parseProgress(null)).toEqual(newProgress())
    expect(parseProgress('not json')).toEqual(newProgress())
    expect(parseProgress('42')).toEqual(newProgress())
  })

  it('clamps out-of-range values', () => {
    const saved = JSON.stringify({ cleared: 99, hp: 500, potions: { health: -3, purity: 2, power: 'lots' } })
    expect(parseProgress(saved)).toEqual({ cleared: 15, hp: maxHp(15), potions: { health: 0, purity: 2, power: 0 } })
  })
})
