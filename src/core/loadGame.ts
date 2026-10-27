import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { GameManifest, GameProps } from './types'

const cache = new Map<string, LazyExoticComponent<ComponentType<GameProps>>>()

/** One stable lazy component per game, so revisiting a game doesn't remount it twice. */
export function getGameComponent(game: GameManifest) {
  if (!game.load) return null
  let component = cache.get(game.slug)
  if (!component) {
    component = lazy(game.load)
    cache.set(game.slug, component)
  }
  return component
}
