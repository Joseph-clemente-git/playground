import type { Orientation } from './types'

// `lock` is missing from some lib.dom versions and unsupported on iOS Safari.
type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'portrait' | 'landscape') => Promise<void>
}

/**
 * Best-effort orientation lock. Browsers only honour it in fullscreen or an
 * installed PWA, so failures are expected and the rotate overlay covers them.
 */
export async function lockOrientation(orientation: Orientation): Promise<void> {
  const screenOrientation = screen.orientation as LockableOrientation | undefined
  if (orientation === 'any' || !screenOrientation?.lock) return
  try {
    await screenOrientation.lock(orientation)
  } catch {
    // Not allowed in this context.
  }
}

export function unlockOrientation(): void {
  try {
    screen.orientation?.unlock?.()
  } catch {
    // Nothing was locked.
  }
}

export function canFullscreen(): boolean {
  return typeof document.documentElement.requestFullscreen === 'function' && document.fullscreenEnabled
}

export function isFullscreen(): boolean {
  return document.fullscreenElement !== null
}

export async function toggleFullscreen(): Promise<void> {
  try {
    if (isFullscreen()) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
  } catch {
    // Denied by the browser.
  }
}
