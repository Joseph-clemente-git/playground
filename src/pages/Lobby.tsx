import { useMemo, useState } from 'react'
import { GameCard } from '../components/GameCard'
import { SearchIcon } from '../components/icons'
import { CATEGORIES } from '../core/categories'
import { GAMES } from '../core/registry'
import type { Category } from '../core/types'

const FILTERS = [['all', 'All'], ...Object.entries(CATEGORIES).map(([id, { label }]) => [id, label])] as [
  Category | 'all',
  string,
][]

export function Lobby() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const games = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GAMES.filter(
      (game) =>
        (category === 'all' || game.category === category) &&
        (!q || game.title.toLowerCase().includes(q) || game.description.toLowerCase().includes(q)),
    )
  }, [query, category])

  const playable = GAMES.filter((game) => game.load).length

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        <img src="/favicon.svg" alt="" className="size-11 rounded-2xl" />
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-white">Game Hub</h1>
          <p className="text-sm text-white/55">Quick games, made for your phone</p>
        </div>
      </header>

      <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          {playable === 0 ? 'Launching soon' : `${playable} playable now`}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-4xl">
          {GAMES.length} games are on the way
        </h2>
        <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">
          Board, puzzle, arcade, word and card games — each one built for touch and sized to fit any screen.
        </p>
      </section>

      <div className="sticky top-0 z-10 -mx-4 mt-5 bg-bg/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <label className="flex items-center gap-2 rounded-2xl bg-surface px-4 ring-1 ring-white/10 focus-within:ring-accent">
          <SearchIcon className="size-5 shrink-0 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games"
            aria-label="Search games"
            className="h-12 w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              aria-pressed={category === id}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
                category === id ? 'bg-white text-bg' : 'bg-surface text-white/75 ring-1 ring-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {games.length > 0 ? (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {games.map((game) => (
            <li key={game.slug}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-white/50">No games match “{query}”.</p>
      )}
    </div>
  )
}
