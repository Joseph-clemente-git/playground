const INK = '#3b2414'

/** The hero: a pink earthworm in a knight's helmet, carrying a book as a shield. */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '76 14 112 112' : '0 0 200 200'} className={className} aria-hidden>
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {/* Body segments, tail first so the head sits on top. */}
        <ellipse cx="38" cy="168" rx="28" ry="22" fill="#e2557a" />
        <ellipse cx="72" cy="160" rx="32" ry="28" fill="#f06a8f" />
        <ellipse cx="108" cy="138" rx="32" ry="34" fill="#fb7fa1" />

        {/* Head */}
        <circle cx="128" cy="82" r="42" fill="#fb8fae" />
      </g>
      <path d="M50 152 q22 -8 40 0 M86 128 q22 -8 42 0" stroke="#c7406a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="112" cy="104" rx="9" ry="5" fill="#f472b6" opacity="0.7" />
      <ellipse cx="164" cy="104" rx="7" ry="5" fill="#f472b6" opacity="0.7" />

      {/* Eyes look right, toward the enemy. */}
      <g stroke={INK} strokeWidth="4">
        <ellipse cx="128" cy="86" rx="11" ry="14" fill="white" />
        <ellipse cx="155" cy="86" rx="10" ry="13" fill="white" />
      </g>
      <circle cx="132" cy="89" r="6" fill="#1f1235" />
      <circle cx="158" cy="89" r="5.5" fill="#1f1235" />
      <circle cx="134" cy="86" r="2" fill="white" />
      <circle cx="160" cy="86" r="2" fill="white" />
      <path d="M134 108 q12 10 24 0" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* Helmet with a plume */}
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M128 32 v18" fill="none" />
        <path d="M126 34 c-6 -22 18 -30 34 -22 c-16 0 -22 8 -24 22 z" fill="#ef4444" />
        <path d="M84 70 a44 40 0 0 1 88 0 z" fill="#cbd5e1" />
        <rect x="80" y="66" width="96" height="10" rx="5" fill="#94a3b8" />
      </g>
      <path d="M100 58 q6 -14 18 -20" stroke="#f8fafc" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />

      {/* Book shield */}
      <g transform="rotate(-8 102 150)" stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <rect x="80" y="122" width="48" height="58" rx="6" fill="#2563eb" />
        <path d="M89 124 v54" fill="none" strokeWidth="4" />
        <rect x="97" y="136" width="22" height="5" rx="2.5" fill="#fbbf24" strokeWidth="0" />
        <rect x="97" y="146" width="16" height="5" rx="2.5" fill="#fbbf24" strokeWidth="0" />
      </g>
    </svg>
  )
}
