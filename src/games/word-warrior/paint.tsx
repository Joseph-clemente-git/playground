import { useId, type ReactNode } from 'react'

/**
 * The shared toolkit every character is drawn with, so the whole cast reads as
 * one illustrated set: light from the upper left, a soft form shadow on the lower
 * right, a glint, and one ink outline weight.
 */

export const INK = '#3b2414'
const LINE = 4.5

/** An id that's safe inside `url(#…)`. */
function useSvgId() {
  return useId().replace(/[^\w-]/g, '')
}

/**
 * A filled shape with its own form shadow: the shade colour shows where the
 * shape, nudged toward the light, no longer covers itself. Children are clipped
 * to the shape, for bellies, stripes and spots.
 */
export function Part({
  d,
  fill,
  shade,
  glint,
  depth = 8,
  line = LINE,
  fromRight = false,
  children,
}: {
  d: string
  fill: string
  shade: string
  /** Path for a soft highlight, drawn inside the shape. */
  glint?: string
  /** How far the shadow reaches in from the lower right. */
  depth?: number
  line?: number
  /** Light from the upper right instead of the upper left. */
  fromRight?: boolean
  children?: ReactNode
}) {
  const id = useSvgId()
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <path d={d} fill={shade} />
        <path d={d} fill={fill} transform={`translate(${(fromRight ? 1 : -1) * depth * 0.6} ${-depth})`} />
        {children}
        {glint && <path d={glint} fill="#fff" opacity={0.42} />}
      </g>
      {line > 0 && <path d={d} fill="none" stroke={INK} strokeWidth={line} strokeLinejoin="round" strokeLinecap="round" />}
    </g>
  )
}

/** A tube along a path, such as an arm, leg, tail or staff, outlined in ink. */
export function Limb({ d, color, width }: { d: string; color: string; width: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={width + LINE * 2} />
      <path d={d} stroke={color} strokeWidth={width} />
    </g>
  )
}

/**
 * A big storybook eye that looks toward `look` (−1 left … 1 right). A coloured
 * `iris` gets a dark pupil inside it; `lid` closes the top fraction of the eye.
 */
export function Eye({
  cx,
  cy,
  r,
  look = -0.5,
  iris = '#2a1a12',
  lid = 0,
  lidColor,
}: {
  cx: number
  cy: number
  r: number
  look?: number
  iris?: string
  lid?: number
  lidColor?: string
}) {
  const id = useSvgId()
  const ry = r * 1.18
  const ir = r * 0.66
  const ix = cx + look * r * 0.38
  const iy = cy + ry * 0.12
  const coloured = iris !== '#2a1a12'
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={r} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={ix} cy={iy} rx={ir} ry={ir * 1.08} fill={iris} />
        {coloured && <ellipse cx={ix} cy={iy} rx={ir * 0.5} ry={ir * 0.58} fill="#1c120c" />}
        <circle cx={ix - ir * 0.36} cy={iy - ir * 0.34} r={ir * 0.36} fill="#fff" />
        <circle cx={ix + ir * 0.38} cy={iy + ir * 0.42} r={ir * 0.15} fill="#fff" />
        {lid > 0 && <rect x={cx - r - 2} y={cy - ry - 2} width={r * 2 + 4} height={ry * 2 * lid + 2} fill={lidColor} />}
      </g>
      {lid > 0 && (
        <path d={`M${cx - r} ${cy - ry + ry * 2 * lid} H${cx + r}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      )}
      <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="none" stroke={INK} strokeWidth={3.5} />
    </g>
  )
}

/** A soft pink cheek. */
export function Blush({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.6} fill="#f2879a" opacity={0.55} />
}

/** An ink line: brows, mouths, whiskers and creases. */
export function Ink({ d, width = 4, fill = 'none' }: { d: string; width?: number; fill?: string }) {
  return <path d={d} fill={fill} stroke={INK} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
}

/** A four-point twinkle, for magic and shine. */
export function Twinkle({ x, y, r, color = '#fff6c2' }: { x: number; y: number; r: number; color?: string }) {
  const w = r * 0.28
  return (
    <path
      d={`M${x} ${y - r} L${x + w} ${y - w} L${x + r} ${y} L${x + w} ${y + w} L${x} ${y + r} L${x - w} ${y + w} L${x - r} ${y} L${x - w} ${y - w} Z`}
      fill={color}
      stroke={INK}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  )
}

/** A warm halo behind something that glows. */
export function Glow({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const id = useSvgId()
  return (
    <>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={0.75} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  )
}
