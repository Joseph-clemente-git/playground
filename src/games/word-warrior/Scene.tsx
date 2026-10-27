import { useId, type ReactNode } from 'react'
import type { SceneName } from './campaign'

/**
 * Painted backdrops, drawn at 720×560 and cropped to fill whatever box they're in.
 * The floor starts around y = 420, which is where the fighters stand.
 */
export function SceneBackdrop({ scene, className }: { scene: SceneName; className?: string }) {
  // Gradient ids must be unique when several backdrops are on screen at once.
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 720 560" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      {scene === 'cellar' && <Cellar id={id} />}
      {scene === 'library' && <Library id={id} />}
      {scene === 'tower' && <Tower id={id} />}
      <defs>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#2a1608" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1608" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="720" height="560" fill={`url(#${id}-vignette)`} />
    </svg>
  )
}

/** A repeatable wobble so hand-placed details don't look machine-perfect. */
function jitter(i: number) {
  return ((i * 9301 + 49297) % 233280) / 233280
}

function Torch({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 18} r="70" fill={`url(#${id}-glow)`} />
      <path d={`M${x - 14} ${y} h28 l-6 34 h-16 z`} fill="#5b3a22" stroke="#3b2414" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M${x} ${y - 48} c16 16 18 34 0 44 c-18 -10 -16 -28 0 -44 z`} fill="#f59e2b" />
      <path d={`M${x} ${y - 30} c8 8 9 18 0 24 c-9 -6 -8 -16 0 -24 z`} fill="#ffe08a" />
    </g>
  )
}

function Glow({ id, color }: { id: string; color: string }) {
  return (
    <radialGradient id={`${id}-glow`}>
      <stop offset="0%" stopColor={color} stopOpacity="0.55" />
      <stop offset="100%" stopColor={color} stopOpacity="0" />
    </radialGradient>
  )
}

function Cellar({ id }: { id: string }) {
  const bricks: ReactNode[] = []
  for (let row = 0; row < 9; row++) {
    for (let column = -1; column < 10; column++) {
      const x = column * 80 + (row % 2) * 40 + jitter(row * 11 + column) * 6
      const shade = jitter(row * 7 + column * 3)
      bricks.push(
        <rect
          key={`${row}-${column}`}
          x={x}
          y={row * 46 + 4}
          width="74"
          height="40"
          rx="9"
          fill={shade > 0.66 ? '#a3825f' : shade > 0.33 ? '#97775a' : '#8c6d50'}
          stroke="#6e5238"
          strokeWidth="2"
        />,
      )
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c4532" />
          <stop offset="100%" stopColor="#7d6047" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a88a63" />
          <stop offset="100%" stopColor="#c9ab80" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
        <Glow id={id} color="#ffb347" />
      </defs>
      <rect width="720" height="560" fill={`url(#${id}-wall)`} />
      <g opacity="0.9">{bricks}</g>
      {/* Warm haze so the wall sits back. */}
      <rect width="720" height="420" fill="#4a3322" opacity="0.25" />

      {/* Barred window and its light shaft */}
      <rect x="520" y="40" width="96" height="64" rx="10" fill="#cfe3e8" stroke="#3b2414" strokeWidth="5" />
      {[540, 564, 588].map((x) => (
        <path key={x} d={`M${x + 4} 42 v60`} stroke="#3b2414" strokeWidth="5" />
      ))}
      <path d="M520 104 L616 104 L520 470 L340 470 Z" fill={`url(#${id}-beam)`} />

      {/* Arched door */}
      <path d="M110 420 V230 a90 90 0 0 1 180 0 V420 Z" fill="#c9b08a" stroke="#3b2414" strokeWidth="5" />
      <path d="M134 420 V236 a66 66 0 0 1 132 0 V420 Z" fill="#7a4d2b" stroke="#3b2414" strokeWidth="5" />
      {[167, 200, 233].map((x) => (
        <path key={x} d={`M${x} ${x === 200 ? 172 : 186} V418`} stroke="#5e3a1f" strokeWidth="4" />
      ))}
      <path d="M140 300 h120 M140 370 h120" stroke="#4a4038" strokeWidth="7" />
      <circle cx="244" cy="335" r="9" fill="none" stroke="#4a4038" strokeWidth="5" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const angle = Math.PI * (1 - i / 6)
        return (
          <circle key={i} cx={200 + Math.cos(angle) * 78} cy={230 - Math.sin(angle) * 78} r="7" fill="#7fb8a8" stroke="#3b2414" strokeWidth="3" />
        )
      })}
      <Torch x={78} y={260} id={id} />
      <Torch x={322} y={260} id={id} />

      {/* Shelf with jars and a candle */}
      <rect x="380" y="196" width="150" height="14" rx="4" fill="#6b4426" stroke="#3b2414" strokeWidth="4" />
      <rect x="392" y="160" width="30" height="36" rx="8" fill="#7fb8a8" stroke="#3b2414" strokeWidth="4" />
      <rect x="430" y="148" width="38" height="48" rx="10" fill="#d98e5f" stroke="#3b2414" strokeWidth="4" />
      <rect x="484" y="166" width="16" height="30" rx="4" fill="#fff1d0" stroke="#3b2414" strokeWidth="3" />
      <path d="M492 142 c8 8 8 16 0 22 c-8 -6 -8 -14 0 -22 z" fill="#ffb347" />

      {/* Floor */}
      <rect y="410" width="720" height="150" fill={`url(#${id}-floor)`} />
      <path d="M0 410 H720" stroke="#6e5238" strokeWidth="6" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <path key={i} d={`M${i * 90 - 40} 560 L${i * 90 + 10} 412`} stroke="#a0825c" strokeWidth="3" opacity="0.7" />
      ))}
      <path d="M0 470 H720 M0 520 H720" stroke="#b39468" strokeWidth="3" opacity="0.6" />

      {/* Barrels and a crate */}
      <Barrel x={612} y={300} />
      <Barrel x={672} y={312} />
      <rect x="560" y="356" width="72" height="66" rx="8" fill="#b07a45" stroke="#3b2414" strokeWidth="5" />
      <path d="M564 360 L628 418 M628 360 L564 418" stroke="#7a4f2c" strokeWidth="5" />
      <ellipse cx="40" cy="430" rx="34" ry="10" fill="#3b2414" opacity="0.2" />
      <path d="M14 432 q4 -40 26 -44 q22 4 26 44 z" fill="#8fa77a" stroke="#3b2414" strokeWidth="4" />

      {/* Cobweb */}
      <path d="M0 0 L90 0 M0 0 L0 90 M0 0 L70 60 M0 0 L35 80 M0 0 L80 30" stroke="#f4ead8" strokeWidth="2" opacity="0.55" />
      <path d="M0 40 Q24 34 32 28 Q40 18 40 0 M0 66 Q40 56 56 44 Q66 30 70 0" stroke="#f4ead8" strokeWidth="2" fill="none" opacity="0.55" />
    </g>
  )
}

function Barrel({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 38} ${y} q-8 60 0 120 h76 q8 -60 0 -120 z`} fill="#a8703f" stroke="#3b2414" strokeWidth="5" />
      <ellipse cx={x} cy={y} rx="38" ry="12" fill="#c48d55" stroke="#3b2414" strokeWidth="5" />
      <path d={`M${x - 44} ${y + 34} h88 M${x - 44} ${y + 88} h88`} stroke="#4a4038" strokeWidth="7" />
    </g>
  )
}

const BOOK_COLORS = ['#c0504d', '#4f81bd', '#9bbb59', '#e8b04a', '#8064a2', '#4bacc6', '#d9785b']

function Bookcase({ x, width }: { x: number; width: number }) {
  const shelves: ReactNode[] = []
  for (let shelf = 0; shelf < 4; shelf++) {
    const top = 70 + shelf * 88
    let bookX = x + 18
    let i = 0
    while (bookX < x + width - 30) {
      const seed = shelf * 31 + i * 7 + x
      const w = 14 + Math.round(jitter(seed) * 12)
      const h = 52 + Math.round(jitter(seed + 1) * 22)
      const leaning = jitter(seed + 2) > 0.9
      shelves.push(
        <rect
          key={`${shelf}-${i}`}
          x={bookX}
          y={top + 76 - h}
          width={w}
          height={h}
          rx="3"
          fill={BOOK_COLORS[Math.floor(jitter(seed + 3) * BOOK_COLORS.length)]}
          stroke="#2a1a33"
          strokeWidth="3"
          transform={leaning ? `rotate(12 ${bookX + w} ${top + 76})` : undefined}
        />,
      )
      bookX += w + (leaning ? 14 : 2)
      i++
    }
    shelves.push(<rect key={`board-${shelf}`} x={x + 8} y={top + 76} width={width - 16} height="12" fill="#5b3a24" stroke="#2a1a14" strokeWidth="3" />)
  }
  return (
    <g>
      <rect x={x} y="40" width={width} height="390" rx="10" fill="#3e2716" stroke="#2a1a14" strokeWidth="6" />
      <rect x={x + 10} y="56" width={width - 20} height="360" fill="#2c1a10" />
      {shelves}
    </g>
  )
}

function Library({ id }: { id: string }) {
  const candles = [
    [270, 120],
    [455, 150],
    [330, 210],
    [395, 92],
  ]
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a58" />
          <stop offset="100%" stopColor="#5e4683" />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2350" />
          <stop offset="100%" stopColor="#4b5aa0" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3d2b" />
          <stop offset="100%" stopColor="#7a5640" />
        </linearGradient>
        <Glow id={id} color="#ffd27a" />
      </defs>
      <rect width="720" height="560" fill={`url(#${id}-wall)`} />

      {/* Moonlit window */}
      <path d="M262 380 V170 a98 98 0 0 1 196 0 V380 Z" fill={`url(#${id}-sky)`} stroke="#2a1a33" strokeWidth="8" />
      <circle cx="400" cy="150" r="34" fill="#fdf3c8" />
      <circle cx="414" cy="140" r="30" fill="#2a3266" />
      {[
        [300, 140],
        [330, 230],
        [420, 260],
        [292, 300],
        [440, 200],
        [360, 110],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#fdf3c8" />
      ))}
      <path d="M360 72 V380 M262 250 H458" stroke="#2a1a33" strokeWidth="8" />
      <path d="M248 384 h224" stroke="#2a1a33" strokeWidth="14" strokeLinecap="round" />

      <Bookcase x={-10} width={240} />
      <Bookcase x={490} width={240} />

      {/* Floating candles */}
      {candles.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y - 14} r="44" fill={`url(#${id}-glow)`} />
          <rect x={x - 8} y={y} width="16" height="40" rx="4" fill="#fff1d0" stroke="#2a1a33" strokeWidth="3" />
          <path d={`M${x} ${y - 24} c8 8 8 16 0 22 c-8 -6 -8 -14 0 -22 z`} fill="#ffc35a" />
        </g>
      ))}

      {/* Floor and rug */}
      <rect y="418" width="720" height="142" fill={`url(#${id}-floor)`} />
      <path d="M0 418 H720" stroke="#2a1a14" strokeWidth="6" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${i * 100} 420 V560`} stroke="#4a3022" strokeWidth="3" opacity="0.6" />
      ))}
      <ellipse cx="360" cy="492" rx="300" ry="54" fill="#8e2f3a" stroke="#2a1a14" strokeWidth="5" />
      <ellipse cx="360" cy="492" rx="262" ry="40" fill="none" stroke="#e8b04a" strokeWidth="5" strokeDasharray="18 10" />

      {/* Ghostly mist */}
      <ellipse cx="160" cy="440" rx="200" ry="26" fill="#d9d2ff" opacity="0.18" />
      <ellipse cx="600" cy="452" rx="180" ry="22" fill="#d9d2ff" opacity="0.15" />
      <path d="M560 300 q30 -40 60 0 q-10 30 -30 20 q-20 10 -30 -20 z" fill="#efeaff" opacity="0.18" />
    </g>
  )
}

function Tower({ id }: { id: string }) {
  const merlons = Array.from({ length: 10 }, (_, i) => i * 80 - 10)
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a6e" />
          <stop offset="45%" stopColor="#d9705a" />
          <stop offset="80%" stopColor="#f6c177" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b48c6c" />
          <stop offset="100%" stopColor="#d2ad88" />
        </linearGradient>
        <radialGradient id={`${id}-lava`}>
          <stop offset="0%" stopColor="#ffb347" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff6a3d" stopOpacity="0" />
        </radialGradient>
        <Glow id={id} color="#ff9a3c" />
      </defs>
      <rect width="720" height="560" fill={`url(#${id}-sky)`} />
      <circle cx="360" cy="250" r="70" fill="#ffe3a3" opacity="0.8" />

      {/* Clouds */}
      <path d="M60 120 q20 -30 60 -14 q24 -26 56 0 q30 -6 34 18 z" fill="#f7c7a8" opacity="0.7" />
      <path d="M470 80 q22 -28 58 -12 q26 -22 54 4 q26 0 26 20 z" fill="#f7c7a8" opacity="0.6" />

      {/* Distant mountains and the volcano */}
      <path d="M0 300 L90 200 L170 270 L250 190 L330 290 Z" fill="#9a5562" />
      <path d="M430 300 L540 150 L580 160 L700 300 Z" fill="#874656" />
      <path d="M540 150 L560 168 L580 160" stroke="#ffb347" strokeWidth="6" fill="none" />
      <circle cx="560" cy="150" r="60" fill={`url(#${id}-lava)`} />
      <path d="M552 130 q-20 -40 10 -60 q-10 -30 24 -40" stroke="#6e4a5a" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M380 300 L470 230 L520 300 Z" fill="#7d4352" />

      {/* Battlement wall */}
      <rect y="290" width="720" height="130" fill="#b9937a" stroke="#3b2414" strokeWidth="5" />
      {merlons.map((x) => (
        <rect key={x} x={x} y="252" width="50" height="44" rx="4" fill="#c7a387" stroke="#3b2414" strokeWidth="5" />
      ))}
      {[0, 1].map((row) =>
        Array.from({ length: 10 }, (_, i) => (
          <rect key={`${row}-${i}`} x={i * 80 - 30 + row * 40} y={312 + row * 48} width="70" height="40" rx="6" fill="none" stroke="#9c7660" strokeWidth="3" />
        )),
      )}

      {/* Banners */}
      {[150, 570].map((x) => (
        <g key={x}>
          <path d={`M${x - 30} 300 h60 v96 l-30 -18 l-30 18 z`} fill="#b8323a" stroke="#3b2414" strokeWidth="5" strokeLinejoin="round" />
          <circle cx={x} cy="336" r="14" fill="#f5c344" stroke="#3b2414" strokeWidth="4" />
        </g>
      ))}

      {/* Broken pillar */}
      <g transform="rotate(14 640 420)">
        <rect x="610" y="250" width="58" height="170" fill="#e9dcc8" stroke="#3b2414" strokeWidth="5" />
        <path d="M624 254 V418 M640 254 V418 M654 254 V418" stroke="#cbb9a0" strokeWidth="3" />
        <path d="M604 250 l12 -16 l14 10 l12 -14 l16 12 l14 -6 v14 z" fill="#e9dcc8" stroke="#3b2414" strokeWidth="5" strokeLinejoin="round" />
      </g>

      {/* Braziers */}
      {[60, 430].map((x) => (
        <g key={x}>
          <circle cx={x} cy="372" r="60" fill={`url(#${id}-glow)`} />
          <path d={`M${x - 26} 384 h52 l-10 30 h-32 z`} fill="#5b4a42" stroke="#3b2414" strokeWidth="4" />
          <path d={`M${x} 336 c18 16 20 34 0 48 c-20 -14 -18 -32 0 -48 z`} fill="#f5762b" />
          <path d={`M${x} 356 c9 8 10 18 0 26 c-10 -8 -9 -18 0 -26 z`} fill="#ffd36e" />
        </g>
      ))}

      {/* Stone floor */}
      <rect y="418" width="720" height="142" fill={`url(#${id}-floor)`} />
      <path d="M0 418 H720" stroke="#3b2414" strokeWidth="6" />
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M${360 + (i - 5) * 70} 420 L${360 + (i - 5) * 150} 560`} stroke="#9e7a5e" strokeWidth="3" opacity="0.7" />
      ))}
      <path d="M0 462 H720 M0 516 H720" stroke="#9e7a5e" strokeWidth="3" opacity="0.7" />
      <ellipse cx="120" cy="532" rx="26" ry="10" fill="#8c6c54" stroke="#3b2414" strokeWidth="3" />
      <ellipse cx="590" cy="540" rx="34" ry="12" fill="#8c6c54" stroke="#3b2414" strokeWidth="3" />

      {/* Embers */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={jitter(i + 3) * 720} cy={120 + jitter(i + 40) * 280} r={2 + jitter(i + 80) * 3} fill="#ffcf70" opacity="0.8" />
      ))}
    </g>
  )
}
