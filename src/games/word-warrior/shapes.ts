/** SVG path data for an ellipse, so it can be shaded and clipped like any other part. */
export function ell(cx: number, cy: number, rx: number, ry: number) {
  return `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`
}

export function circ(cx: number, cy: number, r: number) {
  return ell(cx, cy, r, r)
}
