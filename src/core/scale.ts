import type { Orientation } from './types'

export interface Size {
  width: number
  height: number
}

/** The fixed logical resolution each orientation is designed at. */
export const STAGE_SIZES: Record<Orientation, Size> = {
  portrait: { width: 720, height: 1280 },
  landscape: { width: 1280, height: 720 },
  any: { width: 1000, height: 1000 },
}

/** Largest uniform scale that fits `stage` inside `container` without distortion. */
export function fitScale(stage: Size, container: Size): number {
  if (container.width <= 0 || container.height <= 0) return 0
  return Math.min(container.width / stage.width, container.height / stage.height)
}

/** Whether the screen is held the wrong way for a game of this orientation. */
export function needsRotation(orientation: Orientation, screen: Size): boolean {
  if (orientation === 'any') return false
  const isPortrait = screen.height >= screen.width
  return orientation === 'portrait' ? !isPortrait : isPortrait
}
