import type { ReactNode } from 'react'
import { useElementSize } from '../core/hooks/useElementSize'
import { useIsTouchDevice } from '../core/hooks/useMediaQuery'
import { useViewportSize } from '../core/hooks/useViewportSize'
import { fitScale, needsRotation, STAGE_SIZES } from '../core/scale'
import type { Orientation } from '../core/types'
import { RotateOverlay } from './RotateOverlay'

/**
 * Renders children at a fixed logical resolution and scales them uniformly to
 * fit the available space, letterboxing the rest. On touch devices held the
 * wrong way, it shows a rotate prompt instead.
 */
export function GameStage({ orientation, children }: { orientation: Orientation; children: ReactNode }) {
  const [containerRef, container] = useElementSize<HTMLDivElement>()
  const viewport = useViewportSize()
  const isTouch = useIsTouchDevice()
  const stage = STAGE_SIZES[orientation]
  const scale = fitScale(stage, container)
  const rotate = isTouch && needsRotation(orientation, viewport)

  return (
    <div ref={containerRef} className="relative min-h-0 flex-1 touch-none select-none overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
      {rotate && <RotateOverlay orientation={orientation} />}
    </div>
  )
}
