/** How long after launch an update may still be applied without asking. */
export const LAUNCH_WINDOW = 5000

interface ApplyContext {
  pathname: string
  /** The app is in the background, so a reload goes unnoticed. */
  hidden: boolean
  msSinceLaunch: number
}

/**
 * Whether a ready update can reload the app without asking first. Never during a game,
 * since that would throw away the player's progress. Otherwise only when nobody is
 * looking, or the app has only just opened and the reload looks like part of startup.
 */
export function canApplySilently({ pathname, hidden, msSinceLaunch }: ApplyContext) {
  if (pathname.startsWith('/games/')) return false
  return hidden || msSinceLaunch < LAUNCH_WINDOW
}
