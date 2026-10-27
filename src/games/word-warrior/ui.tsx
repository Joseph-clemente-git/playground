import type { CSSProperties, ReactNode } from 'react'

/** A chunky wooden button: ink outline, a lit top edge and a shaded bottom one. */
export const WOOD =
  'border-[5px] border-ww-ink bg-ww-wood text-ww-cream shadow-[inset_0_-7px_0_rgba(0,0,0,0.25),inset_0_4px_0_rgba(255,255,255,0.22)] transition active:translate-y-[2px] active:shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)] disabled:opacity-45 disabled:active:translate-y-0'

/** The gold call-to-action version of WOOD. */
export const GOLD =
  'border-[5px] border-ww-ink bg-ww-gold text-ww-ink shadow-[inset_0_-7px_0_rgba(140,80,0,0.35),inset_0_4px_0_rgba(255,255,255,0.45)] transition active:translate-y-[2px] active:shadow-[inset_0_-3px_0_rgba(140,80,0,0.35)] disabled:bg-[#cdbb93] disabled:text-ww-ink/45 disabled:shadow-none disabled:active:translate-y-0'

/** Cream lettering with a thick ink outline, as on the battle header. */
export const OUTLINED = 'text-outline font-display font-bold text-ww-cream'

const INK_OUTLINE: CSSProperties = {
  filter:
    'drop-shadow(3px 0 0 #3b2414) drop-shadow(-3px 0 0 #3b2414) drop-shadow(0 3px 0 #3b2414) drop-shadow(0 -3px 0 #3b2414)',
}

/** An enemy emoji drawn like a sticker, outlined in ink to match the painted scenes. */
export function EnemyArt({
  emoji,
  size,
  outlined = true,
  className = '',
}: {
  emoji: string
  size: number
  outlined?: boolean
  className?: string
}) {
  return (
    <span className={`grid place-items-center leading-none ${className}`} style={{ ...(outlined ? INK_OUTLINE : {}), fontSize: size }}>
      {/* Turned to face the hero on the left. */}
      <span className="[transform:scaleX(-1)]">{emoji}</span>
    </span>
  )
}

/** The soft shadow a fighter stands on. */
export function GroundShadow({ className = '' }: { className?: string }) {
  return <div className={`rounded-[50%] bg-ww-ink/35 blur-[2px] ${className}`} aria-hidden />
}

/** A parchment banner with folded tails. Position it with `className`, e.g. `absolute ...`. */
export function Ribbon({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={className}>
      <RibbonTail side="left" />
      <RibbonTail side="right" />
      <div className="relative flex size-full items-center justify-center rounded-[20px] border-[5px] border-ww-ink bg-ww-parchment px-8 text-center shadow-[inset_0_-6px_0_rgba(107,74,46,0.2),0_6px_0_rgba(59,36,20,0.25)]">
        {children}
      </div>
    </div>
  )
}

function RibbonTail({ side }: { side: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 64 60"
      className={`absolute top-[18%] h-[82%] w-[56px] ${side === 'left' ? '-left-[38px]' : '-right-[38px] [transform:scaleX(-1)]'}`}
      aria-hidden
    >
      <path d="M4 4 H60 V56 H4 L20 30 Z" fill="#d8bf8f" stroke="#3b2414" strokeWidth="5" strokeLinejoin="round" />
      <path d="M44 56 L60 44" stroke="#3b2414" strokeWidth="5" />
    </svg>
  )
}

/** A gently tilted socket sparkle, shown where a letter can go. */
export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="currentColor" />
    </svg>
  )
}
