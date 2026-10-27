import { useId } from 'react'

const INK = '#3b2414'

/**
 * The hero: a young scholar-knight who fights with a giant fountain pen and a
 * glowing spellbook. Drawn at 400×400 and lit from the upper right, with warm
 * bounce light from the open book on his lower left.
 */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  const p = useId().replace(/[^\w-]/g, '')
  const u = (name: string) => `url(#${p}-${name})`
  const line = { stroke: INK, strokeWidth: 4.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const
  const fine = (color: string, width = 2) =>
    ({ stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }) as const

  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '128 18 156 156' : '0 0 400 400'} className={className} aria-hidden>
      <defs>
        <linearGradient id={`${p}-skin`} x1="1" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#fde3c6" />
          <stop offset="0.55" stopColor="#f6c9a2" />
          <stop offset="1" stopColor="#e3a47c" />
        </linearGradient>
        <linearGradient id={`${p}-hair`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a5a2e" />
          <stop offset="0.5" stopColor="#6e3b1d" />
          <stop offset="1" stopColor="#3f2010" />
        </linearGradient>
        <linearGradient id={`${p}-cape`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a7fe0" />
          <stop offset="1" stopColor="#1f3f8f" />
        </linearGradient>
        <linearGradient id={`${p}-lining`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8394a" />
          <stop offset="1" stopColor="#5e1d2a" />
        </linearGradient>
        <linearGradient id={`${p}-vest`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f5aa6" />
          <stop offset="1" stopColor="#1b2852" />
        </linearGradient>
        <linearGradient id={`${p}-shirt`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#d9cbb0" />
        </linearGradient>
        <linearGradient id={`${p}-leather`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a0683c" />
          <stop offset="1" stopColor="#4e2c16" />
        </linearGradient>
        <linearGradient id={`${p}-trousers`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4a44" />
          <stop offset="1" stopColor="#2a201d" />
        </linearGradient>
        <linearGradient id={`${p}-gold`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0b0" />
          <stop offset="0.45" stopColor="#f1c454" />
          <stop offset="1" stopColor="#a8741f" />
        </linearGradient>
        <linearGradient id={`${p}-barrel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#141c3c" />
          <stop offset="0.35" stopColor="#2c3f86" />
          <stop offset="0.55" stopColor="#6d86d6" />
          <stop offset="1" stopColor="#1a2550" />
        </linearGradient>
        <linearGradient id={`${p}-page`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="1" stopColor="#f3dfae" />
        </linearGradient>
        <linearGradient id={`${p}-iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a160b" />
          <stop offset="0.6" stopColor="#7a4a22" />
          <stop offset="1" stopColor="#c9893f" />
        </linearGradient>
        <linearGradient id={`${p}-beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe9a0" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${p}-bookglow`}>
          <stop offset="0" stopColor="#fff3b8" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffd66b" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb84a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-nibglow`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#bfe0ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8ec5ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-blush`}>
          <stop offset="0" stopColor="#f08a8a" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f08a8a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm light pouring up out of the book */}
      <circle cx="112" cy="232" r="96" fill={u('bookglow')} />
      <path d="M70 232 L30 60 L190 60 L152 232 Z" fill={u('beam')} opacity="0.55" />

      {/* Cape: lining on the near edge, blue outside, gold trim */}
      <path
        d="M178 168 C150 186 114 252 88 358 C112 370 138 364 156 374 C170 364 180 352 188 338 L252 338 C256 352 262 364 272 368 C278 318 272 236 250 170 Z"
        fill={u('cape')}
        {...line}
      />
      <path d="M94 354 C118 262 146 204 174 178 C160 222 150 292 154 372 C138 364 114 368 94 354 Z" fill={u('lining')} />
      <path d="M150 300 C150 250 156 214 170 186 M128 330 C136 280 148 236 164 200" {...fine('#3e121b', 2)} />
      <path d="M88 358 C112 370 138 364 156 374" {...fine('#f1c454', 4)} />
      <path d="M94 354 C118 262 146 204 174 178" {...fine('#ffd27a', 2.5)} opacity="0.8" />
      <path d="M256 200 C262 250 266 300 264 350" {...fine('#16306e', 2.5)} />

      {/* Far leg and boot */}
      <path d="M172 280 C168 302 168 324 171 344 L196 344 C197 324 199 302 202 280 Z" fill={u('trousers')} {...line} />
      <path d="M166 338 C165 356 164 368 162 378 C161 386 168 390 178 390 L204 390 C212 390 212 380 204 376 C198 372 196 358 197 338 Z" fill={u('leather')} {...line} />
      <path d="M164 338 h36 v12 h-36 z" fill="#8a5630" {...line} strokeWidth={3.5} />
      <path d="M162 384 L208 384" {...fine('#2a160b', 3)} />

      {/* Near leg and boot */}
      <path d="M206 280 C210 302 215 324 219 344 L245 344 C243 322 239 300 236 280 Z" fill={u('trousers')} {...line} />
      <path d="M222 300 C226 316 230 330 232 342" {...fine('#1c1412', 2)} />
      <path d="M214 338 C214 356 216 368 214 378 C213 386 220 390 230 390 L264 390 C273 390 273 380 264 376 C254 372 248 358 247 338 Z" fill={u('leather')} {...line} />
      <path d="M212 338 h38 v12 h-38 z" fill="#8a5630" {...line} strokeWidth={3.5} />
      <path d="M218 356 C220 364 222 370 222 376" {...fine('#c48a55', 2.5)} />
      <path d="M214 384 L268 384" {...fine('#2a160b', 3)} />

      {/* Doublet skirt below the belt */}
      <path d="M168 258 C163 274 159 290 157 300 C190 310 232 310 254 298 C250 286 246 272 243 258 Z" fill={u('vest')} {...line} />
      <path d="M206 262 L204 306" {...fine('#121a38', 2.5)} />
      <path d="M160 294 C190 304 230 304 252 292" {...fine('#f1c454', 3)} />

      {/* Far arm, holding the book */}
      <path d="M168 184 C152 186 141 202 136 224 C133 236 146 242 153 233 C157 218 163 206 174 200 Z" fill={u('shirt')} {...line} />
      <path d="M136 224 C131 238 127 247 121 253 C116 260 125 268 134 262 C143 254 151 242 153 233 Z" fill={u('shirt')} {...line} />
      <path d="M143 214 C147 222 148 228 147 234" {...fine('#b8a582', 2)} />

      {/* Torso: shirt, open vest, buttons and belt */}
      <path d="M160 178 C156 210 162 238 168 262 L244 262 C248 236 252 208 252 178 C236 168 178 168 160 178 Z" fill={u('shirt')} {...line} />
      <path d="M160 178 C156 210 162 238 168 262 L196 262 C194 232 192 204 194 176 C182 172 168 174 160 178 Z" fill={u('vest')} {...line} />
      <path d="M252 178 C252 208 248 236 244 262 L216 262 C214 232 214 204 216 176 C230 172 244 174 252 178 Z" fill={u('vest')} {...line} />
      <path d="M170 196 C172 220 176 240 180 258 M240 196 C240 220 238 240 236 258" {...fine('#121a38', 2)} />
      <path d="M248 186 C248 210 246 232 242 254" {...fine('#7d97e0', 2.5)} opacity="0.8" />
      {[204, 222, 240].map((y) => (
        <g key={y}>
          <circle cx="198" cy={y} r="3.6" fill={u('gold')} stroke={INK} strokeWidth="1.8" />
          <circle cx="214" cy={y} r="3.6" fill={u('gold')} stroke={INK} strokeWidth="1.8" />
        </g>
      ))}
      <path d="M205 186 C206 210 206 236 206 258" {...fine('#c9b893', 2)} />
      <path d="M164 254 C190 262 222 262 248 254 L249 270 C222 278 190 278 163 270 Z" fill={u('leather')} {...line} />
      <path d="M194 252 h24 v22 h-24 z" fill={u('gold')} {...line} strokeWidth={3.5} />
      <path d="M200 258 h12 v10 h-12 z" fill="none" stroke="#8a5a1c" strokeWidth="2.5" />
      {/* Belt pouch and a little ink vial */}
      <path d="M226 270 C224 286 226 296 232 300 L250 300 C254 292 254 282 250 270 Z" fill={u('leather')} {...line} strokeWidth={3.5} />
      <path d="M226 278 h26" {...fine('#2a160b', 2.5)} />
      <path d="M172 272 v10 M168 282 h8 v16 a4 4 0 0 1 -8 0 z" fill="#4a2a6a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Shoulder mantle with a gold clasp */}
      <path
        d="M170 164 C184 176 230 176 246 162 C262 168 270 182 264 196 C240 206 182 208 154 198 C148 184 156 170 170 164 Z"
        fill={u('cape')}
        {...line}
      />
      <path d="M156 196 C182 206 240 204 263 194" {...fine('#f1c454', 4)} />
      <path d="M190 182 C196 190 200 196 202 202 M236 178 C238 186 238 192 236 198" {...fine('#1b3577', 2)} />
      <circle cx="210" cy="192" r="10" fill={u('gold')} {...line} strokeWidth={3} />
      <circle cx="210" cy="192" r="4.5" fill="#d9465a" stroke={INK} strokeWidth="1.8" />
      <circle cx="208.5" cy="190.5" r="1.4" fill="#fff" />

      {/* Neck and collar */}
      <path d="M196 146 L196 170 C204 176 214 176 222 170 L222 146 Z" fill={u('skin')} {...line} strokeWidth={3.5} />
      <path d="M196 156 C204 162 214 162 222 154 L222 146 L196 146 Z" fill="#c98a66" opacity="0.6" />
      <path d="M188 158 L196 176 L208 170 L220 178 L230 160 L224 172 L208 166 L192 172 Z" fill={u('shirt')} {...line} strokeWidth={3} />

      {/* Hair behind the head */}
      <path d="M150 96 C136 130 142 160 164 170 C168 152 166 132 170 114 Z" fill={u('hair')} {...line} />

      {/* Face, turned three-quarters toward the enemy */}
      <path
        d="M152 104 C150 70 174 46 206 46 C240 46 262 72 262 104 C262 128 254 146 238 156 C228 162 214 165 204 160 C178 152 154 134 152 104 Z"
        fill={u('skin')}
        {...line}
      />
      {/* Shadow from the hair and on the far side of the face */}
      <path d="M154 108 C156 132 176 150 200 158 C186 146 176 128 172 108 C166 112 160 112 154 108 Z" fill="#d8946e" opacity="0.55" />
      <path d="M176 92 C196 86 230 84 256 96 C248 88 240 84 230 84 C210 80 188 84 176 92 Z" fill="#c98462" opacity="0.5" />
      <ellipse cx="188" cy="130" rx="13" ry="8" fill={u('blush')} />
      <ellipse cx="248" cy="128" rx="10" ry="7" fill={u('blush')} />

      {/* Ear */}
      <path d="M160 106 C148 100 142 112 146 124 C149 134 158 138 164 132" fill={u('skin')} {...line} strokeWidth={3.5} />
      <path d="M156 112 C152 114 152 122 156 126" {...fine('#b56a4f', 2)} />

      {/* Eyes: near one larger, both looking toward the enemy */}
      <path d="M219 104 C226 95 244 95 252 103 C249 117 239 123 229 121 C222 119 219 112 219 104 Z" fill="#fff" />
      <ellipse cx="238" cy="110" rx="8.5" ry="10.5" fill={u('iris')} />
      <circle cx="239" cy="111" r="4" fill="#140a05" />
      <circle cx="235" cy="106" r="3" fill="#fff" />
      <circle cx="242" cy="115" r="1.4" fill="#fff" />
      <path d="M217 104 C226 94 244 94 253 102" {...fine(INK, 3.8)} />
      <path d="M251 102 l6 -3" {...fine(INK, 2.4)} />
      <path d="M224 121 C232 124 243 121 249 113" {...fine('#a8644a', 1.6)} />

      <path d="M185 106 C191 98 203 98 209 104 C207 116 200 121 193 120 C187 118 185 113 185 106 Z" fill="#fff" />
      <ellipse cx="200" cy="110" rx="7" ry="10" fill={u('iris')} />
      <circle cx="201" cy="111" r="3.5" fill="#140a05" />
      <circle cx="197.5" cy="106" r="2.6" fill="#fff" />
      <path d="M183 106 C190 97 203 97 211 103" {...fine(INK, 3.6)} />
      <path d="M188 119 C195 122 202 121 207 115" {...fine('#a8644a', 1.6)} />

      {/* Nose and a confident half-smile */}
      <path d="M252 116 C257 123 256 129 249 131" {...fine('#a8644a', 2.4)} />
      <path d="M228 141 C235 147 244 146 250 139" {...fine('#7a3a2a', 2.8)} />
      <path d="M236 149 C240 150 243 149 245 147" {...fine('#c98468', 1.6)} />

      {/* Hair: layered locks swept toward the enemy, with a sheen */}
      <path
        d="M140 112 C126 70 150 28 202 24 C250 20 280 50 276 94 C275 104 270 112 262 120 C259 98 251 84 240 76 C242 86 238 92 230 96 C226 86 218 80 206 76 C206 86 199 92 190 96 C190 86 184 80 174 80 C168 96 163 110 162 128 C152 132 144 124 140 112 Z"
        fill={u('hair')}
        {...line}
      />
      <path d="M262 120 C266 106 270 96 276 94 M240 76 C254 66 268 72 276 86 M206 76 C216 64 232 60 246 66" {...fine('#2e170a', 2)} />
      <path d="M174 80 C178 64 190 56 206 56 M190 96 C192 88 198 80 206 76 M150 100 C150 76 162 58 180 48" {...fine('#2e170a', 2)} />
      <path d="M168 54 C186 38 214 34 238 42" {...fine('#c98a4e', 5)} opacity="0.75" />
      <path d="M190 44 C204 40 220 40 232 44" {...fine('#f0c08a', 2.5)} opacity="0.9" />
      <path d="M196 26 C204 14 216 10 226 12 C220 18 216 24 214 30" fill={u('hair')} {...line} strokeWidth={3.5} />

      {/* Brows sit over the fringe, as is usual in this style */}
      <path d="M218 85 C228 78 243 78 253 85 C243 83 230 83 220 88 Z" fill="#4a2814" stroke="#4a2814" strokeWidth="2" strokeLinejoin="round" />
      <path d="M183 89 C189 83 200 82 208 84 C200 85 192 86 185 91 Z" fill="#4a2814" stroke="#4a2814" strokeWidth="2" strokeLinejoin="round" />

      {/* The open spellbook, held out in his far hand */}
      <path d="M56 224 L110 238 L164 224 L162 254 L110 266 L58 254 Z" fill={u('lining')} {...line} />
      <path d="M60 250 L110 262 L160 250 L160 256 L110 268 L60 256 Z" fill="#f3dfae" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 220 C80 211 98 215 110 228 L110 252 C98 242 82 240 64 246 Z" fill={u('page')} {...line} strokeWidth={3.5} />
      <path d="M158 220 C140 211 122 215 110 228 L110 252 C122 242 138 240 156 246 Z" fill={u('page')} {...line} strokeWidth={3.5} />
      <path d="M72 226 q14 -5 28 3 M72 233 q14 -5 28 3 M74 240 q12 -4 24 3" {...fine('#c9a36a', 2)} />
      <path d="M120 229 q14 -8 28 -3 M120 236 q14 -8 28 -3" {...fine('#c9a36a', 2)} />
      <circle cx="134" cy="240" r="5" fill="none" stroke="#e0a83a" strokeWidth="2" />
      <path d="M56 224 l8 2 v8 M164 224 l-8 2 v8" {...fine('#f1c454', 3)} />
      <path d="M118 262 C122 268 132 268 136 260 C138 254 132 250 126 254" fill={u('skin')} {...line} strokeWidth={3} />

      {/* Letters rising from the pages */}
      {(
        [
          ['W', 92, 196, 22, -12],
          ['A', 122, 176, 18, 8],
          ['R', 84, 158, 15, -6],
          ['D', 136, 140, 13, 12],
        ] as const
      ).map(([letter, x, y, size, turn]) => (
        <text
          key={letter}
          x={x}
          y={y}
          fontSize={size}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          fill="#fff4c2"
          stroke="#c98a1c"
          strokeWidth="1.2"
          transform={`rotate(${turn} ${x} ${y})`}
        >
          {letter}
        </text>
      ))}
      {[
        [70, 206, 5],
        [150, 196, 4],
        [104, 128, 3.5],
        [60, 176, 3],
      ].map(([x, y, r]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - r * 2} L${x + r * 0.5} ${y - r * 0.5} L${x + r * 2} ${y} L${x + r * 0.5} ${y + r * 0.5} L${x} ${y + r * 2} L${x - r * 0.5} ${y + r * 0.5} L${x - r * 2} ${y} L${x - r * 0.5} ${y - r * 0.5} Z`}
          fill="#fffbe0"
        />
      ))}

      {/* Near arm, raising the pen */}
      <path d="M244 180 C262 176 277 190 289 214 C293 224 285 234 275 230 C265 214 253 205 240 201 Z" fill={u('shirt')} {...line} />
      <path d="M275 230 C283 214 288 200 292 188 C296 180 307 182 306 192 C304 207 298 222 289 234 C285 240 277 238 275 230 Z" fill={u('shirt')} {...line} />
      <path d="M284 196 C292 196 300 198 306 202 L304 208 C298 204 290 202 283 202 Z" fill={u('vest')} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M258 196 C268 204 276 214 282 224" {...fine('#b8a582', 2)} />

      {/* Giant fountain pen */}
      <circle cx="381" cy="37" r="22" fill={u('nibglow')} />
      <g transform="rotate(28 302 184)">
        <rect x="294" y="196" width="16" height="16" rx="6" fill={u('gold')} {...line} strokeWidth={3.5} />
        <rect x="293" y="86" width="18" height="114" rx="7" fill={u('barrel')} {...line} strokeWidth={3.5} />
        <path d="M297 94 v96" {...fine('#9fb3ee', 2.5)} opacity="0.85" />
        <rect x="292" y="78" width="20" height="12" rx="3" fill={u('gold')} {...line} strokeWidth={3} />
        <path d="M295 78 L297 62 L307 62 L309 78 Z" fill="#1a1a24" {...line} strokeWidth={3} />
        <path d="M294 62 C294 42 299 28 302 14 C305 28 310 42 310 62 Z" fill={u('gold')} {...line} strokeWidth={3} />
        <path d="M302 24 V52" {...fine(INK, 1.8)} />
        <circle cx="302" cy="52" r="2.6" fill={INK} />
        <path d="M298 36 C298 46 299 52 299 58" {...fine('#fff6d0', 1.8)} />
      </g>
      <path d="M388 18 L390 30 L402 32 L390 34 L388 46 L386 34 L374 32 L386 30 Z" fill="#ffffff" />

      {/* The fist wrapped around the barrel */}
      <path d="M290 188 C287 176 295 167 306 168 C317 170 321 180 317 191 C313 199 299 200 290 188 Z" fill={u('skin')} {...line} strokeWidth={3.5} />
      <path d="M296 176 C302 178 308 180 314 180 M294 184 C300 186 308 188 314 188" {...fine('#b56a4f', 1.8)} />
      <path d="M306 168 C310 172 312 176 312 180" {...fine('#fff1df', 2)} opacity="0.8" />
    </svg>
  )
}
