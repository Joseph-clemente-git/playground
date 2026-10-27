import { CATEGORIES } from '../core/categories'
import type { GameManifest } from '../core/types'

export function GameThumb({ game, className = '' }: { game: GameManifest; className?: string }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${CATEGORIES[game.category].gradient} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
      <span className="relative drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" aria-hidden>
        {game.icon}
      </span>
    </div>
  )
}
