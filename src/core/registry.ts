import type { GameManifest } from './types'

/**
 * Every game in the hub. To add a playable game, create `src/games/<slug>/`
 * and set `load: () => import('../games/<slug>')` on its entry.
 */
export const GAMES: GameManifest[] = [
  // Board
  { slug: 'tic-tac-toe', title: 'Tic-Tac-Toe', icon: '❌', category: 'board', orientation: 'portrait', players: 'vs-ai', controls: 'Tap a square', description: 'Three in a row wins. Play a friend or the computer.' },
  { slug: 'connect-four', title: 'Connect Four', icon: '🔴', category: 'board', orientation: 'portrait', players: 'vs-ai', controls: 'Tap a column', description: 'Drop discs and line up four before your opponent.' },
  { slug: 'checkers', title: 'Checkers', icon: '⚫', category: 'board', orientation: 'portrait', players: 'vs-ai', controls: 'Tap or drag a piece', description: 'Jump and capture every piece on the board.' },
  { slug: 'chess', title: 'Chess', icon: '♟️', category: 'board', orientation: 'portrait', players: '2-local', controls: 'Tap or drag a piece', description: 'The classic game of kings.' },
  { slug: 'reversi', title: 'Reversi', icon: '⚪', category: 'board', orientation: 'portrait', players: 'vs-ai', controls: 'Tap a square', description: 'Flip discs to own the most of the board.' },
  { slug: 'battleship', title: 'Battleship', icon: '🚢', category: 'board', orientation: 'portrait', players: 'vs-ai', controls: 'Tap to fire', description: 'Hunt down the hidden fleet.' },
  // Puzzle
  { slug: '2048', title: '2048', icon: '🔢', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Swipe to slide tiles', description: 'Merge tiles to reach 2048.' },
  { slug: 'minesweeper', title: 'Minesweeper', icon: '💣', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Tap to reveal, long-press to flag', description: 'Clear the field without hitting a mine.' },
  { slug: 'sudoku', title: 'Sudoku', icon: '🧩', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Tap a cell, then a number', description: 'Fill the grid so every row, column and box has 1–9.' },
  { slug: 'sliding-puzzle', title: 'Sliding Puzzle', icon: '🔲', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Tap or swipe a tile', description: 'Slide the tiles back into order.' },
  { slug: 'lights-out', title: 'Lights Out', icon: '💡', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Tap a light', description: 'Switch every light off.' },
  { slug: 'nonogram', title: 'Nonogram', icon: '🖼️', category: 'puzzle', orientation: 'portrait', players: '1', controls: 'Tap or drag to fill', description: 'Use the number clues to reveal a hidden picture.' },
  // Arcade
  { slug: 'snake', title: 'Snake', icon: '🐍', category: 'arcade', orientation: 'portrait', players: '1', controls: 'Swipe or use the D-pad', description: 'Eat, grow, and don’t bite your tail.' },
  { slug: 'pong', title: 'Pong', icon: '🏓', category: 'arcade', orientation: 'landscape', players: 'vs-ai', controls: 'Drag your paddle', description: 'The original paddle duel.' },
  { slug: 'breakout', title: 'Breakout', icon: '🧱', category: 'arcade', orientation: 'portrait', players: '1', controls: 'Drag the paddle', description: 'Bounce the ball and smash every brick.' },
  { slug: 'flappy', title: 'Flappy Flyer', icon: '🐤', category: 'arcade', orientation: 'portrait', players: '1', controls: 'Tap to flap', description: 'Fly through the gaps for as long as you can.' },
  { slug: 'block-stacker', title: 'Block Stacker', icon: '🟦', category: 'arcade', orientation: 'portrait', players: '1', controls: 'Swipe to move, tap to rotate', description: 'Stack falling blocks and clear lines.' },
  { slug: 'space-shooter', title: 'Space Shooter', icon: '👾', category: 'arcade', orientation: 'portrait', players: '1', controls: 'Drag your ship, auto-fire', description: 'Blast waves of invaders.' },
  { slug: 'asteroids', title: 'Asteroids', icon: '☄️', category: 'arcade', orientation: 'landscape', players: '1', controls: 'Virtual joystick + fire button', description: 'Survive the asteroid field.' },
  { slug: 'endless-runner', title: 'Endless Runner', icon: '🏃', category: 'arcade', orientation: 'landscape', players: '1', controls: 'Tap to jump, swipe down to slide', description: 'Run, jump and dodge forever.' },
  // Word
  { slug: 'word-guess', title: 'Word Guess', icon: '🟩', category: 'word', orientation: 'portrait', players: '1', controls: 'On-screen keyboard', description: 'Guess the five-letter word in six tries.' },
  { slug: 'hangman', title: 'Hangman', icon: '🪢', category: 'word', orientation: 'portrait', players: '1', controls: 'On-screen keyboard', description: 'Guess the word one letter at a time.' },
  { slug: 'word-search', title: 'Word Search', icon: '🔍', category: 'word', orientation: 'portrait', players: '1', controls: 'Drag across letters', description: 'Find every hidden word in the grid.' },
  { slug: 'word-scramble', title: 'Word Scramble', icon: '🔤', category: 'word', orientation: 'portrait', players: '1', controls: 'Tap letters in order', description: 'Unscramble the letters before time runs out.' },
  // Card
  { slug: 'memory-match', title: 'Memory Match', icon: '🃏', category: 'card', orientation: 'portrait', players: '1', controls: 'Tap two cards', description: 'Flip cards and find every pair.' },
  { slug: 'solitaire', title: 'Solitaire', icon: '♠️', category: 'card', orientation: 'landscape', players: '1', controls: 'Tap or drag cards', description: 'Classic Klondike patience.' },
  { slug: 'blackjack', title: 'Blackjack', icon: '🂡', category: 'card', orientation: 'portrait', players: 'vs-ai', controls: 'Hit, stand or double', description: 'Beat the dealer to 21.' },
  { slug: 'war', title: 'War', icon: '⚔️', category: 'card', orientation: 'portrait', players: 'vs-ai', controls: 'Tap to flip', description: 'Highest card takes the pile.' },
  // Casual
  { slug: 'whack-a-mole', title: 'Whack-a-Mole', icon: '🔨', category: 'casual', orientation: 'portrait', players: '1', controls: 'Tap the moles', description: 'Bonk as many moles as you can.' },
  { slug: 'simon-says', title: 'Simon Says', icon: '🎵', category: 'casual', orientation: 'portrait', players: '1', controls: 'Tap the colours in order', description: 'Repeat the growing pattern.' },
  { slug: 'reaction-time', title: 'Reaction Time', icon: '⚡', category: 'casual', orientation: 'any', players: '1', controls: 'Tap when it turns green', description: 'How fast are your reflexes?' },
  { slug: 'rock-paper-scissors', title: 'Rock Paper Scissors', icon: '✊', category: 'casual', orientation: 'portrait', players: 'vs-ai', controls: 'Tap your move', description: 'Best of five against the computer.' },
]

export function findGame(slug: string): GameManifest | undefined {
  return GAMES.find((game) => game.slug === slug)
}
