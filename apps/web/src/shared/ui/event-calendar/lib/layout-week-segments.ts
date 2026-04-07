import {
  differenceInCalendarDays,
  max,
  min,
  startOfDay,
} from "date-fns"

import type {
  EventCalendarItem,
  EventCalendarWeekSegment,
} from "../model/types"

function segmentEndCol(s: { startCol: number; span: number }) {
  return s.startCol + s.span - 1
}

function segmentsOverlap(
  a: { startCol: number; span: number },
  b: { startCol: number; span: number },
) {
  return !(
    segmentEndCol(a) < b.startCol || segmentEndCol(b) < a.startCol
  )
}

export function layoutWeekSegments(
  weekDays: Date[],
  events: EventCalendarItem[],
): EventCalendarWeekSegment[] {
  const weekStart = startOfDay(weekDays[0])
  const weekEnd = startOfDay(weekDays[6])

  const raw: Omit<EventCalendarWeekSegment, "lane">[] = []

  for (const event of events) {
    const eStart = startOfDay(event.start)
    const eEnd = startOfDay(event.end)
    if (eEnd < weekStart || eStart > weekEnd) continue

    const segStart = max([eStart, weekStart])
    const segEnd = min([eEnd, weekEnd])
    const startCol = differenceInCalendarDays(segStart, weekStart)
    const span = differenceInCalendarDays(segEnd, segStart) + 1
    raw.push({
      eventId: event.id,
      startCol,
      span,
      event,
    })
  }

  raw.sort((a, b) => a.startCol - b.startCol || b.span - a.span)

  const lanes: EventCalendarWeekSegment[][] = []
  const result: EventCalendarWeekSegment[] = []

  for (const seg of raw) {
    let lane = 0
    while (lane < lanes.length) {
      const hasConflict = lanes[lane].some((existing) =>
        segmentsOverlap(seg, existing),
      )
      if (!hasConflict) break
      lane += 1
    }
    if (lane === lanes.length) {
      lanes.push([])
    }
    const placed: EventCalendarWeekSegment = { ...seg, lane }
    lanes[lane].push(placed)
    result.push(placed)
  }

  return result
}

export function maxLaneIndex(segments: EventCalendarWeekSegment[]) {
  if (segments.length === 0) return -1
  return Math.max(...segments.map((s) => s.lane))
}
