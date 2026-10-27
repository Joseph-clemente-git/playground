import { useEffect, useReducer, useRef, type PointerEvent } from 'react'
import type { GameProps } from '../../core/types'
import './game.css'
import { createGame, move, SIZE, type Direction, type GameState, type Tile } from './logic'

// Logical pixels inside the 720×1280 portrait stage.
const BOARD = 640
const GAP = 16
const CELL = (BOARD - GAP * (SIZE + 1)) / SIZE
/** Screen pixels a finger must travel before it counts as a swipe. */
const SWIPE_MIN = 24

const STORAGE_KEY = 'game-hub:2048'

const KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

const TILE_COLORS: Record<number, string> = {
  2: 'bg-[#3a3858] text-[#e9e6ff]',
  4: 'bg-[#4c4686] text-white',
  8: 'bg-[#6d5bd0] text-white',
  16: 'bg-[#8b5cf6] text-white',
  32: 'bg-[#c026d3] text-white',
  64: 'bg-[#e11d74] text-white',
  128: 'bg-[#f97316] text-white shadow-[0_0_24px_rgba(249,115,22,0.45)]',
  256: 'bg-[#f59e0b] text-white shadow-[0_0_28px_rgba(245,158,11,0.5)]',
  512: 'bg-[#eab308] text-[#2b1d00] shadow-[0_0_32px_rgba(234,179,8,0.55)]',
  1024: 'bg-[#84cc16] text-[#132100] shadow-[0_0_36px_rgba(132,204,22,0.55)]',
  2048: 'bg-[#22c55e] text-white shadow-[0_0_48px_rgba(34,197,94,0.7)]',
}
const BEYOND_COLOR = 'bg-[#0ea5e9] text-white shadow-[0_0_48px_rgba(14,165,233,0.7)]'

interface State {
  game: GameState
  best: number
  /** Dismissed the win screen to play on past 2048. */
  keepPlaying: boolean
  /** Bumped on each new game so tiles remount instead of sliding from the old board. */
  round: number
  /** Points from the last move, shown floating above the score. */
  gain: { value: number; key: number } | null
}

type Action = { type: 'move'; direction: Direction } | { type: 'restart' } | { type: 'keep-playing' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'move': {
      if (state.game.over || (state.game.won && !state.keepPlaying)) return state
      const game = move(state.game, action.direction)
      if (game === state.game) return state
      const value = game.score - state.game.score
      return {
        ...state,
        game,
        best: Math.max(state.best, game.score),
        gain: value > 0 ? { value, key: (state.gain?.key ?? 0) + 1 } : state.gain,
      }
    }
    case 'restart':
      return { ...state, game: createGame(), keepPlaying: false, round: state.round + 1, gain: null }
    case 'keep-playing':
      return { ...state, keepPlaying: true }
  }
}

function init(): State {
  const fresh: State = { game: createGame(), best: 0, keepPlaying: false, round: 0, gain: null }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<State> | null
    if (!saved) return fresh
    const best = typeof saved.best === 'number' ? saved.best : 0
    const game = saved.game && Array.isArray(saved.game.tiles) && !saved.game.over ? saved.game : fresh.game
    return { ...fresh, game, best, keepPlaying: game === saved.game && saved.keepPlaying === true }
  } catch {
    return fresh
  }
}

function tileOffset(index: number) {
  return GAP + index * (CELL + GAP)
}

function tileFontSize(value: number) {
  const digits = String(value).length
  return digits <= 2 ? 72 : digits === 3 ? 60 : digits === 4 ? 48 : 38
}

export default function Game2048({ onScore, onGameOver }: GameProps) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { game, best, keepPlaying, round, gain } = state
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game, best, keepPlaying }))
    } catch {
      // Storage is full or blocked; the game still works without it.
    }
  }, [game, best, keepPlaying])

  useEffect(() => onScore(game.score), [game.score, onScore])

  useEffect(() => {
    if (game.over) onGameOver({ score: game.score, won: game.won })
  }, [game.over, game.score, game.won, onGameOver])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const direction = KEYS[event.key.length === 1 ? event.key.toLowerCase() : event.key]
      if (!direction) return
      event.preventDefault()
      dispatch({ type: 'move', direction })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary) return
    swipeStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
  }

  function onPointerUp(event: PointerEvent) {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return
    const direction: Direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    dispatch({ type: 'move', direction })
  }

  const showWin = game.won && !keepPlaying && !game.over

  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-10 px-10"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
    >
      <div className="flex w-[640px] items-stretch gap-4">
        <div className="grid size-[148px] shrink-0 place-items-center rounded-[28px] bg-[#22c55e] font-display text-[52px] font-bold text-white shadow-[0_0_40px_rgba(34,197,94,0.35)]">
          2048
        </div>
        <ScoreBox label="Score" value={game.score} gain={gain} />
        <ScoreBox label="Best" value={best} />
      </div>

      <div className="flex w-[640px] items-center justify-between gap-6">
        <p className="text-[30px] leading-snug text-white/65">
          Join the tiles, get to <strong className="font-semibold text-white">2048!</strong>
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'restart' })}
          onPointerDown={(event) => event.stopPropagation()}
          className="h-[88px] shrink-0 rounded-[24px] bg-accent px-8 font-display text-[32px] font-semibold text-[#1c1236] active:scale-95"
        >
          New game
        </button>
      </div>

      <div
        role="application"
        aria-label={`2048 board. Score ${game.score}. Use arrow keys or swipe to move tiles.`}
        className="relative shrink-0 rounded-[32px] bg-surface ring-2 ring-white/5"
        style={{ width: BOARD, height: BOARD }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-[20px] bg-white/[0.04]"
            style={{
              width: CELL,
              height: CELL,
              left: tileOffset(i % SIZE),
              top: tileOffset(Math.floor(i / SIZE)),
            }}
          />
        ))}
        <div key={round}>
          {game.tiles.map((tile) => (
            <TileView key={tile.id} tile={tile} />
          ))}
        </div>

        {(game.over || showWin) && (
          <div className="g2048-overlay absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 rounded-[32px] bg-bg/80 backdrop-blur-sm">
            <p className="font-display text-[80px] font-bold leading-none text-white">
              {game.over ? 'Game over' : 'You win!'}
            </p>
            <p className="text-[32px] text-white/70">
              {game.over ? `You scored ${game.score.toLocaleString()}` : 'You made the 2048 tile.'}
            </p>
            <div className="mt-4 flex gap-5" onPointerDown={(event) => event.stopPropagation()}>
              {showWin && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'keep-playing' })}
                  className="h-[88px] rounded-[24px] bg-white/10 px-8 font-display text-[32px] font-semibold text-white active:scale-95"
                >
                  Keep going
                </button>
              )}
              <button
                type="button"
                onClick={() => dispatch({ type: 'restart' })}
                className="h-[88px] rounded-[24px] bg-accent px-8 font-display text-[32px] font-semibold text-[#1c1236] active:scale-95"
              >
                {game.over ? 'Try again' : 'New game'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[28px] text-white/40">Swipe anywhere to slide the tiles</p>
    </div>
  )
}

function ScoreBox({ label, value, gain }: { label: string; value: number; gain?: State['gain'] }) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-[28px] bg-surface ring-2 ring-white/5">
      <span className="text-[24px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</span>
      <span className="font-display text-[52px] font-bold leading-tight text-white tabular-nums">
        {value.toLocaleString()}
      </span>
      {gain && (
        <span
          key={gain.key}
          className="g2048-gain pointer-events-none absolute bottom-6 font-display text-[36px] font-bold text-accent"
        >
          +{gain.value}
        </span>
      )}
    </div>
  )
}

function TileView({ tile }: { tile: Tile }) {
  const animation = tile.kind === 'new' ? 'g2048-new' : tile.kind === 'merged' ? 'g2048-merged' : ''
  return (
    <div
      className="g2048-tile absolute left-0 top-0"
      style={{
        width: CELL,
        height: CELL,
        transform: `translate(${tileOffset(tile.col)}px, ${tileOffset(tile.row)}px)`,
        zIndex: tile.kind === 'consumed' ? 0 : tile.kind === 'merged' ? 2 : 1,
      }}
    >
      <div
        className={`grid size-full place-items-center rounded-[20px] font-display font-bold tabular-nums ${
          TILE_COLORS[tile.value] ?? BEYOND_COLOR
        } ${animation}`}
        style={{ fontSize: tileFontSize(tile.value) }}
      >
        {tile.value}
      </div>
    </div>
  )
}
