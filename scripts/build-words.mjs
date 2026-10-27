// Builds the Word Warrior dictionary from the `word-list` package.
// Run with `npm run words`; the output is committed so builds don't need this step.
import { readFileSync, writeFileSync } from 'node:fs'
import wordListPath from 'word-list'
import { encode } from '../src/games/word-warrior/encoding.ts'

const OUTPUT = new URL('../src/games/word-warrior/words.txt', import.meta.url)

/** Slurs and the crudest swears. Plurals are dropped along with them. */
const BLOCKED = [
  'chink', 'coon', 'cunt', 'dago', 'dyke', 'fag', 'faggot', 'faggy', 'fuck', 'fucked', 'fucker', 'fucking',
  'gook', 'honky', 'kike', 'kyke', 'motherfucker', 'nigga', 'nigger', 'paki', 'raghead', 'retard', 'shit',
  'shitty', 'slut', 'spic', 'spick', 'tranny', 'twat', 'wetback', 'whore', 'wog',
]
const blocked = new Set(BLOCKED.flatMap((word) => [word, `${word}s`, `${word}es`]))

const words = readFileSync(wordListPath, 'utf8')
  .split('\n')
  .filter((word) => /^[a-z]{3,16}$/.test(word) && !blocked.has(word))
  .sort()

writeFileSync(OUTPUT, encode(words))
console.log(`Wrote ${words.length} words to ${OUTPUT.pathname}`)
