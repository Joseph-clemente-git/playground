import type { Category } from './types'

export const CATEGORIES: Record<Category, { label: string; gradient: string }> = {
  board: { label: 'Board', gradient: 'from-amber-400 to-orange-600' },
  puzzle: { label: 'Puzzle', gradient: 'from-sky-400 to-indigo-600' },
  arcade: { label: 'Arcade', gradient: 'from-fuchsia-500 to-purple-700' },
  word: { label: 'Word', gradient: 'from-emerald-400 to-teal-600' },
  card: { label: 'Card', gradient: 'from-rose-400 to-red-600' },
  casual: { label: 'Casual', gradient: 'from-lime-400 to-green-600' },
}
