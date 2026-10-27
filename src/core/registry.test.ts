import { describe, expect, it } from 'vitest'
import { findGame, GAMES } from './registry'

describe('registry', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = GAMES.map((game) => game.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/)
  })

  it('finds games by slug', () => {
    expect(findGame('snake')?.title).toBe('Snake')
    expect(findGame('nope')).toBeUndefined()
  })
})
