import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { canApplySilently } from '../pwa/policy'
import { applyUpdate, dismissStatus, getStatus, subscribe } from '../pwa/updates'

const OFFLINE_TOAST_MS = 3000

/** Shows update progress and decides when a downloaded update gets applied. */
export function UpdateNotice() {
  const status = useSyncExternalStore(subscribe, getStatus)
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(false)

  // Apply straight away when it won't disrupt anyone, and again whenever the app is
  // sent to the background with an update still pending.
  useEffect(() => {
    if (status !== 'ready') return
    const tryApply = () => {
      if (canApplySilently({ pathname, hidden: document.hidden, msSinceLaunch: performance.now() })) applyUpdate()
    }
    tryApply()
    document.addEventListener('visibilitychange', tryApply)
    return () => document.removeEventListener('visibilitychange', tryApply)
  }, [status, pathname])

  useEffect(() => {
    if (status !== 'offline-ready') return
    const timer = window.setTimeout(dismissStatus, OFFLINE_TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  if (status === 'applying') return <UpdatingScreen />
  if (status === 'downloading') {
    return (
      <Toast>
        <Spinner />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Downloading update…</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-accent motion-safe:animate-indeterminate" />
          </div>
        </div>
      </Toast>
    )
  }
  if (status === 'ready' && !dismissed) {
    return (
      <Toast>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Update ready</p>
          <p className="text-xs text-white/60">Restart to get the latest version.</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="h-10 shrink-0 rounded-full px-3 text-sm font-semibold text-white/70 active:bg-white/10"
        >
          Later
        </button>
        <button
          type="button"
          onClick={applyUpdate}
          className="h-10 shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-bg active:brightness-90"
        >
          Restart
        </button>
      </Toast>
    )
  }
  if (status === 'offline-ready') {
    return (
      <Toast>
        <CheckIcon />
        <p className="text-sm font-semibold text-white">Ready to play offline</p>
      </Toast>
    )
  }
  return null
}

function Toast({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-surface/95 py-3 pl-4 pr-3 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur motion-safe:animate-toast-in"
      >
        {children}
      </div>
    </div>
  )
}

function UpdatingScreen() {
  return (
    <div
      role="alert"
      aria-busy="true"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-bg p-8 text-center motion-safe:animate-fade-in"
    >
      <img src="/favicon.svg" alt="" className="size-20 rounded-3xl motion-safe:animate-pulse" />
      <div>
        <p className="font-display text-2xl font-semibold text-white">Updating Game Hub</p>
        <p className="mt-1 text-white/60">Getting the latest version ready…</p>
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="h-full origin-left rounded-full bg-accent animate-fill" />
      </div>
    </div>
  )
}

function Spinner() {
  return <span aria-hidden className="size-5 shrink-0 animate-spin rounded-full border-2 border-white/15 border-t-accent" />
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
