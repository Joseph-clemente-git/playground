import { HERO_PLATES } from './heroPlates'

/**
 * The hero: a young scholar with a giant fountain pen and a glowing spellbook.
 *
 * Reproduced the way a printer reproduces an image: the reference was scanned,
 * separated into colour plates, each plate traced to a vector shape, and the
 * plates stacked in register on a 400×400 canvas: an ink silhouette first, the
 * colour plates from light to dark, then highlight and line-work plates traced
 * at full detail on top. See heroPlates.ts.
 */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '120 20 160 160' : '0 0 400 400'} className={className} aria-hidden>
      {HERO_PLATES.map(([fill, d], i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </svg>
  )
}
