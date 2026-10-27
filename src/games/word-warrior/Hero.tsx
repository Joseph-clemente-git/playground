import { Blush, Eye, Glow, Ink, Limb, Part, Twinkle } from './paint'
import { circ, ell } from './shapes'

const SKIN = '#f8d2ab'
const SKIN_SHADE = '#e2ae86'
const HAIR = '#7a4524'
const HAIR_SHADE = '#55301a'
const CAPE = '#3f6fd6'
const CAPE_SHADE = '#2b4fa6'
const TUNIC = '#f4e4c1'
const TUNIC_SHADE = '#d8c39a'

/** The hero: a young scholar who fights with a giant fountain pen and a glowing spellbook. */
export function Hero({ className, portrait = false }: { className?: string; portrait?: boolean }) {
  return (
    // The portrait crops to the head, for the frame in the battle header.
    <svg viewBox={portrait ? '54 16 104 104' : '0 0 200 200'} className={className} aria-hidden>
      {/* Cape, behind everything */}
      <Part d="M82 104 Q70 140 58 180 Q102 192 148 180 Q136 140 126 104 Z" fill={CAPE} shade={CAPE_SHADE} depth={10}>
        <path d="M66 176 Q102 186 140 176" stroke={CAPE_SHADE} strokeWidth={5} fill="none" />
      </Part>

      {/* Legs and boots */}
      <Limb d="M95 158 V178" color="#5b3a24" width={13} />
      <Limb d="M115 158 V178" color="#5b3a24" width={13} />
      <Part d="M82 178 h22 a4 4 0 0 1 4 4 v6 h-30 v-3 a7 7 0 0 1 4 -7 z" fill="#8a5a35" shade="#64401f" depth={4} />
      <Part d="M106 178 h20 a8 8 0 0 1 8 8 v2 h-30 v-6 a4 4 0 0 1 2 -4 z" fill="#8a5a35" shade="#64401f" depth={4} />

      {/* Tunic and belt */}
      <Part d="M86 102 h36 q7 30 9 60 h-54 q2 -30 9 -60 z" fill={TUNIC} shade={TUNIC_SHADE} depth={9}>
        <path d="M104 102 v26" stroke={TUNIC_SHADE} strokeWidth={3} />
      </Part>
      <Part d="M79 136 h52 v11 h-52 z" fill="#8a5a35" shade="#64401f" depth={3} />
      <Part d="M98 134 h13 v15 h-13 z" fill="#f7cc52" shade="#d39a22" depth={2} line={3.5} />
      {/* A short blue collar where the cape fastens */}
      <Part d="M82 100 Q104 116 126 100 L122 112 Q104 122 86 112 Z" fill={CAPE} shade={CAPE_SHADE} depth={4} />
      <Part d={circ(104, 114, 5)} fill="#f7cc52" shade="#d39a22" depth={2} line={3} />

      {/* Spellbook arm, behind the book */}
      <Limb d="M88 112 Q72 124 70 138" color={TUNIC} width={10} />

      {/* Open spellbook, glowing */}
      <Glow cx={60} cy={136} r={40} color="#ffe27a" />
      <Part d="M32 134 L60 148 L88 134 L88 160 L60 170 L32 160 Z" fill="#b8323a" shade="#86222a" depth={5} />
      <Part d="M36 128 Q50 122 60 134 L60 160 Q50 152 36 154 Z" fill="#fffaea" shade="#eadcb6" depth={3} line={4} />
      <Part d="M84 128 Q70 122 60 134 L60 160 Q70 152 84 154 Z" fill="#fffaea" shade="#eadcb6" depth={3} line={4} />
      <path d="M42 137 q6 -2 12 2 M42 144 q6 -2 12 2 M66 139 q6 -4 12 -2 M66 146 q6 -4 12 -2" stroke="#c9a36a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Part d={circ(70, 134, 8)} fill={SKIN} shade={SKIN_SHADE} depth={3} />
      <Twinkle x={56} y={110} r={7} />
      <Twinkle x={38} y={118} r={5} />
      <Twinkle x={74} y={114} r={4} />

      {/* Giant fountain pen, held like a sword */}
      <g transform="rotate(36 142 132)">
        <Part d="M134 80 h16 v56 a8 8 0 0 1 -16 0 z" fill="#2f4078" shade="#1c2852" depth={5} glint="M137 84 h4 v40 h-4 z" />
        <Part d="M133 112 h18 v10 h-18 z" fill="#f7cc52" shade="#d39a22" depth={2} line={3.5} />
        <Part d="M134 82 L142 46 L150 82 Z" fill="#f7cc52" shade="#d39a22" depth={3} glint="M139 66 L142 52 L143 66 Z" />
        <Ink d="M142 56 V74" width={2.6} />
        <circle cx={142} cy={74} r={2.8} fill="#3b2414" />
      </g>
      <Twinkle x={188} y={52} r={7} color="#ffffff" />

      {/* Pen arm and hand, in front */}
      <Limb d="M120 112 Q132 124 140 130" color={TUNIC} width={10} />
      <Part d={circ(142, 131, 9)} fill={SKIN} shade={SKIN_SHADE} depth={3} />

      {/* Head */}
      <Part d={circ(66, 76, 8)} fill={SKIN} shade={SKIN_SHADE} depth={3} />
      {/* A softer shadow on the face, which turns toward the light. */}
      <Part d={circ(104, 70, 40)} fill={SKIN} shade="#f0c49e" depth={5} glint={ell(124, 58, 8, 5)} />
      <Part
        d="M62 72 Q58 40 84 28 Q88 18 100 22 Q108 12 118 22 Q130 18 134 30 Q150 38 146 66 Q138 52 128 50 Q124 58 114 56 Q106 62 98 54 Q90 60 82 56 Q74 66 62 72 Z"
        fill={HAIR}
        shade={HAIR_SHADE}
        depth={6}
        glint="M92 30 q8 -6 18 -4 q-8 2 -14 8 z"
      />

      {/* Face, looking right toward the enemy */}
      <Eye cx={105} cy={78} r={8.5} look={0.55} />
      <Eye cx={129} cy={78} r={8} look={0.55} />
      <Ink d="M95 63 q8 -5 16 -1 M121 62 q7 -4 14 1" width={3.6} />
      <Blush cx={94} cy={93} />
      <Blush cx={140} cy={92} r={6} />
      <Ink d="M110 95 q7 6 14 0" width={3.6} />
    </svg>
  )
}
