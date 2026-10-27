import { useSyncExternalStore } from 'react'
import type { Size } from '../scale'

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange)
  window.addEventListener('orientationchange', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
  }
}

let cached: Size = { width: 0, height: 0 }

function getSnapshot(): Size {
  const { innerWidth: width, innerHeight: height } = window
  if (width !== cached.width || height !== cached.height) cached = { width, height }
  return cached
}

export function useViewportSize(): Size {
  return useSyncExternalStore(subscribe, getSnapshot)
}
