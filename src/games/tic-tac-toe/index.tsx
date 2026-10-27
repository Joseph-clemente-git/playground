import { useEffect, useEffectEvent, useState } from 'react'
import type { GameProps } from '../../core/types'
import { chooseMove, currentTurn, emptyBoard, getOutcome, other, type Cell, type Difficulty, type Mark } from './logic'

type Mode = 'ai' | 'friend'
type Scores = Record<Mark | 'draws', number>

const HUMAN: Mark = 'X'
const COMPUTER: Mark = 'O'
const COMPUTER_DELAY_MS = 550
const NO_SCORES: Scores = { X: 0, O: 0, draws: 0 }

const MARK_COLOR: Record<Mark, string> = { X: 'text-sky-400', O: 'text-rose-400' }
const MARK_RING: Record<Mark, string> = { X: 'ring-sky-400', O: 'ring-rose-400' }

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
export default function TicTacToe({ onScore, onGameOver }: GameProps) {
  const [mode, setMode] = useState<Mode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [board, setBoard] = useState<Cell[]>(emptyBoard)
  // Who opens the round; it alternates so neither side always moves first.
  const [starter, setStarter] = useState<Mark>('X')
  const [scores, setScores] = useState<Scores>(NO_SCORES)

  const outcome = getOutcome(board)
  const turn = currentTurn(board, starter)
  const computerTurn = mode === 'ai' && turn === COMPUTER && !outcome
  const win = outcome && outcome.winner !== 'draw' ? outcome : null

  function play(index: number) {
    if (board[index] || outcome) return
    const next = [...board]
    next[index] = turn
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

  function newRound() {
    // Only a finished round hands the first move over; a restart keeps it.
    if (outcome) setStarter(other(starter))
    setBoard(emptyBoard())
  }

  function resetMatch(nextMode = mode, nextDifficulty = difficulty) {
    setMode(nextMode)
    setDifficulty(nextDifficulty)
    setBoard(emptyBoard())
    setStarter('X')
    setScores(NO_SCORES)
  }

  const names: Record<Mark, string> = mode === 'ai' ? { X: 'You', O: 'Computer' } : { X: 'Player X', O: 'Player O' }

  let status: string
  if (win) status = mode === 'ai' ? (win.winner === HUMAN ? 'You win! 🎉' : 'Computer wins') : `${win.winner} wins! 🎉`
  else if (outcome) status = 'It’s a draw'
  else if (mode === 'ai') status = turn === HUMAN ? 'Your turn' : 'Computer is thinking…'
  else status = `${turn}’s turn`


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
        <ScoreCard mark="X" name={names.X} score={scores.X} active={!outcome && turn === 'X'} />
        <div className="flex flex-col items-center justify-center rounded-[32px] bg-black/25 py-5">
          <span className="text-[26px] font-medium text-white/50">Draws</span>
          <span className="font-display text-[64px] font-bold leading-none text-white/80">{scores.draws}</span>
        </div>
        <ScoreCard mark="O" name={names.O} score={scores.O} active={!outcome && turn === 'O'} />
      </div>

      <p
        aria-live="polite"
        className={`text-center font-display text-[52px] font-semibold leading-none ${
          win ? MARK_COLOR[win.winner] : 'text-white'
        }`}
      >
        {status}
      </p>

      <div className="relative mx-auto size-[600px] rounded-[48px] bg-black/30 p-5">
        <div className="grid size-full grid-cols-3 grid-rows-3 gap-4">
          {board.map((cell, index) => {
            const row = Math.floor(index / 3) + 1
            const column = (index % 3) + 1
            const dimmed = win && !win.line.includes(index)
            return (
              <button
                key={index}
                type="button"
                onClick={() => play(index)}
                disabled={Boolean(cell || outcome || computerTurn)}
                aria-label={`Row ${row}, column ${column}, ${cell ?? 'empty'}`}
                className="grid place-items-center rounded-[32px] bg-white/[0.06] transition enabled:active:scale-95 enabled:active:bg-white/10 enabled:hover:bg-white/10 focus-visible:outline-4 focus-visible:outline-accent disabled:cursor-default"
              >
                {cell && <MarkIcon mark={cell} className={`size-[120px] transition-opacity ${dimmed ? 'opacity-30' : ''}`} />}
              </button>
            )
          })}
        </div>
        {win && <WinLine line={win.line} mark={win.winner} />}
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

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size,
}: {
  label: string
  options: [T, string][]
  value: T
  onChange(value: T): void
  size: 'sm' | 'lg'
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2 rounded-full bg-black/30 p-2">
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => value !== id && onChange(id)}
          className={`flex-1 rounded-full font-semibold transition ${size === 'lg' ? 'h-[84px] text-[32px]' : 'h-[64px] text-[26px]'} ${
            value === id ? 'bg-white text-bg' : 'text-white/65 active:bg-white/10'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

function ScoreCard({ mark, name, score, active }: { mark: Mark; name: string; score: number; active: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-[32px] bg-black/25 py-5 ring-4 transition ${
        active ? MARK_RING[mark] : 'ring-transparent'
      }`}
    >
      <span className="flex items-center gap-2 text-[26px] font-medium text-white/70">
        <MarkIcon mark={mark} className="size-[30px]" />
        {name}
      </span>
      <span className={`font-display text-[64px] font-bold leading-none ${MARK_COLOR[mark]}`}>{score}</span>
    </div>
  )
}

function MarkIcon({ mark, className = '' }: { mark: Mark; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={14}
      strokeLinecap="round"
      className={`${MARK_COLOR[mark]} ${className}`}
      aria-hidden
    >
      {mark === 'X' ? (
        <>
          <path d="M24 24 76 76" pathLength={1} className="animate-draw" />
          <path d="M76 24 24 76" pathLength={1} className="animate-draw [animation-delay:0.15s]" />
        </>
      ) : (
        // Starts at the top and runs clockwise.
        <path d="M50 22a28 28 0 1 1 0 56a28 28 0 1 1 0-56" pathLength={1} className="animate-draw" />
      )}
    </svg>
  )
}

/** A stroke through the three winning cells, drawn in cell units over the grid. */
function WinLine({ line, mark }: { line: readonly number[]; mark: Mark }) {
  const center = (index: number) => [(index % 3) + 0.5, Math.floor(index / 3) + 0.5]
  const [x1, y1] = center(line[0])
  const [x2, y2] = center(line[2])
  // Run the stroke a little past the outer cell centres.
  const length = Math.hypot(x2 - x1, y2 - y1)
  const dx = ((x2 - x1) / length) * 0.3
  const dy = ((y2 - y1) / length) * 0.3

  return (
    <svg viewBox="0 0 3 3" className={`pointer-events-none absolute inset-5 ${MARK_COLOR[mark]}`} aria-hidden>
      <line
        x1={x1 - dx}
        y1={y1 - dy}
        x2={x2 + dx}
        y2={y2 + dy}
        stroke="currentColor"
        strokeWidth={0.1}
        strokeLinecap="round"
        pathLength={1}
        className="animate-draw drop-shadow-[0_0_12px_currentColor] [animation-delay:0.2s]"
      />
    </svg>
  )
}
