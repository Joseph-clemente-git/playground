/** The hero: a pink earthworm in a knight's helmet, carrying a book as a shield. */
export function Hero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      {/* Body segments, tail first so the head sits on top. */}
      <ellipse cx="38" cy="168" rx="30" ry="24" fill="#e2557a" />
      <ellipse cx="72" cy="160" rx="34" ry="30" fill="#f06a8f" />
      <path d="M50 150 q22 -8 44 0" stroke="#c7406a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="108" cy="138" rx="34" ry="36" fill="#fb7fa1" />
      <path d="M84 128 q24 -8 48 0" stroke="#d94d76" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Head */}
      <circle cx="128" cy="82" r="44" fill="#fb8fae" />
      <ellipse cx="150" cy="104" rx="10" ry="6" fill="#f472b6" opacity="0.6" />

      {/* Eyes look right, toward the enemy. */}
      <ellipse cx="128" cy="86" rx="11" ry="14" fill="white" />
      <ellipse cx="156" cy="86" rx="10" ry="13" fill="white" />
      <circle cx="132" cy="89" r="6" fill="#1f1235" />
      <circle cx="159" cy="89" r="5.5" fill="#1f1235" />
      <circle cx="134" cy="86" r="2" fill="white" />
      <circle cx="161" cy="86" r="2" fill="white" />
      <path d="M134 110 q12 10 26 0" stroke="#9d174d" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* Helmet with a plume */}
      <path d="M82 70 a46 42 0 0 1 92 0 z" fill="#cbd5e1" />
      <path d="M82 70 h92" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M128 30 v40" stroke="#94a3b8" strokeWidth="5" />
      <path d="M126 32 c-6 -22 18 -30 34 -22 c-16 0 -22 8 -24 22 z" fill="#ef4444" />
      <circle cx="104" cy="58" r="4" fill="#f8fafc" opacity="0.8" />

      {/* Book shield */}
      <g transform="rotate(-8 102 150)">
        <rect x="80" y="122" width="48" height="58" rx="5" fill="#1d4ed8" />
        <rect x="80" y="122" width="9" height="58" rx="3" fill="#1e3a8a" />
        <rect x="96" y="136" width="24" height="5" rx="2.5" fill="#fbbf24" />
        <rect x="96" y="146" width="18" height="5" rx="2.5" fill="#fbbf24" />
        <path d="M126 125 v52" stroke="#e0e7ff" strokeWidth="3" />
      </g>
    </svg>
  )
}
