import { isSameDay, max, min, startOfDay } from "date-fns"
import type { CalendarWeek } from "react-day-picker"

import type { EventCalendarItem, EventCalendarWeekSegment } from "../model/types"

/**
 * 한 주(그리드 행)에 겹치는 이벤트를 열 구간·레인으로 나눈다.
 */
export const layoutEventSegmentsForWeek = (
  week: CalendarWeek,
  events: EventCalendarItem[],
): EventCalendarWeekSegment[] => {
  const weekDays = week.days
  if (weekDays.length === 0) return []

  const weekFirst = startOfDay(weekDays[0].date)
  const weekLast = startOfDay(weekDays[weekDays.length - 1].date)

  type RawSeg = {
    event: EventCalendarItem
    startCol: number
    endCol: number
  }

  const raw: RawSeg[] = []

  for (const event of events) {
    const evStart = startOfDay(event.start)
    const evEnd = startOfDay(event.end)
    if (evEnd < weekFirst || evStart > weekLast) continue

    const segStart = max([evStart, weekFirst])
    const segEnd = min([evEnd, weekLast])

    const startCol = weekDays.findIndex((d) => isSameDay(d.date, segStart))
    const endCol = weekDays.findIndex((d) => isSameDay(d.date, segEnd))
    if (startCol < 0 || endCol < 0) continue

    raw.push({ event, startCol, endCol })
  }

  raw.sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol
    if (a.endCol !== b.endCol) return b.endCol - a.endCol
    return a.event.id.localeCompare(b.event.id)
  })

  const laneEnds: number[] = []
  const results: EventCalendarWeekSegment[] = []

  for (const r of raw) {
    let lane = 0
    while (lane < laneEnds.length && laneEnds[lane] >= r.startCol) {
      lane += 1
    }
    if (lane === laneEnds.length) {
      laneEnds.push(r.endCol)
    } else {
      laneEnds[lane] = r.endCol
    }

    results.push({
      eventId: r.event.id,
      startCol: r.startCol,
      span: r.endCol - r.startCol + 1,
      lane,
      event: r.event,
    })
  }

  return results
}
