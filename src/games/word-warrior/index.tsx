import { useEffect, useState, type ReactNode } from 'react'
import type { GameProps } from '../../core/types'
import { Battle, type BattleResult } from './Battle'
import type { BattleSetup } from './battle'
import {
  afterLoss,
  afterWin,
  BATTLES_PER_CHAPTER,
  battleAt,
  CHAPTERS,
  isFinished,
  maxHp,
  newProgress,
  parseProgress,
  perks,
  startingHp,
  TOTAL_BATTLES,
  TREASURES,
  treasuresOwned,
  type Progress,
} from './campaign'
import { loadDictionary, type Dictionary } from './dictionary'
import { Hero } from './Hero'

const STORAGE_KEY = 'game-hub:word-warrior'

const POTION_ICONS = { health: '❤️', purity: '💧', power: '⚡' } as const
const POTION_NAMES = { health: 'Health', purity: 'Purity', power: 'Power' } as const

type Screen =
  | { name: 'map' }
  | { name: 'battle'; index: number; setup: BattleSetup }
  | { name: 'result'; index: number; result: BattleResult; before: Progress }

function loadProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY))
  } catch {
    return newProgress()
  }
}

/** Drawn inside the 720×1280 portrait stage, so sizes are logical pixels. */
export default function WordWarrior({ onScore, onGameOver }: GameProps) {
  const [progress, setProgress] = useState(loadProgress)
  const [screen, setScreen] = useState<Screen>({ name: 'map' })
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (dictionary || loadFailed) return
    let cancelled = false
    loadDictionary().then(
      (loaded) => !cancelled && setDictionary(loaded),
      () => !cancelled && setLoadFailed(true),
    )
    return () => {
      cancelled = true
    }
  }, [dictionary, loadFailed])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Storage full or blocked; progress just won't survive a reload.
    }
  }, [progress])

  function fight(index: number) {
    const info = battleAt(index)
    const setup: BattleSetup = {
      enemy: info.enemy,
      hp: startingHp(progress, index),
      maxHp: maxHp(progress.cleared),
      potions: progress.potions,
      bonus: info.bonus,
      perks: perks(progress.cleared),
    }
    setScreen({ name: 'battle', index, setup })
  }

  function finish(index: number, result: BattleResult) {
    const before = progress
    const next = result.won ? afterWin(progress, index, result.hp, result.state.potions) : afterLoss(progress)
    setProgress(next)
    setScreen({ name: 'result', index, result, before })
    if (!result.won) return onGameOver({ won: false, score: next.cleared })
    onScore(next.cleared)
    if (next.cleared === TOTAL_BATTLES && before.cleared < TOTAL_BATTLES) onGameOver({ won: true, score: next.cleared })
  }

  if (!dictionary) {
    return (
      <Panel>
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <Hero className="size-[260px] animate-bob" />
          {loadFailed ? (
            <>
              <p className="text-[34px] text-white/80">Couldn’t open the dictionary.</p>
              <button
                type="button"
                onClick={() => setLoadFailed(false)}
                className="h-[104px] rounded-full bg-white px-14 text-[34px] font-semibold text-bg active:scale-[0.97]"
              >
                Try again
              </button>
            </>
          ) : (
            <p className="animate-pulse font-display text-[40px] font-semibold text-white/80">Opening the book…</p>
          )}
        </div>
      </Panel>
    )
  }

  if (screen.name === 'battle') {
    return (
      <Battle
        info={battleAt(screen.index)}
        setup={screen.setup}
        dictionary={dictionary}
        onFinish={(result) => finish(screen.index, result)}
        onMap={() => setScreen({ name: 'map' })}
      />
    )
  }

  if (screen.name === 'result') {
    return (
      <Result
        index={screen.index}
        result={screen.result}
        before={screen.before}
        after={progress}
        onMap={() => setScreen({ name: 'map' })}
        onNext={fight}
      />
    )
  }

  return <BookMap progress={progress} onFight={fight} onReset={() => setProgress(newProgress())} />
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="flex size-full flex-col rounded-[48px] bg-surface/80 px-10 py-10 ring-2 ring-white/5">{children}</div>
}

function BookMap({ progress, onFight, onReset }: { progress: Progress; onFight(index: number): void; onReset(): void }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const finished = isFinished(progress)
  const owned = treasuresOwned(progress.cleared)
  const next = finished ? null : battleAt(progress.cleared)

  return (
    <Panel>
      <div className="flex items-center gap-6">
        <Hero className="size-[150px] shrink-0" />
        <div>
          <h2 className="font-display text-[64px] font-bold leading-none text-white">Word Warrior</h2>
          <p className="mt-2 text-[28px] text-white/60">Spell words to fight your way through the book.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {CHAPTERS.map((chapter, chapterIndex) => {
          const first = chapterIndex * BATTLES_PER_CHAPTER
          const open = progress.cleared >= first
          return (
            <section key={chapter.title} className={`rounded-[36px] bg-gradient-to-br ${chapter.scene} p-6 ring-2 ring-white/10 ${open ? '' : 'opacity-50'}`}>
              <h3 className="font-display text-[34px] font-semibold text-white">
                <span className="text-white/50">Chapter {chapterIndex + 1}</span> · {chapter.title}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                {chapter.enemies.map((enemy, place) => {
                  const index = first + place
                  const cleared = index < progress.cleared
                  const current = index === progress.cleared
                  const boss = place === BATTLES_PER_CHAPTER - 1
                  return (
                    <button
                      key={enemy.name}
                      type="button"
                      disabled={!cleared && !current}
                      onClick={() => onFight(index)}
                      aria-label={cleared ? `Replay ${enemy.name}` : current ? `Fight ${enemy.name}` : 'Locked battle'}
                      className={`relative grid place-items-center rounded-full bg-black/35 ring-4 transition active:scale-95 ${
                        boss ? 'size-[124px] text-[72px]' : 'size-[100px] text-[56px]'
                      } ${current ? 'animate-pulse ring-amber-300' : cleared ? 'ring-emerald-400/70' : 'ring-white/10'}`}
                    >
                      {cleared || current ? enemy.emoji : <span className="text-[40px] text-white/40">?</span>}
                      {cleared && (
                        <span className="absolute -right-1 -top-1 grid size-[40px] place-items-center rounded-full bg-emerald-400 text-[24px] font-bold text-emerald-950">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-[32px] bg-black/25 px-6 py-4">
        <div className="flex gap-5 text-[30px] font-semibold text-white/85">
          {(['health', 'purity', 'power'] as const).map((kind) => (
            <span key={kind} aria-label={`${progress.potions[kind]} ${POTION_NAMES[kind]} potions`}>
              {POTION_ICONS[kind]} {progress.potions[kind]}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-[40px]">
          {TREASURES.map((treasure) => (
            <span key={treasure.id} title={`${treasure.name}: ${treasure.description}`} className={owned.includes(treasure.id) ? '' : 'opacity-20 grayscale'}>
              {treasure.icon}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        {next ? (
          <button
            type="button"
            onClick={() => onFight(next.index)}
            className="h-[112px] rounded-full bg-white text-[36px] font-bold text-bg shadow-[0_0_48px_rgba(167,139,250,0.45)] active:scale-[0.97]"
          >
            {progress.cleared === 0 ? 'Begin the adventure' : `Fight the ${next.enemy.name}`}
          </button>
        ) : (
          <p className="text-center font-display text-[36px] font-semibold text-amber-200">🏆 The book is finished! Replay any battle.</p>
        )}
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true)
            onReset()
            setConfirmReset(false)
          }}
          onBlur={() => setConfirmReset(false)}
          className="h-[72px] text-[26px] font-medium text-white/50 active:text-white/80"
        >
          {confirmReset ? 'Tap again to erase your progress' : 'Start a new book'}
        </button>
      </div>
    </Panel>
  )
}

function Result({
  index,
  result,
  before,
  after,
  onMap,
  onNext,
}: {
  index: number
  result: BattleResult
  before: Progress
  after: Progress
  onMap(): void
  onNext(index: number): void
}) {
  const info = battleAt(index)
  const { state } = result
  const newTreasure = after.cleared > before.cleared && info.isBoss ? TREASURES[info.chapterIndex] : null
  const finishedNow = after.cleared === TOTAL_BATTLES && before.cleared < TOTAL_BATTLES
  const canGoOn = result.won && !isFinished(after)

  return (
    <Panel>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <span className={`text-[180px] leading-none ${result.won ? 'opacity-40 grayscale' : 'animate-bob'}`}>{info.enemy.emoji}</span>
        <h2 className={`font-display text-[84px] font-bold leading-none ${result.won ? 'text-amber-200' : 'text-rose-300'}`}>
          {finishedNow ? 'The End!' : result.won ? 'Victory!' : 'Defeated…'}
        </h2>
        <p className="max-w-[560px] text-[32px] text-white/70">
          {finishedNow
            ? 'The Dragon is beaten and the book is finished. Well spelled, Word Warrior!'
            : result.won
              ? `You beat the ${info.enemy.name}.`
              : `The ${info.enemy.name} got the better of you. Try again at full health.`}
        </p>

        {result.won && (
          <div className="flex w-full flex-col gap-4">
            {state.bonus.found && (
              <Reward icon={POTION_ICONS[state.bonus.reward]} title={`Bonus word: ${state.bonus.word.toUpperCase()}`} detail={`+1 ${POTION_NAMES[state.bonus.reward]} potion`} />
            )}
            {newTreasure && <Reward icon={newTreasure.icon} title={newTreasure.name} detail={newTreasure.description} highlight />}
            {canGoOn && after.cleared > before.cleared && (
              <Reward
                icon="❤️"
                title={after.cleared % BATTLES_PER_CHAPTER === 0 ? 'A new chapter begins' : 'You catch your breath'}
                detail={`Health ${startingHp(after, after.cleared)}/${maxHp(after.cleared)}`}
              />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <button
          type="button"
          onClick={onMap}
          className="h-[104px] rounded-full bg-white/10 text-[34px] font-semibold text-white/85 ring-1 ring-white/10 active:scale-[0.97]"
        >
          📖 Map
        </button>
        {result.won ? (
          <button
            type="button"
            onClick={() => (canGoOn ? onNext(after.cleared) : onMap())}
            className="h-[104px] animate-pop-in rounded-full bg-white text-[34px] font-semibold text-bg shadow-[0_0_48px_rgba(167,139,250,0.55)] active:scale-[0.97]"
          >
            {canGoOn ? 'Next battle' : 'Done'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNext(index)}
            className="h-[104px] animate-pop-in rounded-full bg-white text-[34px] font-semibold text-bg shadow-[0_0_48px_rgba(167,139,250,0.55)] active:scale-[0.97]"
          >
            Try again
          </button>
        )}
      </div>
    </Panel>
  )
}

function Reward({ icon, title, detail, highlight = false }: { icon: string; title: string; detail: string; highlight?: boolean }) {
  return (
    <div className={`flex animate-pop-in items-center gap-5 rounded-[28px] px-6 py-4 text-left ${highlight ? 'bg-amber-400/15 ring-2 ring-amber-300/60' : 'bg-black/25'}`}>
      <span className="text-[56px]">{icon}</span>
      <div>
        <p className="text-[30px] font-semibold text-white">{title}</p>
        <p className="text-[24px] text-white/60">{detail}</p>
      </div>
    </div>
  )
}
