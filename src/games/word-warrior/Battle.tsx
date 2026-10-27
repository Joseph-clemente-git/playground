import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  canDrink,
  canSelect,
  drinkPotion,
  enemyTurn,
  playWord,
  previewDamage,
  scramble,
  startBattle,
  type BattleSetup,
  type BattleState,
  type Fx,
  type PotionKind,
} from './battle'
import type { Battle as BattleInfo } from './campaign'
import { MIN_LETTERS } from './damage'
import { hasAnyWord, type Dictionary } from './dictionary'
import { Hero } from './Hero'
import { isLocked, wordOf, type Gem, type Tile as TileData } from './tiles'

/** Long enough to see your hit land before the enemy answers. */
const ENEMY_DELAY_MS = 900
/** Time to watch the final blow before the result screen. */
const RESULT_DELAY_MS = 1300
const FREE_SCRAMBLE_DELAY_MS = 900

const POTIONS: { kind: PotionKind; icon: string; name: string; fill: string }[] = [
  { kind: 'health', icon: '❤️', name: 'Health potion', fill: 'bg-rose-500/25 ring-rose-400/50' },
  { kind: 'purity', icon: '💧', name: 'Purity potion', fill: 'bg-sky-500/25 ring-sky-400/50' },
  { kind: 'power', icon: '⚡', name: 'Power potion', fill: 'bg-amber-500/25 ring-amber-400/50' },
]

const GEM_STYLE: Record<Gem, string> = {
  amethyst: 'bg-violet-400 text-violet-950 shadow-[0_0_24px_rgba(167,139,250,0.7)]',
  emerald: 'bg-emerald-400 text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.7)]',
  sapphire: 'bg-sky-400 text-sky-950 shadow-[0_0_24px_rgba(56,189,248,0.7)]',
  ruby: 'bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.7)]',
  diamond: 'bg-cyan-50 text-cyan-900 shadow-[0_0_32px_rgba(165,243,252,0.9)]',
}

export interface BattleResult {
  won: boolean
  hp: number
  state: BattleState
}

export function Battle({
  info,
  setup,
  dictionary,
  onFinish,
  onMap,
}: {
  info: BattleInfo
  setup: BattleSetup
  dictionary: Dictionary
  onFinish(result: BattleResult): void
  onMap(): void
}) {
  const [state, setState] = useState(() => startBattle(setup, Math.random))
  const [selected, setSelected] = useState<number[]>([])
  /** Bumped whenever a side acts, to replay its lunge. */
  const [heroActed, setHeroActed] = useState(0)
  const [enemyActed, setEnemyActed] = useState(0)
  // Typing "qu" picks the Qu tile once, not a Qu and then a U.
  const lastKey = useRef('')

  const word = wordOf(selected.map((i) => state.grid[i]))
  const valid = word.length >= MIN_LETTERS && dictionary.has(word)
  const damage = selected.length > 0 ? previewDamage(state, selected) : 0
  const playerTurn = state.phase === 'player'

  function toggle(index: number) {
    if (!playerTurn || isLocked(state.grid[index])) return
    const at = selected.indexOf(index)
    setSelected(at >= 0 ? selected.slice(0, at) : [...selected, index])
  }

  function attack() {
    if (!playerTurn || !valid || !canSelect(state, selected)) return
    setState(playWord(state, selected, Math.random))
    setSelected([])
    setHeroActed((count) => count + 1)
  }

  function shuffle() {
    if (!playerTurn) return
    setState(scramble(state, Math.random))
    setSelected([])
  }

  function drink(kind: PotionKind) {
    setState(drinkPotion(state, kind))
  }

  const enemyMove = useEffectEvent(() => {
    setState(enemyTurn(state, Math.random))
    setEnemyActed((count) => count + 1)
  })
  const finish = useEffectEvent(() => onFinish({ won: state.phase === 'won', hp: state.hero.hp, state }))
  const freeScramble = useEffectEvent(() => {
    setState(scramble(state, Math.random, true))
    setSelected([])
  })

  useEffect(() => {
    if (state.phase === 'enemy') {
      const timer = setTimeout(enemyMove, ENEMY_DELAY_MS)
      return () => clearTimeout(timer)
    }
    if (state.phase === 'won' || state.phase === 'lost') {
      const timer = setTimeout(finish, RESULT_DELAY_MS)
      return () => clearTimeout(timer)
    }
    const letters = state.grid.filter((tile) => !isLocked(tile)).map((tile) => tile.letter)
    if (hasAnyWord(dictionary, letters)) return
    const timer = setTimeout(freeScramble, FREE_SCRAMBLE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state, dictionary])

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toLowerCase()
    if (key === 'enter') return attack()
    if (key === 'backspace') return setSelected(selected.slice(0, -1))
    if (key === 'escape') return setSelected([])
    if (!/^[a-z]$/.test(key) || !playerTurn) return
    const previous = lastKey.current
    lastKey.current = key
    if (key === 'u' && previous === 'q' && state.grid[selected.at(-1) ?? -1]?.letter === 'qu') return
    const letter = key === 'q' ? 'qu' : key
    const index = state.grid.findIndex((tile, i) => tile.letter === letter && !isLocked(tile) && !selected.includes(i))
    if (index >= 0) setSelected([...selected, index])
  })

  useEffect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { hero, enemy } = state
  const over = state.phase === 'won' || state.phase === 'lost'

  return (
    <div className="flex size-full flex-col justify-between rounded-[48px] bg-surface/80 px-8 py-7 ring-2 ring-white/5">
      <div className="flex h-[64px] items-center gap-4">
        <button
          type="button"
          onClick={onMap}
          className="flex h-[64px] items-center gap-2 rounded-full bg-white/10 px-6 text-[26px] font-semibold text-white/85 active:scale-[0.97]"
        >
          📖 Map
        </button>
        <p className="min-w-0 flex-1 truncate text-[24px] font-medium text-white/60">
          Ch. {info.chapterIndex + 1} · {info.isBoss ? 'Boss' : `Battle ${info.place + 1} of 5`}
        </p>
        <div
          className={`flex h-[64px] items-center gap-2 rounded-full px-5 text-[24px] font-semibold ring-2 ${
            state.bonus.found ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40' : 'bg-black/30 text-amber-200 ring-amber-300/30'
          }`}
        >
          <span className="text-white/55">Bonus</span>
          <span className={`tracking-wider uppercase ${state.bonus.found ? 'line-through' : ''}`}>{state.bonus.word}</span>
          {state.bonus.found && '✓'}
        </div>
      </div>

      <div className={`relative h-[350px] overflow-hidden rounded-[36px] bg-gradient-to-b ${info.chapter.scene} ring-2 ring-white/10`}>
        <div className="absolute inset-x-0 bottom-[64px] h-[70px] bg-black/25" aria-hidden />

        <div className="absolute left-6 top-5 w-[280px]">
          <HealthBar name="You" hp={hero.hp} max={hero.maxHp} color="bg-emerald-400" />
          <Statuses>
            {hero.poison && <Chip>☠️ Poisoned {hero.poison.turns}</Chip>}
            {hero.weak > 0 && <Chip>💤 Weak {hero.weak}</Chip>}
            {hero.powered && <Chip>⚡ Powered</Chip>}
          </Statuses>
        </div>
        <div className="absolute right-6 top-5 w-[280px]">
          <HealthBar name={enemy.def.name} hp={enemy.hp} max={enemy.maxHp} color="bg-rose-500" align="right" />
          <Statuses align="right">
            {enemy.shield > 0 && <Chip>🛡️ Shield {enemy.shield}</Chip>}
            {enemy.frozen && <Chip>❄️ Frozen</Chip>}
            {enemy.burn && <Chip>🔥 Burning {enemy.burn.turns}</Chip>}
            {enemy.charging && <Chip>💢 Charging</Chip>}
          </Statuses>
        </div>

        <div className="absolute bottom-[78px] left-[40px] size-[190px]">
          <Fighter hit={state.heroFx} lunge={heroActed} toward={1} defeated={state.phase === 'lost'}>
            <Hero className="size-full drop-shadow-[0_12px_12px_rgba(0,0,0,0.45)]" />
          </Fighter>
          <FloatingNumber fx={state.heroFx} />
        </div>
        <div className="absolute bottom-[78px] right-[40px] size-[190px]">
          <Fighter hit={state.enemyFx} lunge={enemyActed} toward={-1} defeated={state.phase === 'won'}>
            <span className="grid size-full place-items-center text-[150px] leading-none drop-shadow-[0_12px_12px_rgba(0,0,0,0.45)] [transform:scaleX(-1)]">
              {enemy.def.emoji}
            </span>
          </Fighter>
          <FloatingNumber fx={state.enemyFx} />
        </div>

        <p
          aria-live="polite"
          className="absolute inset-x-0 bottom-0 flex h-[64px] items-center justify-center bg-black/45 px-6 text-center text-[24px] font-medium leading-tight text-white/90"
        >
          {state.message}
        </p>
      </div>

      <div
        className={`flex h-[100px] items-center gap-3 rounded-[32px] bg-black/30 pl-4 pr-3 ring-4 transition ${
          valid ? 'ring-emerald-400/70' : word.length >= MIN_LETTERS ? 'ring-rose-400/40' : 'ring-transparent'
        }`}
      >
        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {selected.length === 0 ? (
            <span className="pl-3 text-[28px] text-white/40">{playerTurn ? 'Tap letters to spell a word' : over ? '' : 'Enemy’s turn…'}</span>
          ) : (
            selected.map((index, at) => (
              <button
                key={state.grid[index].id}
                type="button"
                onClick={() => setSelected(selected.slice(0, at))}
                aria-label={`Remove ${state.grid[index].letter.toUpperCase()} and after`}
                className={`grid h-[68px] min-w-[52px] shrink place-items-center rounded-[14px] px-1 font-display text-[38px] font-bold capitalize leading-none ${tileColor(state.grid[index])}`}
              >
                {state.grid[index].letter}
              </button>
            ))
          )}
        </div>
        {selected.length > 0 && (
          <>
            <span className={`shrink-0 font-display text-[34px] font-bold ${valid ? 'text-emerald-300' : 'text-white/40'}`}>
              ⚔️ {damage}
            </span>
            <button
              type="button"
              onClick={() => setSelected([])}
              aria-label="Clear word"
              className="grid size-[64px] shrink-0 place-items-center rounded-full bg-white/10 text-[30px] text-white/80 active:scale-95"
            >
              ✕
            </button>
          </>
        )}
      </div>

      <div className="mx-auto grid w-[508px] grid-cols-4 gap-3">
        {state.grid.map((tile, index) => (
          // The dark slot shows through while its tile is in the word.
          <div key={index} className="aspect-square rounded-[24px] bg-black/30 ring-2 ring-inset ring-white/10">
            <TileButton
              // A tile that fell remounts so its drop animation plays.
              key={state.fall[index] > 0 ? `${tile.id}:${state.tick}` : tile.id}
              tile={tile}
              fall={state.fall[index]}
              picked={selected.includes(index)}
              disabled={!playerTurn}
              onClick={() => toggle(index)}
            />
          </div>
        ))}
      </div>

      <div className="flex h-[100px] gap-3">
        {POTIONS.map(({ kind, icon, name, fill }) => (
          <button
            key={kind}
            type="button"
            onClick={() => drink(kind)}
            disabled={!canDrink(state, kind)}
            aria-label={`${name}, ${state.potions[kind]} left`}
            className={`relative grid w-[88px] shrink-0 place-items-center rounded-[28px] text-[44px] ring-2 transition active:scale-95 disabled:opacity-35 ${fill}`}
          >
            {icon}
            <span className="absolute -right-1 -top-1 grid size-[38px] place-items-center rounded-full bg-bg text-[22px] font-bold text-white ring-2 ring-white/20">
              {state.potions[kind]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={shuffle}
          disabled={!playerTurn}
          className="flex-1 rounded-full bg-white/10 text-[28px] font-semibold text-white/85 ring-1 ring-white/10 active:scale-[0.97] disabled:opacity-40"
        >
          Scramble
        </button>
        <button
          type="button"
          onClick={attack}
          disabled={!playerTurn || !valid}
          className="flex-[1.3] rounded-full bg-white text-[32px] font-bold text-bg transition active:scale-[0.97] disabled:bg-white/20 disabled:text-white/40"
        >
          ⚔️ Attack
        </button>
      </div>
    </div>
  )
}

function HealthBar({ name, hp, max, color, align = 'left' }: { name: string; hp: number; max: number; color: string; align?: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className={`flex items-baseline justify-between gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="truncate font-display text-[30px] font-semibold text-white">{name}</span>
        <span className="text-[24px] font-semibold tabular-nums text-white/75">
          {hp}/{max}
        </span>
      </div>
      <div className={`mt-1 flex h-[22px] overflow-hidden rounded-full bg-black/45 ring-2 ring-black/30 ${align === 'right' ? 'justify-end' : ''}`}>
        <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${(hp / max) * 100}%` }} />
      </div>
    </div>
  )
}

function Statuses({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return <div className={`mt-2 flex flex-wrap gap-2 ${align === 'right' ? 'justify-end' : ''}`}>{children}</div>
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="animate-pop-in rounded-full bg-black/45 px-3 py-1 text-[20px] font-semibold text-white/90">{children}</span>
}

/** Lunges when it acts, shakes when it's hit, and slumps when beaten. */
function Fighter({
  hit,
  lunge,
  toward,
  defeated,
  children,
}: {
  hit: Fx | null
  lunge: number
  toward: 1 | -1
  defeated: boolean
  children: ReactNode
}) {
  const shake = hit?.kind === 'damage' ? hit.key : 0
  return (
    <div className={`size-full ${defeated ? 'animate-defeat' : ''}`}>
      <div key={lunge} className={`size-full ${lunge > 0 ? 'animate-lunge' : ''}`} style={{ '--toward': toward } as CSSProperties}>
        <div key={shake} className={`size-full ${shake > 0 ? 'animate-shake' : ''}`}>
          <div className={`size-full ${defeated ? '' : 'animate-bob'}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}

function FloatingNumber({ fx }: { fx: Fx | null }) {
  if (!fx) return null
  return (
    <span
      key={fx.key}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-[-10px] animate-float-up text-center font-display text-[64px] font-bold [text-shadow:0_4px_0_rgba(0,0,0,0.5)] ${
        fx.kind === 'heal' ? 'text-emerald-300' : 'text-amber-200'
      }`}
    >
      {fx.kind === 'heal' ? '+' : '−'}
      {fx.amount}
    </span>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -right-2 -top-2 rounded-full bg-bg px-2 py-0.5 font-sans text-[20px] font-bold text-white ring-2 ring-white/25">
      {children}
    </span>
  )
}

function tileColor(tile: TileData) {
  const hazard = tile.hazard?.kind
  if (hazard === 'locked') return 'bg-slate-600 text-slate-900 shadow-[inset_0_0_0_6px_rgba(15,23,42,0.5)]'
  if (hazard === 'burning') return 'animate-flicker bg-orange-400 text-orange-950 shadow-[0_0_28px_rgba(251,146,60,0.7)]'
  if (hazard === 'smashed') return 'bg-[#bfae86] text-[#3b2a14]/45'
  if (tile.gem) return GEM_STYLE[tile.gem]
  return 'bg-[#f3e6c4] text-[#3b2a14]'
}

function TileButton({
  tile,
  fall,
  picked,
  disabled,
  onClick,
}: {
  tile: TileData
  fall: number
  picked: boolean
  disabled: boolean
  onClick(): void
}) {
  const hazard = tile.hazard
  const label = [
    tile.letter.toUpperCase(),
    tile.gem && `${tile.gem} gem`,
    hazard?.kind === 'locked' && 'locked',
    hazard?.kind === 'smashed' && 'smashed',
    hazard?.kind === 'burning' && 'burning',
  ]
    .filter(Boolean)
    .join(', ')
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hazard?.kind === 'locked'}
      aria-label={label}
      aria-pressed={picked}
      className={`relative grid size-full place-items-center rounded-[24px] font-display text-[68px] font-bold capitalize leading-none shadow-[inset_0_-8px_0_rgba(0,0,0,0.22)] transition-[transform,opacity] duration-150 active:scale-95 ${tileColor(tile)} ${
        picked ? 'scale-75 opacity-0' : ''
      } ${fall > 0 ? 'animate-drop' : ''}`}
      style={{ '--fall': fall } as CSSProperties}
    >
      {tile.letter}
      {tile.gem && !hazard && <span className="absolute right-3 top-2 text-[22px] opacity-70">◆</span>}
      {hazard?.kind === 'locked' && (
        <Badge>🔒{hazard.turns}</Badge>
      )}
      {hazard?.kind === 'burning' && (
        <Badge>🔥{hazard.turns}</Badge>
      )}
      {hazard?.kind === 'smashed' && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <path d="M18 22 L44 46 L36 58 L64 80 M44 46 L70 34 L84 18" stroke="#3b2a14" strokeOpacity="0.55" strokeWidth="4" fill="none" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
