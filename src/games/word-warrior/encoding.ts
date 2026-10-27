/**
 * The dictionary ships prefix-compressed: each line is one hex digit saying how
 * many leading letters it shares with the previous word, then the rest of the word.
 * Words are sorted and at most 16 letters, so the shared prefix never exceeds 15.
 */
export function encode(words: string[]): string {
  let previous = ''
  return words
    .map((word) => {
      let shared = 0
      while (shared < 15 && shared < previous.length && word[shared] === previous[shared]) shared++
      previous = word
      return shared.toString(16) + word.slice(shared)
    })
    .join('\n')
}

export function decode(text: string): string[] {
  const words: string[] = []
  let previous = ''
  for (const line of text.split('\n')) {
    if (!line) continue
    previous = previous.slice(0, parseInt(line[0], 16)) + line.slice(1)
    words.push(previous)
  }
  return words
}
