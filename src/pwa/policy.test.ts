import { describe, expect, it } from 'vitest'
import { canApplySilently, LAUNCH_WINDOW } from './policy'

describe('canApplySilently', () => {
  it('applies in the lobby right after launch', () => {
    expect(canApplySilently({ pathname: '/', hidden: false, msSinceLaunch: 1200 })).toBe(true)
  })

  it('asks once the player has been in the lobby for a while', () => {
    expect(canApplySilently({ pathname: '/', hidden: false, msSinceLaunch: LAUNCH_WINDOW })).toBe(false)
  })

  it('applies while the app is in the background', () => {
    expect(canApplySilently({ pathname: '/', hidden: true, msSinceLaunch: 60_000 })).toBe(true)
  })

  it('never interrupts a game', () => {
    expect(canApplySilently({ pathname: '/games/2048', hidden: true, msSinceLaunch: 0 })).toBe(false)
  })
})
