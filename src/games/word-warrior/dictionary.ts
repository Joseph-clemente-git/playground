import { decode } from './encoding'
import type { Letter } from './tiles'
import wordsUrl from './words.txt?url'

export interface Dictionary {
  words: string[]
  has(word: string): boolean
}

let loading: Promise<Dictionary> | null = null

/** Fetches and decodes the word list once; later calls share the same result. */
export function loadDictionary(): Promise<Dictionary> {
  loading ??= fetch(wordsUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Word list failed to load (${response.status})`)
      return response.text()
    })
    .then((text) => createDictionary(decode(text)))
    .catch((error: unknown) => {
      // Let the next attempt try again rather than caching the failure.
      loading = null
      throw error
    })
  return loading
}

export function createDictionary(words: string[]): Dictionary {
  const set = new Set(words)
  return { words, has: (word) => set.has(word) }
}

const A = 'a'.charCodeAt(0)
/** Slot for the `qu` tile, after the 26 single letters. */
const QU = 26

/** Whether any word can be spelled from these letters, used in any order. */
export function hasAnyWord(dictionary: Dictionary, letters: Letter[]): boolean {
  const counts = new Uint8Array(27)
  for (const letter of letters) counts[letter === 'qu' ? QU : letter.charCodeAt(0) - A]++
  const used = new Uint8Array(27)
  return dictionary.words.some((word) => canSpell(word, counts, used))
}

function canSpell(word: string, counts: Uint8Array, used: Uint8Array) {
  used.fill(0)
  for (let i = 0; i < word.length; i++) {
    let slot = word.charCodeAt(i) - A
    if (word[i] === 'q') {
      if (word[i + 1] !== 'u') return false
      slot = QU
      i++
    }
    if (++used[slot] > counts[slot]) return false
  }
  return true
}
