import { describe, expect, it } from 'vitest'
import { fitScale, needsRotation, STAGE_SIZES } from './scale'

describe('fitScale', () => {
  it('fits a portrait stage to the limiting dimension', () => {
    // iPhone 15 viewport: width is the limit.
    expect(fitScale(STAGE_SIZES.portrait, { width: 393, height: 852 })).toBeCloseTo(393 / 720)
    // Short, wide-ish screen: height is the limit.
    expect(fitScale(STAGE_SIZES.portrait, { width: 600, height: 800 })).toBeCloseTo(800 / 1280)
  })

  it('scales up on large screens', () => {
    expect(fitScale(STAGE_SIZES.landscape, { width: 2560, height: 1440 })).toBe(2)
  })

  it('returns 0 before the container is measured', () => {
    expect(fitScale(STAGE_SIZES.any, { width: 0, height: 500 })).toBe(0)
  })
})

describe('needsRotation', () => {
  const portraitScreen = { width: 390, height: 844 }
  const landscapeScreen = { width: 844, height: 390 }

  it('asks to rotate only when held the wrong way', () => {
    expect(needsRotation('portrait', portraitScreen)).toBe(false)
    expect(needsRotation('portrait', landscapeScreen)).toBe(true)
    expect(needsRotation('landscape', landscapeScreen)).toBe(false)
    expect(needsRotation('landscape', portraitScreen)).toBe(true)
  })

  it('never asks for orientation-free games', () => {
    expect(needsRotation('any', portraitScreen)).toBe(false)
    expect(needsRotation('any', landscapeScreen)).toBe(false)
  })
})
