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
import { EnemySprite } from './Enemies'
import { Hero } from './Hero'
import { SceneBackdrop } from './Scene'
import { GOLD, GroundShadow, OUTLINED, Ribbon, WOOD } from './ui'

const STORAGE_KEY = 'game-hub:word-warrior'

const POTION_ICONS = { health: '❤️', purity: '💧', power: '⚡' } as const
const POTION_NAMES = { health: 'Health', purity: 'Purity', power: 'Power' } as const

const TIPS = [
  'Long words hit much harder than short ones, and leave gems behind.',
  'Rare letters like J, K, X, Z and Qu are worth more damage.',
  'Spell a gem tile to use it: Emeralds heal you and Sapphires freeze the enemy.',
  'Drinking a potion doesn’t cost your turn.',
  'Use burning tiles before they burn out, or they’ll scorch you.',
  'When the enemy is charging up, a Sapphire stops the blow.',
]

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
      <Parchment>
        <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
          <Hero className="size-[280px] animate-bob" />
          {loadFailed ? (
            <>
              <p className="font-display text-[36px] font-semibold text-ww-brown">Couldn’t open the dictionary.</p>
              <button type="button" onClick={() => setLoadFailed(false)} className={`${GOLD} h-[104px] rounded-full px-14 font-display text-[36px] font-bold`}>
                Try again
              </button>
            </>
          ) : (
            <p className={`${OUTLINED} animate-pulse text-[48px]`}>Opening the book…</p>
          )}
        </div>
      </Parchment>
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

/** The cream page every non-battle screen sits on. */
function Parchment({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-full flex-col overflow-hidden rounded-[44px] border-[6px] border-ww-ink bg-ww-parchment px-9 py-9 shadow-[inset_0_0_0_10px_rgba(230,212,172,0.7)]">
      {children}
    </div>
  )
}

function BookMap({ progress, onFight, onReset }: { progress: Progress; onFight(index: number): void; onReset(): void }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const finished = isFinished(progress)
  const owned = treasuresOwned(progress.cleared)
  const next = finished ? null : battleAt(progress.cleared)

  return (
    <Parchment>
      <div className="flex items-center gap-5">
        <Hero className="size-[150px] shrink-0 animate-bob" />
        <div>
          <h2 className={`${OUTLINED} text-[70px] leading-none text-ww-gold`}>Word Warrior</h2>
          <p className="mt-3 font-display text-[28px] font-medium leading-snug text-ww-brown">Spell words to fight your way through the book!</p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-5">
        {CHAPTERS.map((chapter, chapterIndex) => {
          const first = chapterIndex * BATTLES_PER_CHAPTER
          const open = progress.cleared >= first
          return (
            <section key={chapter.title} className="relative h-[214px] overflow-hidden rounded-[32px] border-[5px] border-ww-ink shadow-[0_6px_0_rgba(59,36,20,0.3)]">
              <SceneBackdrop scene={chapter.scene} className={`absolute inset-0 size-full ${open ? '' : 'grayscale-[0.7]'}`} />
              <div className="absolute inset-0 bg-gradient-to-b from-ww-ink/45 via-transparent to-ww-ink/50" />
              <h3 className={`${OUTLINED} absolute left-5 top-3 text-[32px]`}>
                <span className="text-ww-gold">{chapterIndex + 1}.</span> {chapter.title}
              </h3>
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
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
                      className={`relative grid place-items-center rounded-full ${current ? GOLD : WOOD} ${
                        boss ? 'size-[120px] text-[66px]' : 'size-[98px] text-[52px]'
                      } ${current ? 'animate-pulse' : ''} disabled:bg-[#5b4636] disabled:opacity-100`}
                    >
                      {cleared || current ? (
                        <EnemySprite enemy={enemy} portrait className="size-[86%] overflow-hidden rounded-full" />
                      ) : (
                        <span className={`${OUTLINED} text-[44px] text-[#bba78a]`}>?</span>
                      )}
                      {cleared && (
                        <span className="absolute -right-2 -top-2 grid size-[42px] place-items-center rounded-full border-4 border-ww-ink bg-[#86cf4f] text-[24px] font-bold text-ww-ink">
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

      <div className="mt-6 flex items-center justify-between gap-4 rounded-[28px] border-[5px] border-ww-ink/15 bg-ww-parchment-dark px-6 py-3">
        <div className="flex gap-5 font-display text-[32px] font-bold text-ww-brown">
          {(['health', 'purity', 'power'] as const).map((kind) => (
            <span key={kind} aria-label={`${progress.potions[kind]} ${POTION_NAMES[kind]} potions`}>
              {POTION_ICONS[kind]} {progress.potions[kind]}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-[42px]">
          {TREASURES.map((treasure) => (
            <span key={treasure.id} title={`${treasure.name}: ${treasure.description}`} className={owned.includes(treasure.id) ? '' : 'opacity-25 grayscale'}>
              {treasure.icon}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {next ? (
          <button type="button" onClick={() => onFight(next.index)} className={`${GOLD} h-[112px] rounded-full font-display text-[38px] font-bold`}>
            {progress.cleared === 0 ? 'Begin the adventure!' : `Fight the ${next.enemy.name}!`}
          </button>
        ) : (
          <p className={`${OUTLINED} text-center text-[38px] text-ww-gold`}>🏆 The book is finished! Replay any battle.</p>
        )}
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true)
            onReset()
            setConfirmReset(false)
          }}
          onBlur={() => setConfirmReset(false)}
          className="h-[64px] font-display text-[26px] font-semibold text-ww-brown/70 active:text-ww-brown"
        >
          {confirmReset ? 'Tap again to erase your progress' : 'Start a new book'}
        </button>
      </div>
    </Parchment>
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
    <div className="relative size-full overflow-hidden rounded-[44px] border-[6px] border-ww-ink bg-ww-parchment">
      <div className="absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        <SceneBackdrop scene={info.chapter.scene} className="absolute inset-0 size-full" />
        <div className="absolute left-[70px] top-[190px] size-[250px]">
          <GroundShadow className="absolute bottom-[-4px] left-[30px] h-[34px] w-[190px]" />
          <Hero className={`size-full ${result.won ? 'animate-bob' : 'animate-defeat'}`} />
        </div>
        <div className="absolute right-[70px] top-[200px] size-[240px]">
          <GroundShadow className="absolute bottom-[-6px] left-[30px] h-[34px] w-[180px]" />
          <EnemySprite enemy={info.enemy} className={`size-full ${result.won ? 'animate-defeat' : 'animate-bob'}`} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[488px] flex flex-col rounded-t-[40px] border-t-[6px] border-ww-ink bg-ww-parchment px-8 pb-7 pt-[86px] shadow-[0_-8px_0_rgba(59,36,20,0.2)]">
        <Ribbon className="absolute left-1/2 top-[-56px] h-[112px] w-[480px] -translate-x-1/2">
          <h2 className={`${OUTLINED} animate-pop-in text-[68px] leading-none ${result.won ? 'text-ww-gold' : 'text-[#ffa2a2]'}`}>
            {finishedNow ? 'The End!' : result.won ? 'Victory!' : 'Defeated…'}
          </h2>
        </Ribbon>

        <p className="text-center font-display text-[32px] font-medium leading-snug text-ww-brown">
          {finishedNow
            ? 'The Dragon is beaten and the book is finished. Well spelled, Word Warrior!'
            : result.won
              ? `You beat the ${info.enemy.name}!`
              : `The ${info.enemy.name} got the better of you. Try again at full health.`}
        </p>

        {!result.won && (
          <div className="mt-6">
            <Reward icon="💡" title="Tip" detail={TIPS[(index + before.cleared + state.tick) % TIPS.length]} />
          </div>
        )}

        {result.won && (
          <div className="mt-6 flex flex-col gap-4">
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

        <div className="mt-auto grid grid-cols-2 gap-5">
          <button type="button" onClick={onMap} className={`${WOOD} h-[104px] rounded-full`}>
            <span className={`${OUTLINED} text-[34px]`}>📖 Map</span>
          </button>
          {result.won ? (
            <button
              type="button"
              onClick={() => (canGoOn ? onNext(after.cleared) : onMap())}
              className={`${GOLD} h-[104px] animate-pop-in rounded-full font-display text-[36px] font-bold`}
            >
              {canGoOn ? 'Next battle' : 'Done'}
            </button>
          ) : (
            <button type="button" onClick={() => onNext(index)} className={`${GOLD} h-[104px] animate-pop-in rounded-full font-display text-[36px] font-bold`}>
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Reward({ icon, title, detail, highlight = false }: { icon: string; title: string; detail: string; highlight?: boolean }) {
  return (
    <div
      className={`flex animate-pop-in items-center gap-5 rounded-[26px] border-[5px] px-6 py-3 text-left ${
        highlight ? 'border-ww-ink bg-[#fde7a8] shadow-[0_0_28px_rgba(245,195,68,0.7)]' : 'border-ww-ink/15 bg-ww-parchment-dark'
      }`}
    >
      <span className="text-[52px]">{icon}</span>
      <div>
        <p className="font-display text-[30px] font-bold text-ww-ink">{title}</p>
        <p className="text-[24px] font-medium text-ww-brown">{detail}</p>
      </div>
    </div>
  )
}
