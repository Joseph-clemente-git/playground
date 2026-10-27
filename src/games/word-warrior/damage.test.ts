import { describe, expect, it } from 'vitest'
import { gemFor, letterCount, wordDamage } from './damage'
import { tilesOf } from './test-utils'

describe('wordDamage', () => {
  it('rewards longer words more than linearly', () => {
    expect(wordDamage(tilesOf('cat'))).toBe(3)
    expect(wordDamage(tilesOf('rate'))).toBe(5)
    expect(wordDamage(tilesOf('tired'))).toBe(8)
    expect(wordDamage(tilesOf('strange'))).toBe(14)
    expect(wordDamage(tilesOf('strength'))).toBeGreaterThan(2 * wordDamage(tilesOf('tent')) + 4)
  })

  it('values rare letters higher', () => {
    expect(wordDamage(tilesOf('Qiz'))).toBeGreaterThan(wordDamage(tilesOf('tide')))
    expect(letterCount(tilesOf('Qiz'))).toBe(4)
  })

  it('applies gems and statuses', () => {
    const base = wordDamage(tilesOf('stone'))
    expect(base).toBe(8)
    expect(wordDamage([...tilesOf('ston'), { id: 9, letter: 'e', gem: 'amethyst' }])).toBe(9)
    expect(wordDamage([...tilesOf('ston'), { id: 9, letter: 'e', gem: 'diamond' }])).toBe(15)
    expect(wordDamage(tilesOf('stone'), { weakened: true })).toBe(5)
    expect(wordDamage(tilesOf('stone'), { powered: true })).toBe(11)
    expect(wordDamage(tilesOf('stone'), { shielded: true })).toBe(4)
  })

  it('gives smashed tiles no value', () => {
    expect(wordDamage(tilesOf('cat', { hazard: { kind: 'smashed' } }))).toBe(0)
    expect(wordDamage([...tilesOf('ca'), { id: 5, letter: 't', hazard: { kind: 'smashed' } }])).toBe(2)
  })

  it('adds the Golden Quill bonus to rare letters only', () => {
    expect(wordDamage(tilesOf('wax'), { quill: true })).toBeGreaterThan(wordDamage(tilesOf('wax')))
    expect(wordDamage(tilesOf('ten'), { quill: true })).toBe(wordDamage(tilesOf('ten')))
  })
})

describe('gemFor', () => {
  it('makes better gems for longer words', () => {
    expect([3, 4, 5, 6, 7, 8, 9, 10, 14].map(gemFor)).toEqual([
      undefined,
      undefined,
      'amethyst',
      'emerald',
      'sapphire',
      'ruby',
      'ruby',
      'diamond',
      'diamond',
    ])
  })
})
