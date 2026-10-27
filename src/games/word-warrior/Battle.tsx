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
import { EnemySprite } from './Enemies'
import { Hero } from './Hero'
import { SceneBackdrop } from './Scene'
import { isLocked, wordOf, type Gem, type Tile as TileData } from './tiles'
import { GOLD, GroundShadow, OUTLINED, Ribbon, Sparkle, WOOD } from './ui'

/** Long enough to see your hit land before the enemy answers. */
const ENEMY_DELAY_MS = 900
/** Time to watch the final blow before the result screen. */
const RESULT_DELAY_MS = 1300
const FREE_SCRAMBLE_DELAY_MS = 900
/** Empty sockets shown in the word bar, so it reads as slots to fill. */
const WORD_SOCKETS = 7

const POTIONS: { kind: PotionKind; icon: string; name: string }[] = [
  { kind: 'health', icon: '❤️', name: 'Health potion' },
  { kind: 'purity', icon: '💧', name: 'Purity potion' },
  { kind: 'power', icon: '⚡', name: 'Power potion' },
]

const GEM_FILL: Record<Gem, string> = {
  amethyst: 'bg-[#b48cf2]',
  emerald: 'bg-[#5cc98a]',
  sapphire: 'bg-[#5aa9e6]',
  ruby: 'bg-[#e8556a]',
  diamond: 'bg-[#dff7ff]',
}

const GEM_GLOW: Record<Gem, string> = {
  amethyst: 'shadow-[0_0_26px_rgba(180,140,242,0.9)]',
  emerald: 'shadow-[0_0_26px_rgba(92,201,138,0.9)]',
  sapphire: 'shadow-[0_0_26px_rgba(90,169,230,0.9)]',
  ruby: 'shadow-[0_0_26px_rgba(232,85,106,0.9)]',
  diamond: 'shadow-[0_0_32px_rgba(200,245,255,1)]',
}

export interface BattleResult {
  won: boolean
  hp: number
  state: BattleState
}

/**
 * Drawn on the 720×1280 stage: a painted scene with the "VS" header on top,
 * and a parchment panel holding the word, the letter grid and the actions below.
 */
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

  return (
    <div className="relative size-full overflow-hidden rounded-[44px] border-[6px] border-ww-ink bg-ww-parchment">
      {/* The painted battle scene */}
      <div className="absolute inset-x-0 top-0 h-[580px] overflow-hidden">
        <SceneBackdrop scene={info.chapter.scene} className="absolute inset-0 size-full" />

        <div className="absolute left-[34px] top-[196px] size-[304px]">
          <GroundShadow className="absolute bottom-[-2px] left-[22%] h-[34px] w-[58%]" />
          <Fighter hit={state.heroFx} lunge={heroActed} toward={1} defeated={state.phase === 'lost'}>
            <Hero className="size-full" />
          </Fighter>
          <FloatingNumber fx={state.heroFx} />
        </div>
        <div className={`absolute ${info.isBoss ? 'right-[24px] top-[210px] size-[300px]' : 'right-[40px] top-[234px] size-[270px]'}`}>
          <GroundShadow className="absolute bottom-[-6px] left-[14%] h-[34px] w-[72%]" />
          <Fighter hit={state.enemyFx} lunge={enemyActed} toward={-1} defeated={state.phase === 'won'}>
            <EnemySprite enemy={enemy.def} className="size-full" />
          </Fighter>
          <FloatingNumber fx={state.enemyFx} />
        </div>

        <header>
          <div className="absolute left-4 top-3 w-[250px]">
            <p className={`${OUTLINED} truncate pl-2 text-[34px] leading-tight`}>You</p>
            <HealthBar hp={hero.hp} max={hero.maxHp} fill="bg-[#86cf4f]" />
            <Statuses>
              {hero.poison && <StatusIcon icon="☠️" count={hero.poison.turns} tint="bg-[#8d6bb5]" label="Poisoned" />}
              {hero.weak > 0 && <StatusIcon icon="💤" count={hero.weak} tint="bg-[#7d8aa0]" label="Weakened" />}
              {hero.powered && <StatusIcon icon="⚡" tint="bg-[#e7a93b]" label="Powered up" />}
            </Statuses>
          </div>

          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-3">
            <Portrait>
              <Hero portrait className="size-full" />
            </Portrait>
            <Portrait>
              <EnemySprite enemy={enemy.def} portrait className="size-full" />
            </Portrait>
            <span
              className={`${OUTLINED} pointer-events-none absolute left-1/2 top-[44px] -translate-x-1/2 -rotate-6 text-[60px] leading-none text-ww-gold`}
              aria-hidden
            >
              VS
            </span>
          </div>

          <div className="absolute right-4 top-3 w-[250px]">
            <p className={`${OUTLINED} truncate pr-2 text-right text-[34px] leading-tight`}>{enemy.def.name}</p>
            <HealthBar hp={enemy.hp} max={enemy.maxHp} fill="bg-[#ef6b6b]" />
            <Statuses align="right">
              {enemy.shield > 0 && <StatusIcon icon="🛡️" count={enemy.shield} tint="bg-[#6aa86a]" label="Shielded" />}
              {enemy.frozen && <StatusIcon icon="❄️" tint="bg-[#5aa9e6]" label="Frozen" />}
              {enemy.burn && <StatusIcon icon="🔥" count={enemy.burn.turns} tint="bg-[#e8743a]" label="Burning" />}
              {enemy.charging && <StatusIcon icon="💢" tint="bg-[#d94c4c]" label="Charging a big hit" />}
            </Statuses>
          </div>
        </header>

        <button
          type="button"
          onClick={onMap}
          aria-label="Back to the map"
          className={`${WOOD} absolute left-4 top-[178px] grid size-[72px] place-items-center rounded-[22px] text-[34px]`}
        >
          📖
        </button>
        <div className="absolute right-4 top-[178px] flex flex-col items-end gap-2">
          <div
            className={`flex h-[60px] items-center gap-2 rounded-[20px] border-[5px] border-ww-ink px-4 text-[24px] font-bold ${
              state.bonus.found ? 'bg-[#bfe6a6] text-[#245a1d]' : 'bg-ww-parchment text-ww-brown'
            }`}
          >
            <span className="font-semibold opacity-70">Bonus</span>
            <span className={`tracking-wider uppercase ${state.bonus.found ? 'line-through' : ''}`}>{state.bonus.word}</span>
            {state.bonus.found && '✓'}
          </div>
          <span className={`${OUTLINED} pr-1 text-[24px]`}>
            Chapter {info.chapterIndex + 1} · {info.isBoss ? 'Boss' : `Battle ${info.place + 1}/5`}
          </span>
        </div>
      </div>

      {/* The parchment panel */}
      <div className="absolute inset-x-0 bottom-0 top-[548px] flex flex-col gap-3 rounded-t-[40px] border-t-[6px] border-ww-ink bg-ww-parchment px-6 pb-4 pt-[44px] shadow-[0_-8px_0_rgba(59,36,20,0.2)]">
        <Ribbon className="absolute left-1/2 top-[-36px] h-[72px] w-[540px] -translate-x-1/2">
          <p aria-live="polite" className="line-clamp-2 font-display text-[24px] font-semibold leading-tight text-ww-brown">
            {state.message}
          </p>
        </Ribbon>

        <div
          className={`flex h-[92px] shrink-0 items-center gap-3 rounded-[30px] border-[5px] bg-ww-parchment-dark px-3 transition ${
            valid ? 'border-[#4f9a3a] shadow-[0_0_20px_rgba(110,190,80,0.6)]' : word.length >= MIN_LETTERS ? 'border-[#c0504d]/70' : 'border-ww-ink/15'
          }`}
        >
          <div
            className={`relative grid size-[66px] shrink-0 place-items-center rounded-[18px] border-[5px] border-ww-ink text-[32px] ${
              valid ? 'bg-gradient-to-br from-[#f7a65a] to-[#d9532f]' : 'bg-[#c9b48c]'
            }`}
            aria-label={selected.length > 0 ? `${damage} damage` : undefined}
          >
            <span className={valid ? '' : 'opacity-50 grayscale'}>⚔️</span>
            {selected.length > 0 && <span className={`${OUTLINED} absolute -bottom-3 -right-3 text-[30px] leading-none`}>{damage}</span>}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-[6px]">
            {selected.map((index, at) => (
              <button
                key={state.grid[index].id}
                type="button"
                onClick={() => setSelected(selected.slice(0, at))}
                aria-label={`Remove ${state.grid[index].letter.toUpperCase()} and after`}
                className={`${OUTLINED} grid aspect-square min-w-0 shrink basis-[56px] place-items-center rounded-full border-4 border-ww-ink text-[26px] capitalize leading-none ${letterFill(state.grid[index])}`}
              >
                {state.grid[index].letter}
              </button>
            ))}
            {Array.from({ length: Math.max(0, WORD_SOCKETS - selected.length) }, (_, i) => (
              <span key={i} className="grid aspect-square min-w-0 shrink basis-[56px] place-items-center rounded-full bg-ww-parchment text-ww-parchment-dark" aria-hidden>
                <Sparkle className="size-[24px]" />
              </span>
            ))}
          </div>

          {selected.length > 0 && (
            <button type="button" onClick={() => setSelected([])} aria-label="Clear word" className={`${WOOD} grid size-[58px] shrink-0 place-items-center rounded-full text-[24px]`}>
              ✕
            </button>
          )}
        </div>

        <div className="mx-auto grid w-[446px] shrink-0 grid-cols-4 gap-[10px]">
          {state.grid.map((tile, index) => (
            // The socket shows through while its tile is in the word.
            <div key={index} className="relative grid aspect-square place-items-center rounded-[26px] bg-ww-parchment-dark text-[#d2bd92] shadow-[inset_0_5px_0_rgba(59,36,20,0.14)]">
              <Sparkle className="absolute size-[30px]" />
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

        <div className="mt-auto flex h-[92px] shrink-0 gap-3">
          {POTIONS.map(({ kind, icon, name }) => (
            <button
              key={kind}
              type="button"
              onClick={() => drink(kind)}
              disabled={!canDrink(state, kind)}
              aria-label={`${name}, ${state.potions[kind]} left`}
              className={`${WOOD} relative grid w-[86px] shrink-0 place-items-center rounded-full text-[38px]`}
            >
              {icon}
              <span className="absolute -right-2 -top-2 grid size-[36px] place-items-center rounded-full border-4 border-ww-ink bg-ww-cream text-[20px] font-bold text-ww-ink">
                {state.potions[kind]}
              </span>
            </button>
          ))}
          <button type="button" onClick={shuffle} disabled={!playerTurn} className={`${WOOD} flex-1 rounded-full`}>
            <span className={`${OUTLINED} text-[28px]`}>Scramble</span>
          </button>
          <button type="button" onClick={attack} disabled={!playerTurn || !valid} className={`${GOLD} flex-[1.25] rounded-full font-display text-[34px] font-bold`}>
            {state.phase === 'enemy' ? 'Wait…' : 'Attack!'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HealthBar({ hp, max, fill }: { hp: number; max: number; fill: string }) {
  return (
    <div className="relative mt-1 h-[42px] overflow-hidden rounded-full border-[5px] border-ww-ink bg-[#4a3526]">
      <div className={`h-full rounded-full transition-[width] duration-500 ${fill}`} style={{ width: `${(hp / max) * 100}%` }}>
        <div className="mx-3 mt-[4px] h-[7px] rounded-full bg-white/40" />
      </div>
      <span className={`${OUTLINED} absolute inset-0 grid place-items-center text-[24px] leading-none tabular-nums`}>
        {hp}/{max}
      </span>
    </div>
  )
}

function Portrait({ children }: { children: ReactNode }) {
  return (
    <div className="size-[92px] overflow-hidden rounded-[24px] border-[5px] border-ww-ink bg-gradient-to-b from-[#fde7a8] to-[#f2c66a] shadow-[inset_0_-6px_0_rgba(140,80,0,0.25),0_5px_0_rgba(59,36,20,0.35)]">
      {children}
    </div>
  )
}

function Statuses({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return <div className={`mt-2 flex gap-2 ${align === 'right' ? 'justify-end' : ''}`}>{children}</div>
}

function StatusIcon({ icon, count, tint, label }: { icon: string; count?: number; tint: string; label: string }) {
  return (
    <span
      title={label}
      aria-label={count ? `${label}, ${count} turns` : label}
      className={`relative grid size-[50px] animate-pop-in place-items-center rounded-[14px] border-4 border-ww-ink text-[26px] shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)] ${tint}`}
    >
      {icon}
      {count !== undefined && <span className={`${OUTLINED} absolute -bottom-2 -right-2 text-[22px] leading-none`}>{count}</span>}
    </span>
  )
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
      className={`text-outline pointer-events-none absolute inset-x-0 top-[-30px] animate-float-up text-center font-display text-[80px] font-bold ${
        fx.kind === 'heal' ? 'text-[#b9f29a] [--outline-color:#1f5a1f]' : 'text-[#ffa2a2] [--outline-color:#6b1d1d]'
      }`}
    >
      {fx.kind === 'heal' ? '+' : '−'}
      {fx.amount}
    </span>
  )
}

/** Fill for a tile, shared by the grid and the word bar. */
function tileFill(tile: TileData) {
  const hazard = tile.hazard?.kind
  if (hazard === 'locked') return 'bg-[#8f8b85]'
  if (hazard === 'burning') return 'bg-[#f08a3c]'
  if (hazard === 'smashed') return 'bg-[#b89a7a]'
  if (tile.gem) return GEM_FILL[tile.gem]
  return 'bg-ww-wood'
}

/** A Diamond is pale, so its letter flips to ink on a white outline. */
function letterFill(tile: TileData) {
  return `${tileFill(tile)} ${tile.gem === 'diamond' ? 'text-ww-ink [--outline-color:#fff]' : 'text-ww-cream'}`
}

function tileColor(tile: TileData) {
  const hazard = tile.hazard?.kind
  if (hazard === 'locked') return `${tileFill(tile)} text-[#cfcac2]`
  if (hazard === 'burning') return `${tileFill(tile)} animate-flicker text-ww-cream shadow-[0_0_28px_rgba(255,140,60,0.85)]`
  if (hazard === 'smashed') return `${tileFill(tile)} text-ww-cream/70`
  if (tile.gem) return `${letterFill(tile)} ${GEM_GLOW[tile.gem]}`
  return `${tileFill(tile)} text-ww-cream`
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -right-3 -top-3 rounded-full border-4 border-ww-ink bg-ww-cream px-2 font-sans text-[20px] font-bold leading-[28px] text-ww-ink [-webkit-text-stroke:0]">
      {children}
    </span>
  )
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
      className={`text-outline relative grid size-full place-items-center rounded-[26px] border-[5px] border-ww-ink font-display text-[58px] font-bold capitalize leading-none shadow-[inset_0_-8px_0_rgba(0,0,0,0.25),inset_0_5px_0_rgba(255,255,255,0.22)] transition-[transform,opacity] duration-150 active:scale-95 ${tileColor(tile)} ${
        picked ? 'scale-75 opacity-0' : ''
      } ${fall > 0 ? 'animate-drop' : ''}`}
      style={{ '--fall': fall } as CSSProperties}
    >
      {tile.letter}
      {tile.gem && !hazard && <span className="absolute right-2 top-1 text-[22px] text-white [-webkit-text-stroke:0]">◆</span>}
      {hazard?.kind === 'locked' && (
        <>
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            <path d="M8 30 L92 70 M8 70 L92 30" stroke="#5d5a55" strokeWidth="9" strokeDasharray="14 6" />
          </svg>
          <Badge>🔒{hazard.turns}</Badge>
        </>
      )}
      {hazard?.kind === 'burning' && <Badge>🔥{hazard.turns}</Badge>}
      {hazard?.kind === 'smashed' && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
          <path d="M18 22 L44 46 L36 58 L64 80 M44 46 L70 34 L84 18" stroke="#3b2414" strokeWidth="5" fill="none" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
