import type { ReactNode } from 'react'
import type { EnemyDef } from './battle'
import { Blush, Eye, Glow, Ink, Limb, Part, Twinkle } from './paint'
import { circ, ell } from './shapes'

/**
 * Every enemy, drawn at 200×200 facing left toward the hero, standing on y ≈ 190.
 * `face` is the square the portrait crops to: x, y and size.
 */
interface Art {
  draw: () => ReactNode
  face: [number, number, number]
}

const ART: Record<string, Art> = {
  Rat: { draw: rat, face: [22, 40, 112] },
  Spider: { draw: spider, face: [40, 82, 104] },
  Bat: { draw: bat, face: [48, 52, 104] },
  Snake: { draw: snake, face: [20, 34, 104] },
  'Toad King': { draw: toadKing, face: [34, 20, 136] },
  Ghost: { draw: ghost, face: [40, 34, 116] },
  Skeleton: { draw: skeleton, face: [44, 12, 112] },
  Zombie: { draw: zombie, face: [52, 28, 96] },
  Vampire: { draw: vampire, face: [56, 24, 88] },
  Witch: { draw: witch, face: [56, 22, 96] },
  Goblin: { draw: goblin, face: [36, 32, 112] },
  Wolf: { draw: wolf, face: [20, 18, 112] },
  Scorpion: { draw: scorpion, face: [50, 114, 72] },
  Ogre: { draw: ogre, face: [60, 32, 84] },
  Dragon: { draw: dragon, face: [12, 2, 124] },
}

/** An enemy's illustration, or just its face for portraits; falls back to its emoji. */
export function EnemySprite({ enemy, portrait = false, className }: { enemy: EnemyDef; portrait?: boolean; className?: string }) {
  const art = ART[enemy.name]
  if (!art) {
    return (
      <span className={`grid place-items-center leading-none ${className ?? ''}`} style={{ fontSize: portrait ? 60 : 170 }} aria-hidden>
        {enemy.emoji}
      </span>
    )
  }
  const [x, y, size] = art.face
  return (
    <svg viewBox={portrait ? `${x} ${y} ${size} ${size}` : '0 0 200 200'} className={className} aria-hidden>
      {art.draw()}
    </svg>
  )
}

/* ---------- Chapter 1: The Cellar ---------- */

function rat() {
  const fur = '#9aa7b8'
  const shade = '#717d93'
  const pink = '#f2a3a8'
  return (
    <>
      <Limb d="M150 170 C186 170 196 134 178 114 C168 104 172 92 184 90" color={pink} width={8} />
      <Part d={ell(146, 184, 17, 8)} fill={pink} shade="#d98088" depth={4} />
      <Part d={ell(122, 142, 48, 44)} fill={fur} shade={shade} glint={ell(110, 112, 16, 9)}>
        <path d={ell(104, 156, 27, 28)} fill="#e3e8ef" />
      </Part>
      <Part d={ell(94, 184, 16, 8)} fill={pink} shade="#d98088" depth={4} />
      <Part d={ell(86, 152, 11, 9)} fill={fur} shade={shade} depth={4} />
      {/* Ears behind the head */}
      <Part d={circ(68, 66, 19)} fill={fur} shade={shade} depth={6}>
        <path d={circ(66, 66, 11)} fill={pink} />
      </Part>
      <Part d={circ(112, 64, 20)} fill={fur} shade={shade} depth={6}>
        <path d={circ(111, 65, 12)} fill={pink} />
      </Part>
      <Part
        d="M122 98 C122 72 100 62 80 68 C64 74 56 88 40 102 C30 110 32 122 44 124 C60 128 72 136 92 138 C114 138 124 120 122 98 Z"
        fill={fur}
        shade={shade}
        glint={ell(92, 80, 14, 7)}
      >
        <path d={ell(58, 118, 22, 12)} fill="#c3ccd8" />
      </Part>
      {/* Cheese-rind helmet */}
      <Part d="M58 80 L114 60 L126 86 C104 78 82 80 62 92 Z" fill="#f7cc52" shade="#d9a12a" depth={5}>
        <circle cx={86} cy={76} r={4} fill="#d9a12a" />
        <circle cx={104} cy={70} r={3} fill="#d9a12a" />
        <circle cx={114} cy={80} r={3.5} fill="#d9a12a" />
      </Part>
      <Part d={circ(37, 113, 7)} fill="#e8687f" shade="#c24a62" depth={3} glint={circ(35, 110, 2.2)} />
      <Ink d="M52 112 l-24 -7 M52 117 l-26 1 M54 122 l-22 8" width={2.4} />
      <Eye cx={72} cy={100} r={9.5} />
      <Eye cx={95} cy={97} r={8.5} />
      <Ink d="M62 86 q10 -4 19 3 M88 84 q8 -3 15 1" width={4} />
      <Ink d="M50 126 q14 9 30 1" />
      <path d="M58 128 h9 v7 h-9 z" fill="#fff" stroke="#3b2414" strokeWidth={2.5} strokeLinejoin="round" />
      <Blush cx={88} cy={118} />
    </>
  )
}

function spider() {
  const body = '#7a69a0'
  const shade = '#4f4174'
  const leg = '#4a3b6a'
  return (
    <>
      {['M130 118 Q162 70 192 104', 'M138 130 Q180 102 196 146', 'M136 144 Q176 142 188 184', 'M124 154 Q150 170 152 194'].map((d) => (
        <Limb key={d} d={d} color={leg} width={7} />
      ))}
      <Part d={ell(136, 102, 46, 42)} fill="#6b5a8c" shade="#463767" glint={ell(118, 76, 16, 8)}>
        <path d="M136 92 l12 10 l-12 10 l-12 -10 z" fill="#f08a3c" />
        <circle cx={160} cy={96} r={5} fill="#f08a3c" />
        <circle cx={152} cy={124} r={4} fill="#f08a3c" />
      </Part>
      <Ink d="M112 64 l4 -9 l4 8 l4 -10 l4 9 l4 -8 l3 9" width={3} />
      {['M86 122 Q52 72 18 102', 'M82 134 Q36 110 10 148', 'M86 148 Q46 148 32 188', 'M98 158 Q78 174 76 196'].map((d) => (
        <Limb key={d} d={d} color={leg} width={7} />
      ))}
      <Part d={circ(92, 136, 38)} fill={body} shade={shade} glint={ell(80, 112, 14, 7)} />
      {[
        [72, 106, 4],
        [86, 101, 4.5],
        [100, 101, 4],
        [112, 107, 3.5],
      ].map(([x, y, r]) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill="#241a33" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" />
        </g>
      ))}
      <Eye cx={78} cy={130} r={11} lid={0.38} lidColor={body} />
      <Eye cx={104} cy={128} r={10} lid={0.38} lidColor={body} />
      <Ink d="M68 154 q18 12 36 0" />
      <path d="M76 158 l4 10 l4 -9 M92 159 l4 9 l4 -10" fill="#fff" stroke="#3b2414" strokeWidth={2.5} strokeLinejoin="round" />
      <Blush cx={66} cy={146} />
      <Blush cx={116} cy={144} />
    </>
  )
}

function batWing() {
  return (
    <Part
      d="M80 102 C62 72 28 58 6 74 C18 84 16 98 8 110 C24 106 34 114 30 128 C46 118 56 124 62 136 C70 122 80 112 80 102 Z"
      fill="#9a7aa2"
      shade="#6c4f78"
      depth={6}
    >
      <path d="M78 104 L12 78 M74 110 L22 112 M70 118 L46 126" stroke="#5a3e62" strokeWidth={3} fill="none" />
    </Part>
  )
}

function bat() {
  const fur = '#7b5a7e'
  return (
    <>
      {batWing()}
      <g transform="matrix(-1 0 0 1 200 0)">{batWing()}</g>
      <Part d="M70 88 L60 42 L94 74 Z" fill={fur} shade="#573c5a" depth={5}>
        <path d="M70 80 L66 54 L86 74 Z" fill="#e8a3b6" />
      </Part>
      <Part d="M128 86 L142 44 L108 72 Z" fill={fur} shade="#573c5a" depth={5}>
        <path d="M126 78 L136 56 L114 72 Z" fill="#e8a3b6" />
      </Part>
      <Part d={ell(98, 118, 42, 44)} fill={fur} shade="#573c5a" glint={ell(84, 88, 15, 8)}>
        <path d={ell(94, 138, 23, 22)} fill="#c9a4b8" />
      </Part>
      <Eye cx={84} cy={106} r={11} lid={0.42} lidColor={fur} />
      <Eye cx={110} cy={105} r={10} lid={0.42} lidColor={fur} />
      <Ink d="M70 88 L98 98 M124 88 L102 98" width={6} />
      <Ink d="M86 132 q10 -7 20 0" />
      <path d="M90 131 l3 7 l3 -7 M101 131 l3 7 l3 -7" fill="#fff" stroke="#3b2414" strokeWidth={2.2} strokeLinejoin="round" />
      <Ink d="M86 160 l-3 12 M86 160 l3 12 M110 160 l-3 12 M110 160 l3 12" width={3.5} />
    </>
  )
}

function snake() {
  const green = '#73b85c'
  const shade = '#4b8a3f'
  const belly = '#ecdc8c'
  return (
    <>
      <Limb d="M166 172 q24 -4 26 -26 q1 -8 -6 -10" color={green} width={10} />
      <Part d={ell(110, 172, 64, 20)} fill={green} shade={shade} depth={6}>
        <path d="M50 178 Q110 196 170 178" stroke={belly} strokeWidth={8} fill="none" />
        <path d="M74 162 l6 4 M104 158 l6 4 M136 162 l6 4" stroke={shade} strokeWidth={4} strokeLinecap="round" />
      </Part>
      <Part d={ell(118, 148, 48, 17)} fill={green} shade={shade} depth={6}>
        <path d="M74 154 Q118 168 162 154" stroke={belly} strokeWidth={7} fill="none" />
      </Part>
      <Limb d="M132 144 C144 118 116 106 96 96" color={green} width={26} />
      <path d="M120 140 C126 122 108 112 92 106" stroke={belly} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Part d={ell(72, 82, 40, 30)} fill="#7fc467" shade={shade} glint={ell(66, 62, 16, 6)}>
        <path d={ell(52, 98, 26, 12)} fill={belly} />
      </Part>
      {/* A crown of moss and flowers */}
      <Part d="M46 60 q6 -16 14 -4 q6 -14 14 -2 q8 -12 14 2 q10 -8 12 8 q-28 -8 -54 -4 z" fill="#93c25c" shade="#5d8a38" depth={4} />
      <circle cx={60} cy={50} r={4.5} fill="#fff" stroke="#3b2414" strokeWidth={2} />
      <circle cx={60} cy={50} r={1.8} fill="#f5c344" />
      <circle cx={88} cy={48} r={4} fill="#f6a6c1" stroke="#3b2414" strokeWidth={2} />
      <circle cx={88} cy={48} r={1.6} fill="#f5c344" />
      <Eye cx={60} cy={76} r={11} />
      <Eye cx={86} cy={73} r={10} />
      <Ink d="M36 94 q16 10 32 3" />
      <path d="M36 95 l-14 2 l-7 -6 M22 97 l-6 7" stroke="#d94c4c" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Blush cx={92} cy={92} />
    </>
  )
}

function toadKing() {
  const green = '#8bba58'
  const shade = '#5f8f3b'
  return (
    <>
      {/* Lily-pad cape */}
      <Part d="M104 118 L156 40 A86 86 0 1 0 176 66 Z" fill="#5f9e4c" shade="#3d7333" depth={10}>
        <path d="M104 118 L40 60 M104 118 L30 140 M104 118 L90 200 M104 118 L178 164" stroke="#4a8a3e" strokeWidth={4} />
      </Part>
      <Part d={ell(56, 184, 26, 10)} fill={green} shade={shade} depth={4} />
      <Part d={ell(148, 184, 26, 10)} fill={green} shade={shade} depth={4} />
      <Part d="M38 178 C28 128 50 88 100 86 C152 88 174 128 164 178 Z" fill={green} shade={shade} depth={12} glint={ell(80, 100, 22, 8)}>
        <path d={ell(98, 152, 42, 30)} fill="#efe3b6" />
        {[
          [60, 120, 5],
          [140, 116, 6],
          [150, 140, 4],
          [72, 104, 3.5],
          [128, 98, 4],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill="#6f9d47" />
        ))}
      </Part>
      {/* Cattail sceptre */}
      <Limb d="M40 192 L32 98" color="#8a5a35" width={6} />
      <Part d={ell(31, 86, 9, 20)} fill="#7a4a2a" shade="#5a3420" depth={4} />
      <Part d={circ(40, 142, 12)} fill={green} shade={shade} depth={4} />
      <Part d={circ(70, 86, 19)} fill={green} shade={shade} depth={5} />
      <Part d={circ(120, 84, 19)} fill={green} shade={shade} depth={5} />
      <Eye cx={70} cy={86} r={11} lid={0.45} lidColor={green} />
      <Eye cx={120} cy={84} r={11} lid={0.45} lidColor={green} />
      <Ink d="M50 116 C76 132 118 132 144 112" width={5} />
      <Ink d="M144 112 q6 -2 8 -8" />
      <Blush cx={52} cy={108} r={8} />
      <Blush cx={146} cy={102} r={8} />
      {/* Crown */}
      <Part d="M70 66 L72 34 L88 52 L100 26 L112 52 L128 34 L130 66 Z" fill="#f7cc52" shade="#d39a22" depth={5} glint={ell(84, 58, 8, 3)}>
        <circle cx={100} cy={56} r={6} fill="#e8556a" stroke="#3b2414" strokeWidth={2.5} />
        <circle cx={80} cy={60} r={3.5} fill="#5aa9e6" stroke="#3b2414" strokeWidth={2} />
        <circle cx={120} cy={60} r={3.5} fill="#5aa9e6" stroke="#3b2414" strokeWidth={2} />
      </Part>
    </>
  )
}

/* ---------- Chapter 2: The Haunted Library ---------- */

function ghost() {
  return (
    <>
      <Glow cx={30} cy={146} r={44} color="#ffcf6a" />
      <Part
        d="M100 28 C148 28 164 70 162 110 C160 140 168 160 180 176 C162 182 150 168 140 180 C128 190 118 172 104 184 C90 192 82 172 68 182 C56 188 50 170 38 178 C52 150 46 120 46 98 C46 58 64 28 100 28 Z"
        fill="#f4f3ff"
        shade="#c4c3ea"
        depth={12}
        glint={ell(76, 50, 16, 8)}
      />
      {/* Inkblot eyes, still dripping */}
      <path
        d="M64 82 C64 68 86 66 88 80 C90 92 84 100 84 112 C84 118 78 118 78 110 C70 110 64 98 64 82 Z"
        fill="#2b2445"
      />
      <path d="M100 80 C100 66 122 66 122 80 C122 92 116 96 116 104 C116 110 110 110 110 104 C102 102 100 92 100 80 Z" fill="#2b2445" />
      <circle cx={72} cy={80} r={4} fill="#fff" />
      <circle cx={107} cy={79} r={3.5} fill="#fff" />
      <path d={ell(92, 130, 10, 13)} fill="#2b2445" />
      <path d={ell(92, 136, 6, 5)} fill="#f2879a" />
      <Blush cx={60} cy={112} />
      <Blush cx={128} cy={110} />
      {/* Wispy arm and lantern */}
      <Part d="M62 112 C46 112 36 122 32 134 C42 134 52 128 62 126 Z" fill="#f4f3ff" shade="#c4c3ea" depth={4} />
      <Ink d="M30 134 v8" width={3} />
      <Part d="M18 146 h24 l-3 30 h-18 z" fill="#ffe08a" shade="#f5b84a" depth={4} />
      <path d="M30 154 c6 6 6 12 0 16 c-6 -4 -6 -10 0 -16 z" fill="#f5762b" />
      <Part d="M14 142 h32 v6 h-32 z M16 174 h28 v6 h-28 z" fill="#b07a3c" shade="#7a5228" depth={2} line={3.5} />
    </>
  )
}

function skeleton() {
  const bone = '#f2e9d6'
  const shade = '#c9b994'
  return (
    <>
      <Limb d="M92 150 L86 182" color={bone} width={9} />
      <Limb d="M116 150 L122 182" color={bone} width={9} />
      <Part d={ell(80, 186, 13, 6)} fill={bone} shade={shade} depth={3} />
      <Part d={ell(128, 186, 13, 6)} fill={bone} shade={shade} depth={3} />
      <Limb d="M124 108 Q142 126 136 146" color={bone} width={8} />
      <Part d={circ(136, 150, 7)} fill={bone} shade={shade} depth={3} />
      <Part d="M80 104 C82 96 122 96 124 104 L120 150 C112 158 92 158 84 150 Z" fill={bone} shade={shade} depth={7}>
        <path d="M86 116 q16 7 32 0 M86 128 q16 7 32 0 M88 140 q14 6 28 0" stroke="#8a7a5e" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M102 100 V156" stroke="#b9a882" strokeWidth={4} />
      </Part>
      <Part
        d="M100 16 C140 16 152 46 148 70 C146 84 138 90 134 100 L68 100 C64 90 54 84 52 70 C48 46 60 16 100 16 Z"
        fill="#f6eedd"
        shade={shade}
        depth={9}
        glint={ell(78, 34, 16, 7)}
      />
      <Part d="M72 98 L130 98 L126 114 C112 120 88 120 76 114 Z" fill="#f6eedd" shade={shade} depth={4}>
        <path d="M86 98 V118 M98 98 V120 M110 98 V120 M120 98 V116" stroke="#8a7a5e" strokeWidth={3} />
      </Part>
      <path d={ell(76, 62, 15, 17)} fill="#3a2a30" stroke="#3b2414" strokeWidth={3} />
      <path d={ell(112, 62, 13, 15)} fill="#3a2a30" stroke="#3b2414" strokeWidth={3} />
      <circle cx={73} cy={64} r={5.5} fill="#8fe0ff" />
      <circle cx={109} cy={64} r={5} fill="#8fe0ff" />
      <circle cx={71} cy={61} r={2} fill="#fff" />
      <circle cx={107} cy={61} r={1.8} fill="#fff" />
      <path d="M90 84 l4 -9 l4 9 z" fill="#3a2a30" stroke="#3b2414" strokeWidth={2.5} strokeLinejoin="round" />
      {/* Book shield */}
      <Limb d="M82 108 Q66 120 62 130" color={bone} width={8} />
      <g transform="rotate(-6 54 132)">
        <Part d="M28 100 h50 v64 h-50 z" fill="#6b3f8a" shade="#472766" depth={7} glint={ell(40, 108, 8, 3)}>
          <path d="M36 100 v64" stroke="#472766" strokeWidth={5} />
        </Part>
        <circle cx={58} cy={132} r={11} fill="#f5c344" stroke="#3b2414" strokeWidth={3.5} />
        <path d="M58 124 l3 6 l6 2 l-6 2 l-3 6 l-3 -6 l-6 -2 l6 -2 z" fill="#fff6c2" />
      </g>
    </>
  )
}

function zombie() {
  const skin = '#a6c98e'
  const skinShade = '#7a9f68'
  const knit = '#8c6aa0'
  return (
    <>
      <Limb d="M90 150 L86 182" color="#57506e" width={14} />
      <Limb d="M114 150 L120 182" color="#57506e" width={14} />
      <Part d={ell(80, 186, 15, 7)} fill="#5b3a24" shade="#3d2616" depth={3} />
      <Part d={ell(126, 186, 15, 7)} fill="#5b3a24" shade="#3d2616" depth={3} />
      <Part d="M72 100 C70 130 72 150 76 160 L130 160 C132 140 132 118 128 100 C116 92 84 92 72 100 Z" fill={knit} shade="#664a7c" depth={9}>
        <path d="M92 98 L100 116 L108 98 Z" fill="#f4f0e6" />
        <path d="M112 126 h14 v14 h-14 z" fill="#d1a94e" />
        <path d="M112 133 h14 M119 126 v14" stroke="#9a7a2e" strokeWidth={2} strokeDasharray="3 2" />
        {[126, 140].map((y) => (
          <circle key={y} cx={100} cy={y} r={3} fill="#f5c344" />
        ))}
      </Part>
      {/* Arms out, carrying overdue books */}
      <Limb d="M84 110 L44 110" color={knit} width={16} />
      <Part d="M14 98 h40 v10 h-40 z" fill="#c0504d" shade="#8f3330" depth={3} />
      <Part d="M18 108 h36 v10 h-36 z" fill="#4f81bd" shade="#345e96" depth={3} />
      <Part d="M12 118 h42 v10 h-42 z" fill="#9bbb59" shade="#6f9038" depth={3} />
      <Limb d="M90 126 L48 130" color={knit} width={16} />
      <Part d={circ(40, 112, 9)} fill={skin} shade={skinShade} depth={3} />
      <Part d={circ(42, 130, 9)} fill={skin} shade={skinShade} depth={3} />
      <Part d={circ(100, 70, 34)} fill={skin} shade={skinShade} depth={9} glint={ell(86, 50, 12, 6)} />
      <Part d="M66 64 C62 40 80 28 100 32 C118 28 140 40 134 66 C128 52 118 48 110 54 C102 44 88 46 82 56 C76 52 70 56 66 64 Z" fill="#4d5a3a" shade="#323b25" depth={4} />
      <Ink d="M114 46 l12 8 M116 54 l4 -6 M122 58 l4 -6" width={2.5} />
      <Eye cx={86} cy={74} r={9.5} look={-0.3} />
      <Eye cx={112} cy={72} r={8.5} look={-0.3} lid={0.5} lidColor={skin} />
      <g transform="rotate(8 99 73)" fill="#dff2ff" fillOpacity={0.35} stroke="#3b2414" strokeWidth={3}>
        <circle cx={86} cy={74} r={13} />
        <circle cx={112} cy={74} r={12} />
        <path d="M99 74 h1" />
        <path d="M118 66 l-8 12" strokeWidth={1.5} />
      </g>
      <Ink d="M80 96 q10 7 24 -2" />
      <path d="M90 99 h6 v5 h-6 z" fill="#fff" stroke="#3b2414" strokeWidth={2} />
    </>
  )
}

function vampire() {
  const pale = '#ece2f2'
  return (
    <>
      <Part d="M100 70 C58 80 28 120 22 182 L178 182 C172 120 142 80 100 70 Z" fill="#3a2a4a" shade="#21162b" depth={10}>
        <path d="M100 88 C76 100 60 130 58 182 L142 182 C140 130 124 100 100 88 Z" fill="#b8323a" />
      </Part>
      <Part d="M82 100 L118 100 L124 178 L76 178 Z" fill="#2d2238" shade="#1a1322" depth={6}>
        <path d="M88 100 L100 128 L112 100 Z" fill="#f6f1e8" />
        <path d="M94 104 l6 4 l6 -4 l-6 6 z" fill="#b8323a" />
      </Part>
      <Part d="M72 104 L58 70 L96 98 Z" fill="#b8323a" shade="#86222a" depth={5} />
      <Part d="M128 104 L142 70 L104 98 Z" fill="#b8323a" shade="#86222a" depth={5} />
      <Part d="M70 64 L60 48 L74 56 Z" fill={pale} shade="#c6b4d4" depth={2} line={3.5} />
      <Part d={circ(100, 66, 30)} fill={pale} shade="#c6b4d4" depth={8} glint={ell(88, 48, 10, 5)} />
      <Part d="M70 62 C68 38 86 30 100 34 C116 30 134 40 130 62 C124 52 112 50 104 58 L100 66 L96 58 C88 50 76 52 70 62 Z" fill="#2a1e30" shade="#120c16" depth={4} glint={ell(110, 40, 9, 3)} />
      <Eye cx={90} cy={72} r={8} iris="#c0303c" />
      <Eye cx={112} cy={71} r={7.5} iris="#c0303c" />
      <Ink d="M80 60 q9 -5 17 1 M106 59 q7 -4 14 0" width={3.5} />
      <Ink d="M88 86 q12 8 24 0" />
      <path d="M93 88 l3 8 l3 -7 M103 88 l3 7 l3 -8" fill="#fff" stroke="#3b2414" strokeWidth={2} strokeLinejoin="round" />
      <Blush cx={80} cy={82} r={6} />
      {/* Quill, held like a dagger */}
      <Limb d="M84 110 Q64 112 56 122" color="#2d2238" width={14} />
      <Ink d="M58 128 L36 82" width={3} />
      <Part d="M22 68 C42 58 66 80 58 120 C46 104 28 92 22 68 Z" fill="#fffaf0" shade="#d8ccb4" depth={5}>
        <path d="M22 68 C30 66 36 70 38 76 C30 76 24 72 22 68 Z" fill="#b8323a" />
        <path d="M30 74 L56 116" stroke="#d8ccb4" strokeWidth={2} />
      </Part>
      <Part d={circ(56, 124, 8)} fill={pale} shade="#c6b4d4" depth={3} />
    </>
  )
}

function witch() {
  const robe = '#6a4c9c'
  const robeShade = '#4a3278'
  const skin = '#f8d2ab'
  return (
    <>
      <Ink d="M150 164 h40 M156 176 h34 M162 152 h26" width={3} />
      {/* The flying book she rides */}
      <Part d="M18 150 L100 166 L182 150 L178 178 L100 192 L22 178 Z" fill="#7a3b8a" shade="#552566" depth={6} />
      <Part d="M26 146 C60 134 86 144 100 160 L100 174 C80 162 56 158 28 164 Z" fill="#fff8e1" shade="#e3d4b0" depth={4}>
        <path d="M40 150 q20 -6 40 4 M42 158 q18 -4 36 4" stroke="#c9a36a" strokeWidth={2.5} fill="none" />
      </Part>
      <Part d="M174 146 C140 134 114 144 100 160 L100 174 C120 162 144 158 172 164 Z" fill="#fff8e1" shade="#e3d4b0" depth={4}>
        <path d="M160 150 q-20 -6 -40 4 M158 158 q-18 -4 -36 4" stroke="#c9a36a" strokeWidth={2.5} fill="none" />
      </Part>
      <Part d="M84 54 C68 70 68 102 80 124 L104 114 C120 124 136 110 132 90 C136 74 128 58 116 54 Z" fill="#f08a3c" shade="#c2622a" depth={6} />
      <Part d="M70 160 C68 122 80 98 100 94 C122 98 134 122 132 160 Z" fill={robe} shade={robeShade} depth={9}>
        <path d="M74 132 h56" stroke="#f5c344" strokeWidth={6} />
      </Part>
      {/* Staff and glowing orb */}
      <Glow cx={64} cy={56} r={34} color="#7fe0c8" />
      <Limb d="M44 178 L64 70" color="#8a5a35" width={7} />
      <Part d={circ(65, 60, 12)} fill="#86e6cf" shade="#3fae95" depth={5} glint={circ(61, 55, 4)} />
      <Limb d="M86 112 Q70 118 58 114" color={robe} width={14} />
      <Part d={circ(55, 114, 8)} fill={skin} shade="#e0aa82" depth={3} />
      <Part d={circ(100, 74, 26)} fill={skin} shade="#e0aa82" depth={7} glint={ell(90, 58, 8, 4)} />
      <Eye cx={90} cy={76} r={7.5} />
      <Eye cx={108} cy={75} r={7} />
      <Ink d="M82 64 q8 -5 15 0 M103 63 q7 -4 13 1" width={3.2} />
      <Part d="M96 80 L86 90 L96 91 Z" fill={skin} shade="#e0aa82" depth={2} line={3} />
      <Ink d="M88 96 q10 6 20 -2" />
      <circle cx={112} cy={88} r={1.8} fill="#3b2414" />
      <Blush cx={82} cy={88} r={5.5} />
      {/* Hat */}
      <Part d="M78 52 C86 34 98 10 128 4 C116 18 118 34 124 52 Z" fill={robe} shade={robeShade} depth={6} />
      <Part d="M56 56 C80 44 122 44 146 56 C122 64 80 64 56 56 Z" fill={robeShade} shade="#33204f" depth={3} />
      <path d="M80 50 Q102 44 124 50 L124 56 Q102 50 80 56 Z" fill="#f5c344" stroke="#3b2414" strokeWidth={3} strokeLinejoin="round" />
      <Twinkle x={30} y={86} r={7} />
      <Twinkle x={150} y={30} r={6} />
      <Twinkle x={44} y={36} r={5} />
    </>
  )
}

/* ---------- Chapter 3: The Dragon's Tower ---------- */

function goblin() {
  const skin = '#97c556'
  const shade = '#6c9a38'
  return (
    <>
      <Limb d="M92 160 L88 182" color={skin} width={12} />
      <Limb d="M112 160 L116 182" color={skin} width={12} />
      <Part d={ell(84, 186, 15, 7)} fill="#6b4426" shade="#4a2e18" depth={3} />
      <Part d={ell(122, 186, 15, 7)} fill="#6b4426" shade="#4a2e18" depth={3} />
      <Limb d="M126 122 Q142 134 136 150" color={skin} width={11} />
      <Part d="M74 112 C72 140 74 160 78 168 L128 168 C132 150 132 130 128 112 C114 104 88 104 74 112 Z" fill="#8a5a35" shade="#64401f" depth={8}>
        <path d="M74 146 h56" stroke="#4a2e18" strokeWidth={6} />
        <path d="M110 120 h12 v12 h-12 z" fill="#b8865a" />
      </Part>
      {/* Dagger */}
      <Part d="M56 118 L22 84 L30 78 L64 112 Z" fill="#e2e9f0" shade="#a5b1c0" depth={3} glint="M30 84 L56 110 L58 108 L32 82 Z" />
      <Part d="M52 106 L68 122 L64 126 L48 110 Z" fill="#f5c344" shade="#d39a22" depth={2} line={3.5} />
      <Limb d="M84 122 Q70 126 62 122" color={skin} width={11} />
      <Part d={circ(60, 120, 8)} fill={skin} shade={shade} depth={3} />
      {/* Ears */}
      <Part d="M72 74 L18 56 L68 94 Z" fill={skin} shade={shade} depth={5}>
        <path d="M66 78 L32 62 L64 88 Z" fill="#e8a3a3" />
      </Part>
      <Part d="M128 72 L180 48 L132 94 Z" fill={skin} shade={shade} depth={5}>
        <path d="M130 78 L166 58 L132 88 Z" fill="#e8a3a3" />
      </Part>
      <Part d={circ(100, 78, 34)} fill={skin} shade={shade} depth={9} glint={ell(88, 56, 12, 6)} />
      <Ink d="M92 44 q2 -10 10 -12 M100 44 q6 -8 14 -6" width={3.5} />
      <Eye cx={84} cy={74} r={9.5} iris="#e8a33a" />
      <Eye cx={110} cy={72} r={8.5} iris="#e8a33a" />
      <Ink d="M72 60 l22 7 M122 58 l-16 8" width={5} />
      <Part d={ell(72, 90, 12, 9)} fill="#86b448" shade={shade} depth={3} glint={circ(68, 86, 3)} />
      <Ink d="M78 102 q18 12 36 -2" />
      <path d="M96 106 l3 7 l3 -7" fill="#fff" stroke="#3b2414" strokeWidth={2.2} strokeLinejoin="round" />
      <Blush cx={118} cy={92} />
    </>
  )
}

function wolf() {
  const fur = '#8f97a6'
  const shade = '#646c7d'
  const cream = '#efe6d2'
  return (
    <>
      <Part d="M140 150 C172 150 194 118 186 88 C176 110 160 120 140 128 Z" fill={fur} shade={shade} depth={6}>
        <path d="M186 88 C184 100 178 108 170 114 C176 102 180 94 186 88 Z" fill={cream} />
      </Part>
      <Part d={ell(146, 178, 22, 12)} fill={fur} shade={shade} depth={4} />
      <Part d={ell(118, 146, 48, 36)} fill={fur} shade={shade} depth={10} glint={ell(118, 118, 18, 6)} />
      <Limb d="M82 150 L78 180" color={fur} width={16} />
      <Limb d="M102 156 L102 182" color={fur} width={16} />
      <Part d={ell(76, 186, 13, 6)} fill={fur} shade={shade} depth={3} />
      <Part d={ell(104, 187, 13, 6)} fill={fur} shade={shade} depth={3} />
      <Part d="M70 118 L76 162 L86 150 L92 168 L100 150 L106 122 Z" fill={cream} shade="#cdbfa3" depth={5} />
      <Part d="M92 52 L102 22 L114 56 Z" fill={fur} shade={shade} depth={4}>
        <path d="M98 50 L102 32 L110 54 Z" fill="#e8a3b6" />
      </Part>
      <Part
        d="M122 80 C122 54 102 44 84 50 L76 28 L66 52 C58 58 52 66 34 78 C24 84 26 96 38 98 C52 100 62 110 82 112 C106 114 122 102 122 80 Z"
        fill={fur}
        shade={shade}
        glint={ell(90, 60, 12, 5)}
      >
        <path d={ell(48, 96, 22, 11)} fill={cream} />
        <path d="M74 34 L70 50 L80 48 Z" fill="#e8a3b6" />
      </Part>
      <Part d={ell(30, 87, 8, 6.5)} fill="#2e2c3a" shade="#1a1922" depth={2} glint={circ(28, 85, 2)} />
      <Eye cx={74} cy={72} r={8.5} iris="#f0b33c" />
      <Eye cx={96} cy={70} r={8} iris="#f0b33c" />
      <Ink d="M62 60 L86 68 M110 58 L94 66" width={5.5} />
      <Ink d="M36 100 q16 7 34 0" />
      <path d="M44 101 l3 8 l3 -7 M60 102 l3 7 l3 -8" fill="#fff" stroke="#3b2414" strokeWidth={2.2} strokeLinejoin="round" />
      <Ink d="M112 96 l10 4 l-6 5" width={3} />
    </>
  )
}

function scorpion() {
  const red = '#dc5a42'
  const shade = '#a5392a'
  const tail: [number, number, number][] = [
    [160, 140, 16],
    [172, 112, 15],
    [170, 84, 14],
    [156, 60, 13],
    [134, 46, 12],
  ]
  return (
    <>
      {['M106 166 l-12 22', 'M124 168 l-4 24', 'M142 166 l6 24', 'M156 160 l14 22'].map((d) => (
        <Limb key={d} d={d} color="#b8402e" width={6} />
      ))}
      {tail.map(([x, y, r]) => (
        <Part key={x * y} d={circ(x, y, r)} fill={red} shade={shade} depth={5} glint={ell(x - r * 0.3, y - r * 0.4, r * 0.4, r * 0.2)} />
      ))}
      <Part d="M124 38 C108 28 94 40 98 58 C104 48 112 46 122 50 Z" fill="#f7cc52" shade="#d39a22" depth={3} />
      <Part d={ell(118, 156, 46, 24)} fill={red} shade={shade} depth={8} glint={ell(110, 140, 18, 5)}>
        <path d="M100 134 v44 M120 132 v48 M140 134 v44" stroke={shade} strokeWidth={3} />
      </Part>
      {/* Pincers */}
      <Limb d="M80 148 Q58 138 52 120" color={red} width={12} />
      <Part
        d="M52 122 C30 116 22 96 34 84 C40 96 48 100 56 98 C60 88 56 80 50 76 C68 76 74 98 66 118 Z"
        fill={red}
        shade={shade}
        depth={5}
      />
      <Limb d="M78 164 Q54 172 42 164" color={red} width={12} />
      <Part
        d="M44 166 C24 168 12 152 18 138 C26 148 34 150 42 146 C42 136 36 130 30 128 C48 124 58 144 52 162 Z"
        fill={red}
        shade={shade}
        depth={5}
      />
      <Part d={ell(84, 150, 26, 21)} fill="#e46a50" shade={shade} depth={6} glint={ell(76, 136, 9, 4)} />
      <Eye cx={74} cy={142} r={8} />
      <Eye cx={93} cy={140} r={7.5} />
      <Ink d="M64 130 L80 135 M102 128 L90 134" width={4.5} />
      <Ink d="M76 160 q8 -4 16 0" />
    </>
  )
}

function ogre() {
  const skin = '#a6ba6c'
  const shade = '#7b8f4a'
  return (
    <>
      {/* Club, raised overhead */}
      <g transform="translate(-14 6)">
        <Limb d="M164 144 L178 44" color="#8a5a35" width={12} />
        <Part d="M164 56 C158 22 188 8 194 32 C198 52 186 66 174 64 Z" fill="#a8763f" shade="#7a522a" depth={6} glint={ell(178, 26, 6, 3)}>
          <path d="M178 38 l4 4 M170 50 l4 4 M186 50 l4 4" stroke="#7a522a" strokeWidth={3} />
        </Part>
        <path d="M162 36 l-8 -4 l8 -2 M190 20 l2 -8 l3 8 M194 48 l6 2 l-6 3" fill="#cfd6de" stroke="#3b2414" strokeWidth={2.5} strokeLinejoin="round" />
      </g>
      <Part d={ell(84, 182, 20, 11)} fill={skin} shade={shade} depth={4} />
      <Part d={ell(130, 182, 20, 11)} fill={skin} shade={shade} depth={4} />
      <Part d="M48 172 C38 120 62 84 104 84 C148 84 170 124 158 172 Z" fill={skin} shade={shade} depth={13} glint={ell(84, 98, 22, 8)}>
        <path d={ell(104, 140, 36, 28)} fill="#c8d696" />
        <path d="M52 152 C80 166 130 166 156 150 L158 176 L48 176 Z" fill="#8a5a35" />
        <path d="M52 152 C80 166 130 166 156 150" stroke="#5b3a24" strokeWidth={5} fill="none" />
      </Part>
      <Limb d="M144 108 Q166 118 156 140" color={skin} width={20} />
      <Part d={circ(152, 146, 13)} fill={skin} shade={shade} depth={4} />
      <Limb d="M62 110 Q38 128 42 154" color={skin} width={22} />
      <Part d={circ(42, 160, 14)} fill={skin} shade={shade} depth={5} />
      <Part d={circ(64, 72, 9)} fill={skin} shade={shade} depth={3} />
      <Part d={circ(100, 70, 30)} fill={skin} shade={shade} depth={8} glint={ell(90, 52, 10, 5)} />
      <Ink d="M94 42 q2 -10 -4 -14 M102 41 q2 -10 6 -14 M110 44 q4 -8 10 -8" width={3} />
      <Eye cx={88} cy={70} r={7} />
      <Eye cx={108} cy={69} r={6.5} />
      <Ink d="M78 58 Q98 52 118 58" width={7} />
      <Part d={ell(96, 82, 9, 7)} fill="#9aae5e" shade={shade} depth={3} />
      <Ink d="M82 92 q16 -6 32 0" />
      <path d="M86 92 l3 -10 l4 9 M106 91 l4 -9 l3 10" fill="#fffaf0" stroke="#3b2414" strokeWidth={2.5} strokeLinejoin="round" />
      <Blush cx={76} cy={84} r={6} />
    </>
  )
}

function dragon() {
  const red = '#d9483c'
  const shade = '#a2302a'
  const belly = '#f6c177'
  const horn = '#f4e4c1'
  return (
    <>
      <Limb d="M140 174 C168 182 186 172 188 150" color={red} width={15} />
      <Part d="M188 152 L176 140 L188 126 L198 144 Z" fill={red} shade={shade} depth={4} />
      {/* Wing */}
      <Part d="M122 98 C138 58 176 44 194 56 C182 64 184 74 192 84 C178 84 172 92 174 106 C162 100 150 104 142 112 Z" fill="#f08a3c" shade="#c2622a" depth={7}>
        <path d="M128 102 L190 58 M134 106 L188 84 M140 110 L172 104" stroke={shade} strokeWidth={3.5} />
      </Part>
      <path d="M118 98 l8 -14 l6 14 M136 104 l10 -12 l4 14" fill={horn} stroke="#3b2414" strokeWidth={3} strokeLinejoin="round" />
      <Part d={ell(78, 184, 22, 10)} fill={red} shade={shade} depth={4} />
      <Part d={ell(140, 184, 22, 10)} fill={red} shade={shade} depth={4} />
      <Part d="M58 178 C48 130 70 96 112 96 C150 98 168 130 158 178 Z" fill={red} shade={shade} depth={13} glint={ell(94, 108, 18, 6)}>
        <path d={ell(98, 152, 32, 32)} fill={belly} />
        <path d="M70 136 h56 M68 150 h60 M70 164 h56" stroke="#e0a050" strokeWidth={3.5} />
      </Part>
      <path d="M66 190 l3 -6 l3 6 M76 191 l3 -6 l3 6 M86 190 l3 -6 l3 6" fill={horn} stroke="#3b2414" strokeWidth={2} strokeLinejoin="round" />
      <Limb d="M82 120 Q64 132 68 148" color={red} width={14} />
      <path d="M60 150 l2 7 l4 -5 M68 152 l2 7 l3 -6" fill={horn} stroke="#3b2414" strokeWidth={2} strokeLinejoin="round" />
      {/* Horns */}
      <Part d="M102 46 C106 24 120 14 134 16 C122 24 118 36 118 50 Z" fill={horn} shade="#d4be93" depth={4} />
      <Part d="M84 46 C78 26 86 12 98 8 C94 22 96 34 100 46 Z" fill={horn} shade="#d4be93" depth={4} />
      <Part
        d="M132 80 C132 52 110 40 88 44 C72 48 62 58 40 64 C24 68 22 86 34 92 C50 100 62 108 88 110 C114 112 132 100 132 80 Z"
        fill={red}
        shade={shade}
        glint={ell(98, 54, 14, 5)}
      >
        <path d={ell(46, 86, 24, 12)} fill="#e86a5a" />
      </Part>
      <path d="M128 66 l12 -6 l-4 12 M130 84 l12 2 l-10 8" fill={horn} stroke="#3b2414" strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={32} cy={74} rx={3.5} ry={2.5} fill="#3b2414" />
      <ellipse cx={44} cy={70} rx={3.5} ry={2.5} fill="#3b2414" />
      <Part d={circ(18, 58, 7)} fill="#d7d2cc" shade="#a8a29a" depth={3} line={3} />
      <Part d={circ(8, 46, 5)} fill="#d7d2cc" shade="#a8a29a" depth={2} line={3} />
      <Eye cx={76} cy={68} r={9} iris="#f5c344" />
      <Eye cx={100} cy={65} r={8.5} iris="#f5c344" />
      <Ink d="M62 56 L88 62 M114 52 L94 60" width={5.5} />
      <Ink d="M38 94 q22 10 46 2" />
      <path d="M48 96 l3 9 l4 -8 M66 98 l3 8 l4 -9" fill="#fff" stroke="#3b2414" strokeWidth={2.2} strokeLinejoin="round" />
      <Blush cx={98} cy={88} r={7} />
    </>
  )
}
