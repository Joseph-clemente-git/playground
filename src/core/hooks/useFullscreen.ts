import { useSyncExternalStore } from 'react'
import { isFullscreen } from '../screen'

function subscribe(onChange: () => void) {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

export function useFullscreen(): boolean {
  return useSyncExternalStore(subscribe, isFullscreen)
}
