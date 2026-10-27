import { useEffect, useEffectEvent, useState, type CSSProperties } from 'react'
import { Segmented } from '../../components/Segmented'
import type { GameProps } from '../../core/types'
import {
  chooseMove,
  COLUMNS,
  currentTurn,
  drop,
  emptyBoard,
  getOutcome,
  landingRow,
  other,
  ROWS,
  type Cell,
  type Difficulty,
  type Disc,
} from './logic'

type Mode = 'ai' | 'friend'
type Scores = Record<Disc | 'draws', number>

const HUMAN: Disc = 'R'
const COMPUTER: Disc = 'Y'
/** Long enough for the player's disc to land before the computer answers. */
const COMPUTER_DELAY_MS = 650
const NO_SCORES: Scores = { R: 0, Y: 0, draws: 0 }

const DISC_FILL: Record<Disc, string> = { R: 'bg-rose-500', Y: 'bg-amber-300' }
const DISC_TEXT: Record<Disc, string> = { R: 'text-rose-400', Y: 'text-amber-300' }
const DISC_RING: Record<Disc, string> = { R: 'ring-rose-400', Y: 'ring-amber-300' }
const DISC_NAME: Record<Disc, string> = { R: 'Red', Y: 'Yellow' }

const MODES: [Mode, string][] = [
  ['ai', 'vs Computer'],
  ['friend', '2 Players'],
]
const DIFFICULTIES: [Difficulty, string][] = [
  ['easy', 'Easy'],
  ['medium', 'Medium'],
  ['hard', 'Hard'],
]

/** Drawn inside the 720×1280 portrait stage, so sizes are logical pixels. */
export default function ConnectFour({ onScore, onGameOver }: GameProps) {
  const [mode, setMode] = useState<Mode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [board, setBoard] = useState<Cell[]>(emptyBoard)
  // Who opens the round; it alternates so neither side always moves first.
  const [starter, setStarter] = useState<Disc>('R')
  const [scores, setScores] = useState<Scores>(NO_SCORES)
  const [hovered, setHovered] = useState<number | null>(null)

  const outcome = getOutcome(board)
  const turn = currentTurn(board, starter)
  const computerTurn = mode === 'ai' && turn === COMPUTER && !outcome
  const win = outcome && outcome.winner !== 'draw' ? outcome : null
  const canPlay = (column: number) => !outcome && !computerTurn && landingRow(board, column) >= 0

  function play(column: number) {
    if (outcome || landingRow(board, column) < 0) return
    const next = drop(board, column, turn)
    setBoard(next)

    const result = getOutcome(next)
    if (!result) return
    const key = result.winner === 'draw' ? 'draws' : result.winner
    setScores((current) => ({ ...current, [key]: current[key] + 1 }))
    if (mode === 'friend') return onGameOver({})
    if (result.winner === HUMAN) onScore(scores[HUMAN] + 1)
    onGameOver({ won: result.winner === HUMAN })
  }

  const computerMove = useEffectEvent(() => play(chooseMove(board, COMPUTER, difficulty)))

  useEffect(() => {
    if (!computerTurn) return
    const timer = setTimeout(computerMove, COMPUTER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [computerTurn, board])

  // Number keys 1–7 drop into a column on a keyboard.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    const column = Number(event.key) - 1
    if (Number.isInteger(column) && column >= 0 && column < COLUMNS && canPlay(column)) play(column)
  })

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function newRound() {
    // Only a finished round hands the first move over; a restart keeps it.
    if (outcome) setStarter(other(starter))
    setBoard(emptyBoard())
  }

  function resetMatch(nextMode = mode, nextDifficulty = difficulty) {
    setMode(nextMode)
    setDifficulty(nextDifficulty)
    setBoard(emptyBoard())
    setStarter('R')
    setScores(NO_SCORES)
  }

  const names: Record<Disc, string> = mode === 'ai' ? { R: 'You', Y: 'Computer' } : { R: 'Red', Y: 'Yellow' }

  let status: string
  if (win) status = mode === 'ai' ? (win.winner === HUMAN ? 'You win! 🎉' : 'Computer wins') : `${DISC_NAME[win.winner]} wins! 🎉`
  else if (outcome) status = 'It’s a draw'
  else if (mode === 'ai') status = turn === HUMAN ? 'Your turn' : 'Computer is thinking…'
  else status = `${DISC_NAME[turn]}’s turn`

  return (
    <div className="flex size-full flex-col justify-between rounded-[48px] bg-surface/80 px-12 py-12 ring-2 ring-white/5">
      <div className="flex flex-col gap-4">
        <Segmented label="Opponent" options={MODES} value={mode} onChange={(next) => resetMatch(next)} size="lg" />
        {mode === 'ai' ? (
          <Segmented
            label="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(next) => resetMatch(mode, next)}
            size="sm"
          />
        ) : (
          // Same height as the difficulty picker, so the board doesn't jump.
          <p className="flex h-[80px] items-center justify-center text-[28px] text-white/50">
            Take turns on the same device
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ScoreCard disc="R" name={names.R} score={scores.R} active={!outcome && turn === 'R'} />
        <div className="flex flex-col items-center justify-center rounded-[32px] bg-black/25 py-5">
          <span className="text-[26px] font-medium text-white/50">Draws</span>
          <span className="font-display text-[64px] font-bold leading-none text-white/80">{scores.draws}</span>
        </div>
        <ScoreCard disc="Y" name={names.Y} score={scores.Y} active={!outcome && turn === 'Y'} />
      </div>

      <p
        aria-live="polite"
        className={`text-center font-display text-[52px] font-semibold leading-none ${win ? DISC_TEXT[win.winner] : 'text-white'}`}
      >
        {status}
      </p>

      <div>
        {/* Shows which column a pointer is over, in the colour about to drop. */}
        <div className="mx-auto grid h-[56px] w-[624px] grid-cols-7 px-3" aria-hidden>
          {Array.from({ length: COLUMNS }, (_, column) => (
            <div key={column} className="grid place-items-center">
              {hovered === column && canPlay(column) && <div className={`size-[44px] rounded-full ${DISC_FILL[turn]}`} />}
            </div>
          ))}
        </div>

        <div className="mx-auto grid w-[624px] grid-cols-7 overflow-hidden rounded-[36px] bg-indigo-600 p-3 shadow-[inset_0_-10px_0_rgba(0,0,0,0.25)]">
          {Array.from({ length: COLUMNS }, (_, column) => (
            <button
              key={column}
              type="button"
              onClick={() => play(column)}
              onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(column)}
              onPointerLeave={() => setHovered(null)}
              disabled={!canPlay(column)}
              aria-label={`Column ${column + 1}${landingRow(board, column) < 0 ? ', full' : ''}`}
              className="flex flex-col rounded-[28px] transition enabled:hover:bg-white/10 enabled:active:bg-white/15 focus-visible:outline-4 focus-visible:outline-white disabled:cursor-default"
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const index = row * COLUMNS + column
                const cell = board[index]
                const winning = win?.line.includes(index)
                return (
                  <div key={row} className="relative aspect-square w-full p-[7px]">
                    <div className="size-full rounded-full bg-bg/85 shadow-[inset_0_6px_0_rgba(0,0,0,0.35)]" />
                    {cell && (
                      <div
                        className="absolute inset-0 animate-drop p-[7px]"
                        style={{ '--fall': row + 1 } as CSSProperties}
                      >
                        <div
                          className={`size-full rounded-full shadow-[inset_0_-6px_0_rgba(0,0,0,0.2)] transition-opacity duration-300 ${DISC_FILL[cell]} ${
                            win && !winning ? 'opacity-35' : ''
                          } ${winning ? 'ring-[6px] ring-white ring-inset' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <button
          type="button"
          onClick={() => resetMatch()}
          className="h-[104px] rounded-full bg-white/10 text-[34px] font-semibold text-white/85 ring-1 ring-white/10 active:scale-[0.97]"
        >
          Reset scores
        </button>
        <button
          type="button"
          onClick={newRound}
          className={`h-[104px] rounded-full bg-white text-[34px] font-semibold text-bg active:scale-[0.97] ${
            outcome ? 'animate-pop-in shadow-[0_0_48px_rgba(167,139,250,0.55)]' : ''
          }`}
        >
          {outcome ? 'Next round' : 'Restart'}
        </button>
      </div>
    </div>
  )
}

function ScoreCard({ disc, name, score, active }: { disc: Disc; name: string; score: number; active: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-[32px] bg-black/25 py-5 ring-4 transition ${
        active ? DISC_RING[disc] : 'ring-transparent'
      }`}
    >
      <span className="flex items-center gap-2 text-[26px] font-medium text-white/70">
        <span className={`size-[26px] rounded-full ${DISC_FILL[disc]}`} aria-hidden />
        {name}
      </span>
      <span className={`font-display text-[64px] font-bold leading-none ${DISC_TEXT[disc]}`}>{score}</span>
    </div>
  )
}
