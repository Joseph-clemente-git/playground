import { registerSW } from 'virtual:pwa-register'

/**
 * idle: running the latest version we know of.
 * downloading: a new version was found and the service worker is caching it.
 * ready: the new version is installed and active; a reload switches to it.
 * applying: the reload is under way.
 * offline-ready: first install finished; the app now works without a connection.
 */
export type UpdateStatus = 'idle' | 'downloading' | 'ready' | 'applying' | 'offline-ready'

/** How often a session that stays open asks the server for a new version. */
const CHECK_INTERVAL = 15 * 60 * 1000
/** Minimum gap between checks when the app keeps coming back to the foreground. */
const RESUME_CHECK_GAP = 60 * 1000
/** Long enough for the update screen to paint and its progress bar to fill. */
const APPLY_DELAY = 700

let status: UpdateStatus = 'idle'
const listeners = new Set<() => void>()

function setStatus(next: UpdateStatus) {
  if (next === status) return
  status = next
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStatus() {
  return status
}

export function dismissStatus() {
  if (status === 'offline-ready') setStatus('idle')
}

/** Reloads into the new version, showing the update screen first. */
export function applyUpdate() {
  if (status === 'applying') return
  setStatus('applying')
  window.setTimeout(() => window.location.reload(), APPLY_DELAY)
}

/**
 * Registers the service worker and keeps checking for new versions. Browsers only look
 * for a new service worker on navigation, and an installed app that is resumed from the
 * background never navigates, so without this it would run the old build indefinitely.
 */
export function startUpdates() {
  if (!('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onOfflineReady: () => setStatus('offline-ready'),
    // The new service worker has taken over. Reloading is left to the UI, so it can
    // choose a moment that doesn't interrupt a game.
    onNeedReload: () => setStatus('ready'),
    onRegisteredSW(_swUrl, registration) {
      if (registration) watch(registration)
    },
  })
}

function watch(registration: ServiceWorkerRegistration) {
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing
    // The very first install isn't an update; onOfflineReady covers it.
    if (!worker || !navigator.serviceWorker.controller) return
    setStatus('downloading')
    worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant' && status === 'downloading') setStatus('idle')
    })
  })

  let lastCheck = Date.now()
  const check = () => {
    if (!navigator.onLine || registration.installing || status === 'ready' || status === 'applying') return
    lastCheck = Date.now()
    // Fails while offline or mid-deploy; the next check will try again.
    registration.update().catch(() => {})
  }

  window.setInterval(check, CHECK_INTERVAL)
  window.addEventListener('online', check)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastCheck > RESUME_CHECK_GAP) check()
  })
}
