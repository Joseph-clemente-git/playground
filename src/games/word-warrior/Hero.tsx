const INK = '#3b2414'
const SKIN = '#f8d2ab'
const HAIR = '#7a4524'

/** The hero: a young scholar who fights with a giant fountain pen and a glowing spellbook. */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '54 14 104 104' : '0 0 200 200'} className={className} aria-hidden>
      <defs>
        <radialGradient id="hero-book-glow">
          <stop offset="0%" stopColor="#fff3a8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Cape, behind everything */}
        <path d="M82 106 Q72 140 60 178 Q102 188 146 178 Q134 140 126 106 Z" fill="#3f6fd6" />
        <path d="M70 172 Q102 180 136 172" fill="none" stroke="#2c4fa3" strokeWidth="4" />

        {/* Legs and boots */}
        <rect x="88" y="156" width="14" height="24" rx="5" fill="#5b3a24" />
        <rect x="108" y="156" width="14" height="24" rx="5" fill="#5b3a24" />
        <path d="M84 176 h20 a4 4 0 0 1 4 4 v4 h-26 v-2 a6 6 0 0 1 2 -6 z" fill="#8a5a35" />
        <path d="M106 176 h20 a6 6 0 0 1 6 6 v2 h-28 v-4 a4 4 0 0 1 2 -4 z" fill="#8a5a35" />

        {/* Tunic and belt */}
        <path d="M86 104 h36 q6 30 8 58 h-52 q2 -28 8 -58 z" fill="#f4e4c1" />
        <rect x="80" y="138" width="50" height="10" rx="3" fill="#8a5a35" />
        <rect x="99" y="136" width="12" height="14" rx="3" fill="#f5c344" strokeWidth="3.5" />

        {/* Spellbook arm (behind the book) */}
        <path d="M88 112 Q72 124 70 138" fill="none" stroke={INK} strokeWidth="15" />
        <path d="M88 112 Q72 124 70 138" fill="none" stroke="#f4e4c1" strokeWidth="7" />
      </g>

      {/* Open spellbook, glowing */}
      <circle cx="60" cy="140" r="34" fill="url(#hero-book-glow)" />
      <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round">
        <path d="M34 134 L60 146 L86 134 L86 158 L60 168 L34 158 Z" fill="#b8323a" />
        <path d="M38 130 Q50 126 60 136 L60 160 Q50 152 38 154 Z" fill="#fff8e1" />
        <path d="M82 130 Q70 126 60 136 L60 160 Q70 152 82 154 Z" fill="#fff8e1" />
      </g>
      <path d="M44 138 q6 -2 11 2 M44 145 q6 -2 11 2 M66 140 q5 -4 11 -2 M66 147 q5 -4 11 -2" stroke="#c9a36a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M58 112 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#fff3a8" />
      <path d="M40 116 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="#fff3a8" />

      {/* Giant fountain pen, held like a sword */}
      <g transform="rotate(36 142 132)" stroke={INK} strokeWidth="4.5" strokeLinejoin="round">
        <rect x="134" y="76" width="16" height="62" rx="7" fill="#2b3a67" />
        <rect x="134" y="114" width="16" height="9" fill="#f5c344" strokeWidth="3.5" />
        <rect x="136" y="80" width="5" height="30" rx="2" fill="#5d73b8" stroke="none" />
        <path d="M134 78 L142 46 L150 78 Z" fill="#f5c344" />
        <path d="M142 54 V72" stroke={INK} strokeWidth="3" />
        <circle cx="142" cy="72" r="3" fill={INK} stroke="none" />
      </g>
      <path d="M186 50 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 z" fill="#ffffff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />

      {/* Pen arm and hand, in front */}
      <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 112 Q132 124 140 130" fill="none" stroke={INK} strokeWidth="15" />
        <path d="M120 112 Q132 124 140 130" fill="none" stroke="#f4e4c1" strokeWidth="7" />
        <circle cx="142" cy="131" r="9" fill={SKIN} />
      </g>

      {/* Head */}
      <g stroke={INK} strokeWidth="4.5" strokeLinejoin="round">
        <circle cx="66" cy="74" r="8" fill={SKIN} />
        <circle cx="104" cy="70" r="40" fill={SKIN} />
        {/* Messy hair */}
        <path
          d="M64 70 Q60 40 84 30 Q86 20 98 24 Q106 14 116 24 Q128 20 132 32 Q148 40 144 64 Q136 52 126 50 Q122 58 112 56 Q104 62 96 54 Q88 60 80 56 Q74 66 64 70 Z"
          fill={HAIR}
        />
      </g>
      <path d="M90 34 q6 -4 12 -2 M116 30 q6 0 10 4" stroke="#a8693d" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Face, looking right toward the enemy */}
      <g stroke={INK} strokeWidth="3.5">
        <ellipse cx="104" cy="78" rx="8" ry="10" fill="white" />
        <ellipse cx="128" cy="78" rx="7.5" ry="9.5" fill="white" />
      </g>
      <circle cx="107" cy="80" r="5" fill="#2a1a12" />
      <circle cx="130" cy="80" r="4.8" fill="#2a1a12" />
      <circle cx="109" cy="77.5" r="1.8" fill="white" />
      <circle cx="132" cy="77.5" r="1.8" fill="white" />
      <path d="M96 64 q7 -5 14 -1 M122 63 q6 -3 12 1" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="94" cy="92" rx="7" ry="4" fill="#f29a9a" opacity="0.7" />
      <ellipse cx="138" cy="92" rx="6" ry="4" fill="#f29a9a" opacity="0.7" />
      <path d="M112 96 q8 7 16 0" stroke={INK} strokeWidth="3.5" fill="#c2453f" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
