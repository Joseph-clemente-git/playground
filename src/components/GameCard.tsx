import { Link } from 'react-router-dom'
import type { GameManifest } from '../core/types'
import { GameThumb } from './GameThumb'
import { OrientationIcon } from './icons'

export function GameCard({ game }: { game: GameManifest }) {
  const comingSoon = !game.load
  return (
    <Link
      to={`/games/${game.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-white/5 transition active:scale-[0.97] hover:ring-white/20 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="relative">
        <GameThumb game={game} className="aspect-square text-5xl sm:text-6xl" />
        {comingSoon && (
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            Coming soon
          </span>
        )}
        <span
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
          title={`Plays in ${game.orientation === 'any' ? 'any orientation' : game.orientation}`}
        >
          <OrientationIcon orientation={game.orientation} className="size-4" />
        </span>
      </div>
      <div className="px-3 py-2.5">
        <h3 className="truncate font-display text-base font-semibold text-white">{game.title}</h3>
      </div>
    </Link>
  )
}
