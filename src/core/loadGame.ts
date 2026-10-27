import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { GameManifest, GameProps } from './types'

const cache = new Map<string, LazyExoticComponent<ComponentType<GameProps>>>()

const RELOAD_KEY = 'game-hub:stale-chunk-reload'

/** One stable lazy component per game, so revisiting a game doesn't remount it twice. */
export function getGameComponent(game: GameManifest) {
  if (!game.load) return null
  let component = cache.get(game.slug)
  if (!component) {
    component = lazy(reloadOnStaleChunk(game.load))
    cache.set(game.slug, component)
  }
  return component
}

/**
 * A page that was open across a deploy still asks for the previous build's chunks,
 * which are gone from both the server and the service worker cache. Reload once to
 * pick up the new build; if it fails again it's a real error, so let it through.
 */
function reloadOnStaleChunk<T>(load: () => Promise<T>) {
  return () =>
    load().then(
      (module) => {
        try {
          sessionStorage.removeItem(RELOAD_KEY)
        } catch {
          // Storage blocked; nothing to clear.
        }
        return module
      },
      (error: unknown) => {
        if (!claimReload()) throw error
        window.location.reload()
        return new Promise<T>(() => {})
      },
    )
}

/** True the first time per session. Without storage we can't tell, so don't risk a loop. */
function claimReload() {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false
    sessionStorage.setItem(RELOAD_KEY, '1')
    return true
  } catch {
    return false
  }
}
