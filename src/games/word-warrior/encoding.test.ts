import { describe, expect, it } from 'vitest'
import { CHAPTERS } from './campaign'
import { createDictionary, hasAnyWord } from './dictionary'
import { decode, encode } from './encoding'
import shipped from './words.txt?raw'

describe('encode and decode', () => {
  it('round-trips a sorted list', () => {
    const words = ['aah', 'aahed', 'aahing', 'abacus', 'abandon', 'zebra']
    expect(encode(words)).toBe('0aah\n3ed\n3ing\n1bacus\n3ndon\n0zebra')
    expect(decode(encode(words))).toEqual(words)
  })

  it('caps the shared prefix at 15 letters', () => {
    const words = ['abcdefghijklmnopq', 'abcdefghijklmnopr']
    expect(decode(encode(words))).toEqual(words)
  })
})

describe('the shipped word list', () => {
  const words = decode(shipped)
  const dictionary = createDictionary(words)

  it('decodes to sorted words of 3 to 16 letters', () => {
    expect(words.length).toBeGreaterThan(250_000)
    expect(words.every((word) => /^[a-z]{3,16}$/.test(word))).toBe(true)
    expect(words.every((word, i) => i === 0 || words[i - 1] < word)).toBe(true)
  })

  it('knows everyday words and leaves out slurs', () => {
    for (const word of ['cat', 'quiz', 'dragon', 'library', 'wizard']) expect(dictionary.has(word)).toBe(true)
    for (const word of ['xqz', 'nigger', 'faggot']) expect(dictionary.has(word)).toBe(false)
  })

  it('has every bonus word', () => {
    for (const chapter of CHAPTERS) for (const word of chapter.bonus) expect(dictionary.has(word)).toBe(true)
  })

  it('finds a word in a playable grid and none in an impossible one', () => {
    expect(hasAnyWord(dictionary, ['c', 'a', 't', 'x'])).toBe(true)
    expect(hasAnyWord(dictionary, ['qu', 'i', 'z'])).toBe(true)
    expect(hasAnyWord(dictionary, ['x', 'z', 'j', 'k', 'v'])).toBe(false)
    // A `q` only spells as the `qu` tile, so `qat`, `qis` and `tranq` can't be made.
    expect(hasAnyWord(dictionary, ['qu', 'i', 's'])).toBe(false)
    expect(hasAnyWord(dictionary, ['qu', 'a', 't'])).toBe(true)
  })
})
