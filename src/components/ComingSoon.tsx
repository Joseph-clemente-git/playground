import { CATEGORIES } from '../core/categories'
import type { GameManifest, Players } from '../core/types'
import { GameThumb } from './GameThumb'

const PLAYERS: Record<Players, string> = {
  '1': '1 player',
  '2-local': '2 players, same device',
  'vs-ai': 'vs computer or friend',
}

/** Placeholder drawn inside the scaled stage, so sizes are logical pixels. */
export function ComingSoon({ game }: { game: GameManifest }) {
  const landscape = game.orientation === 'landscape'
  const details = [
    ['Category', CATEGORIES[game.category].label],
    ['Players', PLAYERS[game.players]],
    ['Controls', game.controls],
    ['Orientation', game.orientation === 'any' ? 'Any' : game.orientation[0].toUpperCase() + game.orientation.slice(1)],
  ]

  return (
    <div
      className={`flex size-full items-center justify-center rounded-[48px] bg-surface/80 ring-2 ring-white/5 ${
        landscape ? 'flex-row gap-20 px-24' : 'flex-col gap-14 px-16'
      }`}
    >
      <GameThumb game={game} className="size-[320px] shrink-0 rounded-[72px] text-[160px] shadow-2xl" />
      <div className={`flex flex-col gap-8 ${landscape ? 'items-start text-left' : 'items-center text-center'}`}>
        <span className="rounded-full bg-accent/15 px-7 py-2.5 text-[28px] font-semibold uppercase tracking-[0.2em] text-accent">
          Coming soon
        </span>
        <h1 className="font-display text-[84px] font-bold leading-none text-white">{game.title}</h1>
        <p className="max-w-[560px] text-[34px] leading-snug text-white/70">{game.description}</p>
        <dl className="mt-2 grid w-[560px] grid-cols-[auto_1fr] gap-x-8 gap-y-4 rounded-[32px] bg-black/25 p-8 text-left text-[28px]">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-white/45">{label}</dt>
              <dd className="font-medium text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
