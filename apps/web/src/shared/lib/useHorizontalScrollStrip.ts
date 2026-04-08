import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react"

const PANNING_ATTR = "data-panning"

/**
 * `overflow-x: auto` 한 줄 스트립 — 마우스 휠(세로 델타 → 가로 이동)·드래그 패닝.
 * 트랙패드 가로 제스처(`deltaX`)도 그대로 반영.
 */
export const useHorizontalScrollStrip = () => {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: 0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      const dx = e.deltaX
      const dy = e.deltaY
      const delta = dx !== 0 ? dx : dy
      if (delta === 0) return
      e.preventDefault()
      el.scrollLeft += delta
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return
    const el = ref.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    el.setPointerCapture(e.pointerId)
    drag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      pointerId: e.pointerId,
    }
    el.setAttribute(PANNING_ATTR, "true")
  }, [])

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active || e.pointerId !== d.pointerId) return
    const el = ref.current
    if (!el) return
    el.scrollLeft = d.scrollLeft - (e.clientX - d.startX)
  }, [])

  const endPan = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active || e.pointerId !== d.pointerId) return
    const el = ref.current
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    d.active = false
    el?.removeAttribute(PANNING_ATTR)
  }, [])

  return {
    ref,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endPan,
    onPointerLeave: endPan,
    onPointerCancel: endPan,
  }
}
