import { Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ComingSoon } from '../components/ComingSoon'
import { GameStage } from '../components/GameStage'
import { BackIcon, CollapseIcon, ExpandIcon } from '../components/icons'
import { useFullscreen } from '../core/hooks/useFullscreen'
import { getGameComponent } from '../core/loadGame'
import { findGame } from '../core/registry'
import { canFullscreen, lockOrientation, toggleFullscreen, unlockOrientation } from '../core/screen'
import { NotFound } from './NotFound'

// Score storage arrives with the first playable game.
const noop = () => {}

export function GamePage() {
  const { slug = '' } = useParams()
  const game = findGame(slug)
  const fullscreen = useFullscreen()

  useEffect(() => {
    if (!game) return
    document.title = `${game.title} · Game Hub`
    return () => {
      document.title = 'Game Hub'
    }
  }, [game])

  // Re-try the lock whenever fullscreen changes, since that is when browsers allow it.
  useEffect(() => {
    if (!game) return
    void lockOrientation(game.orientation)
  }, [game, fullscreen])

  useEffect(() => unlockOrientation, [])

  if (!game) return <NotFound />
  const Game = getGameComponent(game)

  return (
    <div className="flex h-dvh flex-col bg-bg pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]">
      <header className="flex h-14 shrink-0 items-center gap-2 px-2">
        <Link
          to="/"
          aria-label="Back to games"
          className="grid size-12 place-items-center rounded-full text-white/80 active:bg-white/10"
          onClick={() => {
            if (fullscreen) void toggleFullscreen()
          }}
        >
          <BackIcon className="size-6" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-white">{game.title}</h1>
        {canFullscreen() && (
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="grid size-12 place-items-center rounded-full text-white/80 active:bg-white/10"
          >
            {fullscreen ? <CollapseIcon className="size-6" /> : <ExpandIcon className="size-6" />}
          </button>
        )}
      </header>
      <main className="flex min-h-0 flex-1 flex-col p-2 pt-0">
        <GameStage orientation={game.orientation}>
          {Game ? (
            <Suspense fallback={null}>
              {/* oxlint-disable-next-line react/static-components -- cached per slug in getGameComponent */}
              <Game onScore={noop} onGameOver={noop} />
            </Suspense>
          ) : (
            <ComingSoon game={game} />
          )}
        </GameStage>
      </main>
    </div>
  )
}
