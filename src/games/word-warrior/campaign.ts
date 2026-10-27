import { MAX_POTIONS, type EnemyDef, type Perks, type PotionKind, type Potions } from './battle'

export interface Chapter {
  title: string
  /** Tailwind gradient behind the battle scene. */
  scene: string
  /** Four battles, then the boss. */
  enemies: EnemyDef[]
  /** One themed bonus word per battle. */
  bonus: string[]
}

export const BATTLES_PER_CHAPTER = 5

export const CHAPTERS: Chapter[] = [
  {
    title: 'The Cellar',
    scene: 'from-stone-700 via-stone-800 to-stone-950',
    bonus: ['candle', 'barrel', 'cheese', 'ladder', 'basket'],
    enemies: [
      { name: 'Rat', emoji: '🐀', hp: 16, attack: 2, verb: 'bites', abilities: [] },
      { name: 'Spider', emoji: '🕷️', hp: 20, attack: 2, verb: 'bites', abilities: [{ kind: 'lock', chance: 0.35 }] },
      { name: 'Bat', emoji: '🦇', hp: 22, attack: 3, verb: 'swoops', abilities: [] },
      { name: 'Snake', emoji: '🐍', hp: 26, attack: 3, verb: 'strikes', abilities: [{ kind: 'poison', chance: 0.35 }] },
      {
        name: 'Toad King',
        emoji: '🐸',
        hp: 50,
        attack: 4,
        verb: 'slams you',
        abilities: [
          { kind: 'charge', chance: 0.2 },
          { kind: 'poison', chance: 0.3 },
        ],
      },
    ],
  },
  {
    title: 'The Haunted Library',
    scene: 'from-indigo-800 via-violet-950 to-slate-950',
    bonus: ['story', 'scroll', 'reader', 'novel', 'quill'],
    enemies: [
      { name: 'Ghost', emoji: '👻', hp: 30, attack: 4, verb: 'chills you', abilities: [{ kind: 'weaken', chance: 0.3 }] },
      { name: 'Skeleton', emoji: '💀', hp: 34, attack: 4, verb: 'rattles you', abilities: [{ kind: 'shield', chance: 0.3 }] },
      { name: 'Zombie', emoji: '🧟', hp: 38, attack: 5, verb: 'claws', abilities: [{ kind: 'smash', chance: 0.3 }] },
      { name: 'Vampire', emoji: '🧛', hp: 40, attack: 5, verb: 'bites', abilities: [{ kind: 'heal', chance: 0.35 }] },
      {
        name: 'Witch',
        emoji: '🧙',
        hp: 70,
        attack: 5,
        verb: 'hexes you',
        abilities: [
          { kind: 'burn', chance: 0.3 },
          { kind: 'weaken', chance: 0.25 },
        ],
      },
    ],
  },
  {
    title: 'The Dragon’s Tower',
    scene: 'from-orange-800 via-red-950 to-zinc-950',
    bonus: ['sword', 'shield', 'castle', 'flame', 'dragon'],
    enemies: [
      { name: 'Goblin', emoji: '👺', hp: 44, attack: 6, verb: 'stabs', abilities: [{ kind: 'lock', chance: 0.3 }] },
      { name: 'Wolf', emoji: '🐺', hp: 48, attack: 6, verb: 'mauls', abilities: [{ kind: 'charge', chance: 0.25 }] },
      { name: 'Scorpion', emoji: '🦂', hp: 50, attack: 6, verb: 'stings', abilities: [{ kind: 'poison', chance: 0.35 }] },
      { name: 'Ogre', emoji: '👹', hp: 56, attack: 7, verb: 'clubs', abilities: [{ kind: 'smash', chance: 0.3 }] },
      {
        name: 'Dragon',
        emoji: '🐉',
        hp: 85,
        attack: 6,
        verb: 'breathes fire',
        abilities: [
          { kind: 'burn', chance: 0.25 },
          { kind: 'charge', chance: 0.2 },
          { kind: 'shield', chance: 0.15 },
        ],
      },
    ],
  },
]

export const TOTAL_BATTLES = CHAPTERS.length * BATTLES_PER_CHAPTER

/** The potion each battle's bonus word earns, by its place in the chapter. */
const REWARDS: PotionKind[] = ['health', 'power', 'purity', 'health', 'power']

export type TreasureId = 'inkwell' | 'bookmark' | 'quill'

/** Each chapter's boss guards one treasure, in chapter order. */
export const TREASURES: { id: TreasureId; name: string; icon: string; description: string }[] = [
  { id: 'inkwell', name: 'Bottomless Inkwell', icon: '🫙', description: '+10 max health' },
  { id: 'bookmark', name: 'Lucky Bookmark', icon: '🔖', description: 'Every battle starts with an Amethyst' },
  { id: 'quill', name: 'Golden Quill', icon: '🪶', description: 'Rare letters hit harder' },
]

export const BASE_HP = 40
const INKWELL_HP = 10

export interface Battle {
  /** 0 to TOTAL_BATTLES - 1, across the whole book. */
  index: number
  chapter: Chapter
  chapterIndex: number
  /** Place within the chapter, 0 to 4. */
  place: number
  enemy: EnemyDef
  bonus: { word: string; reward: PotionKind }
  isBoss: boolean
}

export function battleAt(index: number): Battle {
  const chapterIndex = Math.floor(index / BATTLES_PER_CHAPTER)
  const place = index % BATTLES_PER_CHAPTER
  const chapter = CHAPTERS[chapterIndex]
  return {
    index,
    chapter,
    chapterIndex,
    place,
    enemy: chapter.enemies[place],
    bonus: { word: chapter.bonus[place], reward: REWARDS[place] },
    isBoss: place === BATTLES_PER_CHAPTER - 1,
  }
}

export interface Progress {
  /** Battles won in order; the next one to fight is at this index. */
  cleared: number
  /** Health carried into the next battle. */
  hp: number
  potions: Potions
}

export function newProgress(): Progress {
  return { cleared: 0, hp: BASE_HP, potions: { health: 1, purity: 0, power: 0 } }
}

export function treasuresOwned(cleared: number): TreasureId[] {
  return TREASURES.slice(0, Math.floor(cleared / BATTLES_PER_CHAPTER)).map((treasure) => treasure.id)
}

export function maxHp(cleared: number) {
  return BASE_HP + (treasuresOwned(cleared).includes('inkwell') ? INKWELL_HP : 0)
}

export function perks(cleared: number): Perks {
  const owned = treasuresOwned(cleared)
  return { quill: owned.includes('quill'), bookmark: owned.includes('bookmark') }
}

export function isFinished(progress: Progress) {
  return progress.cleared >= TOTAL_BATTLES
}

/** Health to start a battle with: full at the start of a chapter and on replays. */
export function startingHp(progress: Progress, index: number) {
  const full = maxHp(progress.cleared)
  if (index !== progress.cleared || index % BATTLES_PER_CHAPTER === 0) return full
  return Math.min(full, Math.max(1, progress.hp))
}

/** Saves a win: the next battle opens, and you heal a third between battles. */
export function afterWin(progress: Progress, index: number, hp: number, potions: Potions): Progress {
  if (index !== progress.cleared) return { ...progress, potions }
  const cleared = progress.cleared + 1
  const full = maxHp(cleared)
  return { cleared, hp: Math.min(full, hp + Math.round(full / 3)), potions }
}

/** After a loss you retry at full health, with the potions you went in with. */
export function afterLoss(progress: Progress): Progress {
  return { ...progress, hp: maxHp(progress.cleared) }
}

const POTION_KINDS: PotionKind[] = ['health', 'purity', 'power']

/** Reads saved progress, falling back to a fresh book if it's missing or malformed. */
export function parseProgress(raw: string | null): Progress {
  try {
    const saved = JSON.parse(raw ?? 'null') as Partial<Progress> | null
    const fresh = newProgress()
    if (!saved || typeof saved !== 'object') return fresh
    const cleared = clampInt(saved.cleared, 0, TOTAL_BATTLES, 0)
    const potions = Object.fromEntries(
      POTION_KINDS.map((kind) => [kind, clampInt(saved.potions?.[kind], 0, MAX_POTIONS, fresh.potions[kind])]),
    ) as Potions
    return { cleared, hp: clampInt(saved.hp, 1, maxHp(cleared), maxHp(cleared)), potions }
  } catch {
    return newProgress()
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}
