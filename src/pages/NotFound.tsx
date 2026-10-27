import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-6xl" aria-hidden>
        🕹️
      </p>
      <h1 className="font-display text-2xl font-bold text-white">Game not found</h1>
      <Link to="/" className="rounded-full bg-white px-6 py-3 font-semibold text-bg">
        Back to games
      </Link>
    </div>
  )
}
