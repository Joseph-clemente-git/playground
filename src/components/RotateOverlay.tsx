import type { Orientation } from '../core/types'

export function RotateOverlay({ orientation }: { orientation: Orientation }) {
  return (
    <div
      role="alertdialog"
      aria-label={`Rotate your device to ${orientation}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg/95 p-8 text-center backdrop-blur"
    >
      <div className={orientation === 'landscape' ? 'animate-rotate-to-landscape' : 'animate-rotate-to-portrait'}>
        <svg viewBox="0 0 24 24" className="size-20 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="6" y="2" width="12" height="20" rx="2.5" />
          <path d="M11 18.5h2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-white">Rotate your device</p>
        <p className="mt-1 text-white/60">This game plays in {orientation} mode.</p>
      </div>
    </div>
  )
}
