import { useId } from 'react'
import { INK, Part } from './paint'

/**
 * The hero: a young scholar with a giant fountain pen raised in one hand and a
 * glowing spellbook held out toward the enemy in the other.
 *
 * Laid out on a 400×400 grid from a reference sheet, cell by cell: hair 27–160,
 * face 172–262 with the chin at 162, mantle to 208, belt 236–252, hem 292,
 * boots 320–380. The pen runs from its nib at (50, 20) to its cap at (120, 220).
 * Light comes from the upper right, toward the enemy.
 */

const HAIR = { base: '#b0682c', shade: '#6e3815', light: '#d8954a', shine: '#f2c47f' }
const SKIN = { base: '#f8cd9f', shade: '#e4a576', blush: '#f2907a' }
const BLUE = { base: '#2f5b94', shade: '#1b3762', light: '#7ea6d6' }
const GOLD = { base: '#e8b84f', shade: '#a8741f' }
const CREAM = { base: '#f4e3bf', shade: '#d2b88a' }
const LEATHER = { base: '#965a2d', shade: '#5e3418', light: '#c88a52' }
const GREEN = { base: '#4d6a4b', shade: '#33493a' }
const NAVY = { base: '#24384f', shade: '#121e2d' }

const LINE = 4
const DETAIL = 2.2

const FACE = 'M172 106 C172 84 192 70 218 70 C244 70 262 86 262 108 C262 128 256 146 242 156 C232 162 220 164 208 162 C190 158 176 146 172 128 Z'
/** Hair outline points, clockwise from the nape: [x, y, isTip]. Tips are the points of the locks. */
const HAIR_POINTS: [number, number, boolean][] = [
  [168, 120, false], [152, 126, false], [127, 124, true], [137, 116, false], [124, 104, true], [136, 98, false],
  [126, 82, true], [140, 80, false], [132, 64, true], [150, 64, false], [158, 36, true], [168, 52, false],
  [176, 33, true], [188, 46, false], [212, 24, true], [218, 40, false], [236, 34, true], [246, 42, false],
  [260, 35, true], [262, 52, false], [280, 60, true], [270, 72, false], [278, 88, true], [268, 96, false],
  [274, 112, true], [262, 110, false], [251, 106, true], [244, 92, false], [237, 103, true], [228, 86, false],
  [220, 99, true], [210, 84, false], [200, 101, true], [192, 86, false], [184, 103, true], [178, 96, false],
  [174, 114, true], [170, 126, false],
]
const HAIR_CENTER: [number, number] = [206, 100]

/**
 * Turns the outline points into flame-like locks: each edge bows outward on its
 * way up to a tip and dips slightly on the way back down, so every lock curls.
 */
function lockPath(points: [number, number, boolean][], [cx, cy]: [number, number]) {
  let d = `M${points[0][0]} ${points[0][1]}`
  points.forEach(([ax, ay, aTip], i) => {
    const [bx, by, bTip] = points[(i + 1) % points.length]
    const mx = (ax + bx) / 2
    const my = (ay + by) / 2
    const len = Math.hypot(bx - ax, by - ay) || 1
    let nx = (by - ay) / len
    let ny = -(bx - ax) / len
    if (nx * (mx - cx) + ny * (my - cy) < 0) {
      nx = -nx
      ny = -ny
    }
    const bulge = bTip ? 10 : aTip ? -6 : 2
    d += ` Q${(mx + nx * bulge).toFixed(1)} ${(my + ny * bulge).toFixed(1)} ${bx} ${by}`
  })
  return `${d} Z`
}

const HAIR_SHAPE = lockPath(HAIR_POINTS, HAIR_CENTER)

export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  const p = useId().replace(/[^\w-]/g, '')
  const fine = (color: string, width = DETAIL) =>
    ({ stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }) as const

  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '118 18 172 172' : '0 0 400 400'} className={className} aria-hidden>
      <defs>
        <radialGradient id={`${p}-glow`}>
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ffd970" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffbe4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b150a" />
          <stop offset="0.5" stopColor="#6e3d1b" />
          <stop offset="1" stopColor="#c98a42" />
        </linearGradient>
        <linearGradient id={`${p}-page`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f2d48c" />
          <stop offset="1" stopColor="#fffbea" />
        </linearGradient>
        <radialGradient id={`${p}-blush`}>
          <stop offset="0" stopColor={SKIN.blush} stopOpacity="0.55" />
          <stop offset="1" stopColor={SKIN.blush} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cape: a wing sweeping out behind the pen arm, and a tail on the far side */}
      <Part
        d="M168 196 C150 214 120 236 96 258 C80 272 70 288 78 302 C90 292 110 286 130 292 C140 296 150 300 156 304 L262 304 C270 310 278 316 286 320 C292 300 290 276 282 248 C276 226 268 208 256 196 Z"
        fill={BLUE.base}
        shade={BLUE.shade}
        depth={12}
        line={LINE}
        fromRight
      >
        <path d="M96 258 C80 272 70 288 78 302 C88 290 100 278 116 266 C128 258 140 250 152 244 C132 246 112 250 96 258 Z" fill={BLUE.light} />
        <path d="M268 230 C274 254 278 280 280 306" {...fine(BLUE.shade, 2.5)} />
      </Part>
      <path d="M78 302 C88 290 100 278 116 266 C128 258 140 250 152 244" {...fine(GOLD.base, 3.5)} />
      <path d="M282 250 C290 276 292 300 286 320" {...fine(GOLD.base, 3.5)} />

      {/* Legs and boots, planted wide with the toes turned out */}
      <Part d="M162 288 L197 288 C195 300 191 312 189 324 L155 324 C155 312 158 300 162 288 Z" fill={GREEN.base} shade={GREEN.shade} depth={7} line={LINE} fromRight />
      <Part d="M213 288 L250 288 C252 298 256 310 261 322 L230 326 C226 314 220 300 213 288 Z" fill={GREEN.base} shade={GREEN.shade} depth={7} line={LINE} fromRight />
      <Part
        d="M150 340 C150 350 146 356 134 360 C120 364 114 372 120 376 C124 379 132 379 140 379 L174 379 C181 378 185 370 185 360 L187 340 Z"
        fill={LEATHER.base}
        shade={LEATHER.shade}
        depth={7}
        line={LINE}
        fromRight
      >
        <path d="M118 375 L186 375" {...fine('#3e2010', 5)} />
        <path d="M128 364 C138 362 146 360 152 354" {...fine(LEATHER.light, 2.5)} />
      </Part>
      <Part
        d="M236 342 C236 354 238 364 242 372 C246 378 256 380 280 380 C292 380 295 370 285 364 C275 358 269 350 267 338 Z"
        fill={LEATHER.base}
        shade={LEATHER.shade}
        depth={7}
        line={LINE}
        fromRight
      >
        <path d="M240 376 L292 376" {...fine('#3e2010', 5)} />
        <path d="M262 352 C266 360 272 364 280 366" {...fine(LEATHER.light, 2.5)} />
      </Part>
      <Part d="M148 320 L191 322 L189 343 L146 341 Z" fill={LEATHER.light} shade={LEATHER.base} depth={5} line={3.5} fromRight>
        <path d="M150 330 L188 332" {...fine(LEATHER.base, 2)} />
      </Part>
      <Part d="M229 322 L265 317 L269 338 L233 343 Z" fill={LEATHER.light} shade={LEATHER.base} depth={5} line={3.5} fromRight>
        <path d="M232 332 L266 327" {...fine(LEATHER.base, 2)} />
      </Part>

      {/* Tunic skirt flaring below the belt */}
      <Part
        d="M170 250 L248 250 C252 260 255 268 253 276 C247 284 240 290 232 292 L180 292 C170 290 160 284 150 276 C156 266 162 258 170 250 Z"
        fill={CREAM.base}
        shade={CREAM.shade}
        depth={9}
        line={LINE}
        fromRight
      >
        <path d="M206 254 V292 M178 262 C176 272 172 280 166 286 M234 262 C238 272 242 278 248 282" {...fine(CREAM.shade)} />
      </Part>
      <Part d="M226 252 C224 264 226 274 232 278 L248 278 C253 270 253 262 250 252 Z" fill={LEATHER.base} shade={LEATHER.shade} depth={5} line={3.5} fromRight>
        <path d="M226 258 C234 263 243 263 251 258" {...fine(LEATHER.shade, 2.5)} />
      </Part>
      <circle cx="238" cy="262" r="2.8" fill={GOLD.base} stroke={INK} strokeWidth="1.8" />

      {/* Tunic chest and belt */}
      <Part d="M168 196 C166 214 168 228 170 238 L246 238 C249 226 251 212 250 196 Z" fill={CREAM.base} shade={CREAM.shade} depth={8} line={LINE} fromRight>
        <path d="M206 206 V236" {...fine(CREAM.shade)} />
      </Part>
      <path d="M200 210 L212 224 M212 210 L200 224" {...fine('#9a7b4f', 2.6)} />
      <Part d="M168 236 C190 242 226 242 248 236 L248 252 C226 257 190 257 168 252 Z" fill={LEATHER.base} shade={LEATHER.shade} depth={4} line={3.5} fromRight />
      <Part d="M186 236 h20 v18 h-20 z" fill={GOLD.base} shade={GOLD.shade} depth={3} line={3} fromRight>
        <path d="M191 241 h10 v8 h-10 z" fill={LEATHER.shade} />
      </Part>

      {/* Near arm, reaching out under the book */}
      <Part d="M248 200 C262 204 272 216 280 232 L289 246 L276 253 C268 238 258 226 246 220 Z" fill={CREAM.base} shade={CREAM.shade} depth={6} line={LINE} fromRight />

      {/* Hooded mantle with a gold clasp */}
      <Part d="M176 162 L240 162 L248 176 L168 178 Z" fill={BLUE.shade} shade="#10223d" depth={4} line={LINE} fromRight />
      <Part d="M198 152 L198 170 L222 170 L222 152 Z" fill={SKIN.base} shade={SKIN.shade} depth={8} line={3.5} fromRight />
      <Part
        d="M168 172 C158 178 150 186 150 196 C162 204 176 210 190 206 C198 204 202 198 206 194 C210 198 216 204 224 206 C238 210 252 204 262 194 C262 184 256 176 246 170 C236 178 222 182 206 182 C190 182 176 178 168 172 Z"
        fill={BLUE.base}
        shade={BLUE.shade}
        depth={8}
        line={LINE}
        fromRight
      >
        <path d="M176 178 C182 186 186 192 188 200 M236 176 C232 186 228 194 224 202" {...fine(BLUE.shade, 2.4)} />
        <path d="M222 178 C232 178 242 182 250 190" {...fine(BLUE.light, 3)} opacity="0.7" />
      </Part>
      <path d="M150 196 C162 204 176 210 190 206 C198 204 202 198 206 194 C210 198 216 204 224 206 C238 210 252 204 262 194" {...fine(GOLD.base, 4.5)} />
      <Part d="M206 176 a8 8 0 1 0 0.1 0 Z" fill={GOLD.base} shade={GOLD.shade} depth={4} line={3} glint="M202 180 a2.6 2.6 0 1 0 0.1 0 Z" fromRight />

      {/* Face */}
      <Part d={FACE} fill={SKIN.base} shade={SKIN.shade} depth={8} line={LINE} fromRight>
        {/* The hair's shadow across the forehead and down by the ear */}
        <path d="M172 98 C196 108 236 108 262 100 L262 70 L172 70 Z" fill={SKIN.shade} opacity="0.7" />
        <path d="M172 110 C176 126 182 140 192 150 C184 150 176 140 172 128 Z" fill={SKIN.shade} opacity="0.6" />
        <ellipse cx="194" cy="142" rx="13" ry="8" fill={`url(#${p}-blush)`} />
        <ellipse cx="252" cy="140" rx="9" ry="7" fill={`url(#${p}-blush)`} />
      </Part>
      <Part d="M176 122 C164 114 152 122 154 136 C156 148 166 152 176 146 Z" fill={SKIN.base} shade={SKIN.shade} depth={4} line={3.5} fromRight>
        <path d="M168 128 C162 130 162 138 166 142" {...fine('#c27a55', 2)} />
      </Part>

      {/* Eyes: the near one wide, the far one narrowed by the turn of the head */}
      {[
        { cx: 205, cy: 126, rx: 13, ry: 16, ir: 0.78 },
        { cx: 245, cy: 124, rx: 9, ry: 14.5, ir: 0.82 },
      ].map(({ cx, cy, rx, ry, ir }) => (
        <g key={cx}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffdf8" />
          <ellipse cx={cx + rx * 0.22} cy={cy + 1.5} rx={rx * ir} ry={ry * 0.78} fill={`url(#${p}-iris)`} />
          <ellipse cx={cx + rx * 0.28} cy={cy + 2.5} rx={rx * 0.36} ry={ry * 0.38} fill="#140904" />
          <circle cx={cx - rx * 0.12} cy={cy - ry * 0.3} r={rx * 0.32} fill="#fff" />
          <circle cx={cx + rx * 0.5} cy={cy + ry * 0.42} r={rx * 0.13} fill="#fff" />
          <path d={`M${cx - rx - 1.5} ${cy - 2} C${cx - rx + 2} ${cy - ry - 2.5} ${cx + rx - 2} ${cy - ry - 2.5} ${cx + rx + 1.5} ${cy - 4}`} {...fine(INK, 4.2)} />
          <path d={`M${cx - rx * 0.55} ${cy + ry - 1} C${cx - 2} ${cy + ry + 2} ${cx + rx * 0.5} ${cy + ry + 1} ${cx + rx * 0.82} ${cy + ry - 3}`} {...fine('#b06a4a', 1.6)} />
        </g>
      ))}
      <path d="M216 117 l5 -4" {...fine(INK, 2.4)} />

      {/* Nose and a friendly smile */}
      <path d="M234 134 C238 138 238 142 233 144" {...fine('#c27a55', 2.4)} />
      <circle cx="235" cy="136" r="1.5" fill="#fff6ea" />
      <path d="M207 149 C213 154 222 154 228 148" {...fine('#7a3426', 2.8)} />

      {/* Messy hair: spiky locks all round and a fringe falling over the brow */}
      <Part d={HAIR_SHAPE} fill={HAIR.base} shade={HAIR.shade} depth={11} line={LINE} fromRight>
        <path d="M174 112 L178 96 L184 101 L192 86 L194 104 C188 108 180 112 174 112 Z" fill={HAIR.shade} opacity="0.85" />
        {/* The crown catches the light */}
        <path d="M168 64 C180 46 212 38 240 44 C254 48 262 56 264 66 C248 60 228 58 208 62 C192 64 178 68 168 64 Z" fill={HAIR.light} />
        <path d="M180 56 C194 48 212 45 228 47" {...fine(HAIR.shine, 3.4)} />
        <path d="M238 52 C248 54 255 59 258 64" {...fine(HAIR.shine, 2.6)} />
        <path d="M144 74 C150 70 156 69 162 70" {...fine(HAIR.light, 3)} />
      </Part>
      {/* Lock separations traced from the reference's head grid, cell by cell */}
      <path
        d="M190 46 C186 56 180 64 172 72 M212 28 C210 42 206 54 200 66 M236 37 C240 49 244 60 250 70 M261 54 C262 64 265 71 270 76 M160 40 C162 53 166 63 172 72 M134 66 C146 72 154 80 160 90 M128 84 C140 88 150 96 158 106 M126 106 C138 108 148 114 154 124"
        {...fine('#4e260f', 2.2)}
      />
      <path d="M190 88 C190 94 188 98 184 103 M210 86 C208 92 205 96 200 101 M228 88 C226 94 224 97 220 99 M244 94 C246 98 248 102 251 106" {...fine('#4e260f', 2)} />

      {/* Brows peek over the fringe, as is usual in this style */}
      <path d="M192 104 C198 99 208 98 216 101 C208 101 200 103 194 107 Z" fill="#4a2410" stroke="#4a2410" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M237 101 C243 97 251 97 256 101 C250 101 244 102 239 104 Z" fill="#4a2410" stroke="#4a2410" strokeWidth="2.4" strokeLinejoin="round" />

      {/* The open spellbook, glowing */}
      <circle cx="306" cy="180" r="74" fill={`url(#${p}-glow)`} />
      <Part
        d="M256 186 L356 168 C360 176 352 196 336 216 C326 230 318 244 312 250 L266 254 C260 240 256 214 256 186 Z"
        fill={NAVY.base}
        shade={NAVY.shade}
        depth={7}
        line={LINE}
        fromRight
      >
        <path d="M290 214 C300 206 312 208 316 218 C312 226 300 228 292 222" {...fine(GOLD.base, 3)} />
        <path d="M262 196 L350 178 M264 204 L344 188" {...fine('#3c5674', 2)} />
      </Part>
      <path
        d="M258 186 C264 170 282 158 300 162 C316 150 338 148 357 158 L356 168 C334 164 316 168 302 176 C286 172 270 176 258 186 Z"
        fill={`url(#${p}-page)`}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M264 180 C274 168 288 164 300 168 M304 170 C318 160 336 158 352 162 M300 162 L302 176" {...fine('#d9b46a', 1.8)} />
      <Part d="M284 244 C286 236 296 234 300 240 C304 234 312 236 312 244 C314 252 306 260 296 260 C288 260 282 252 284 244 Z" fill={SKIN.base} shade={SKIN.shade} depth={4} line={3.5} fromRight>
        <path d="M296 242 V252 M304 242 V252" {...fine('#c27a55', 1.8)} />
      </Part>
      {[
        [300, 145, 4],
        [316, 158, 3],
        [330, 146, 3.5],
        [288, 154, 2.5],
        [322, 128, 2.5],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#fff3b0" stroke="#e0a83a" strokeWidth="1.2" />
      ))}

      {/* Far arm raising the pen, with a leather bracer */}
      <Part d="M176 200 C162 192 150 190 138 192 L136 214 C148 216 162 218 174 222 Z" fill={CREAM.base} shade={CREAM.shade} depth={6} line={LINE} fromRight />
      <Part d="M118 188 L140 190 L140 214 L120 214 Z" fill={LEATHER.base} shade={LEATHER.shade} depth={4} line={3.5} fromRight>
        <path d="M121 196 L139 197 M121 206 L139 207" {...fine(LEATHER.light, 1.8)} />
      </Part>

      {/* Giant fountain pen, measured along its own axis from the nib */}
      <g transform="translate(50 20) rotate(-19.3)">
        <Part d="M-14 76 h28 v122 a8 8 0 0 1 -8 8 h-12 a8 8 0 0 1 -8 -8 z" fill={NAVY.base} shade={NAVY.shade} depth={7} line={LINE} fromRight>
          <path d="M5 82 V198" {...fine('#7d97c4', 3.2)} />
        </Part>
        <Part d="M-15 98 h30 v10 h-30 z" fill={GOLD.base} shade={GOLD.shade} depth={2} line={3} fromRight />
        <Part d="M-12 60 h24 v18 h-24 z" fill={GOLD.base} shade={GOLD.shade} depth={3} line={3} fromRight>
          <path d="M-12 66 h24 M-12 72 h24" {...fine(GOLD.shade, 1.6)} />
        </Part>
        <Part
          d="M0 0 C6 14 14 28 16 40 C15 50 12 56 11 62 L-11 62 C-12 56 -15 50 -16 40 C-14 28 -6 14 0 0 Z"
          fill={GOLD.base}
          shade={GOLD.shade}
          depth={6}
          line={LINE}
          glint="M4 12 C9 24 12 34 12 46 L8 46 C8 34 6 24 4 12 Z"
          fromRight
        >
          <path d="M0 6 V34" {...fine('#5a3a10', 2)} />
        </Part>
        <circle cx="0" cy="36" r="3.4" fill={INK} />
        <Part d="M0 198 a10 10 0 1 0 0.1 0 Z" fill={GOLD.base} shade={GOLD.shade} depth={4} line={3} fromRight />
      </g>

      {/* The fist around the barrel */}
      <Part d="M90 186 C88 174 100 168 112 170 C122 172 126 182 124 194 C122 204 112 208 102 206 C94 204 90 196 90 186 Z" fill={SKIN.base} shade={SKIN.shade} depth={5} line={3.5} fromRight>
        <path d="M94 186 C102 186 112 188 122 190 M94 195 C102 196 110 198 118 200" {...fine('#c27a55', 1.8)} />
      </Part>
      <path d="M100 172 C108 170 116 172 120 178" {...fine('#c27a55', 1.8)} />
    </svg>
  )
}
