import type { ComponentType } from 'react'

export type Orientation = 'portrait' | 'landscape' | 'any'

export type Category = 'board' | 'puzzle' | 'arcade' | 'word' | 'card' | 'casual'

export type Players = '1' | '2-local' | 'vs-ai'

export interface GameProps {
  onScore(score: number): void
  onGameOver(result: { score?: number; won?: boolean }): void
}

export interface GameManifest {
  slug: string
  title: string
  description: string
  category: Category
  orientation: Orientation
  players: Players
  /** How the game is played on a touch screen, shown on the game page. */
  controls: string
  /** Emoji used as the card thumbnail until real artwork exists. */
  icon: string
  /** Lazy loader for the game component. Omitted while the game is "coming soon". */
  load?: () => Promise<{ default: ComponentType<GameProps> }>
}
