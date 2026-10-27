import type { SVGProps } from 'react'
import type { Orientation } from '../core/types'

type IconProps = SVGProps<SVGSVGElement>

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function BackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function ExpandIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  )
}

export function CollapseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </svg>
  )
}

/** A phone outline drawn upright, on its side, or both for "any". */
export function OrientationIcon({ orientation, ...props }: IconProps & { orientation: Orientation }) {
  if (orientation === 'any') {
    return (
      <svg viewBox="0 0 24 24" {...base} {...props}>
        <rect x="3" y="3" width="11" height="18" rx="2" />
        <path d="M17 9h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6" />
      </svg>
    )
  }
  const landscape = orientation === 'landscape'
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      {landscape ? <rect x="2" y="6" width="20" height="12" rx="2" /> : <rect x="6" y="2" width="12" height="20" rx="2" />}
      {landscape ? <path d="M18 12h.01" /> : <path d="M12 18h.01" />}
    </svg>
  )
}
