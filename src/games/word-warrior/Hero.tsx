import heroUrl from './art/hero.webp'

/**
 * The hero: a young scholar with a giant fountain pen and a glowing spellbook.
 * The art is upscaled from its reference and cut out of its background; see
 * scripts/hero-art. It sits on a 400×400 canvas so the portrait can crop to his head.
 */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  return (
    <svg viewBox={portrait ? '120 20 160 160' : '0 0 400 400'} className={className} aria-hidden>
      <image href={heroUrl} width="400" height="400" />
    </svg>
  )
}
