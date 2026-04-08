import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react"
import type { CalendarWeek } from "react-day-picker"

import { cn } from "@/lib/utils"

import { layoutEventSegmentsForWeek } from "../lib/layout-event-segments-for-week"
import type { EventCalendarItem, EventCalendarWeekSegment } from "../model/types"

import styles from "./EventCalendar.module.css"

export type EventCalendarBarInteraction = {
  openDetail: (event: EventCalendarItem, anchorRect: DOMRect) => void
  scheduleCloseDetail: () => void
  cancelCloseDetail: () => void
}

type TdProps = {
  className?: string
  children?: ReactNode
}

type EventCalendarWeekWithEventsProps = {
  week: CalendarWeek
  events: EventCalendarItem[]
  barInteraction: EventCalendarBarInteraction
  className?: string
  style?: CSSProperties
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children">

type SegmentShape = "single" | "start" | "middle" | "end"

const getSegmentEndCol = (seg: EventCalendarWeekSegment) =>
  seg.startCol + seg.span - 1

const getSegmentShape = (
  colIndex: number,
  seg: EventCalendarWeekSegment,
): SegmentShape => {
  const endCol = getSegmentEndCol(seg)
  const isBarStart = colIndex === seg.startCol
  const isBarEnd = colIndex === endCol
  if (isBarStart && isBarEnd) return "single"
  if (isBarStart) return "start"
  if (isBarEnd) return "end"
  return "middle"
}

const trackShapeClass: Record<SegmentShape, string> = {
  single: styles.eventBarTrackPill,
  start: styles.eventBarTrackSegStart,
  middle: styles.eventBarTrackSegMiddle,
  end: styles.eventBarTrackSegEnd,
}

const faceShapeClass: Record<SegmentShape, string> = {
  single: styles.eventBarFacePill,
  start: styles.eventBarFaceSegStart,
  middle: styles.eventBarFaceSegMiddle,
  end: styles.eventBarFaceSegEnd,
}

/** EventCalendar.module.css 의 --event-calendar-bar-height / bar-lane-gap 과 동기 */
const EVENT_BAR_H_PX = 22
const EVENT_BAR_LANE_GAP_PX = 4

const laneAnchorTopStyle = (
  lane: number,
  stackHeightPx: number,
): CSSProperties =>
  stackHeightPx > 0
    ? {
        top: `max(0px, calc((100% - ${stackHeightPx}px) / 2 + ${lane * (EVENT_BAR_H_PX + EVENT_BAR_LANE_GAP_PX)}px))`,
      }
    : {}

export const EventCalendarWeekWithEvents = ({
  week,
  events,
  barInteraction,
  className,
  style,
  children,
  ...trProps
}: EventCalendarWeekWithEventsProps) => {
  const segments = layoutEventSegmentsForWeek(week, events)
  const weekKey = week.days[0]?.isoDate ?? `w-${week.weekNumber}`

  const maxLane =
    segments.length === 0 ? -1 : Math.max(...segments.map((s) => s.lane))
  const laneCount = maxLane + 1
  const stackHeightPx =
    laneCount > 0
      ? laneCount * EVENT_BAR_H_PX + (laneCount - 1) * EVENT_BAR_LANE_GAP_PX
      : 0

  return (
    <tr
      className={cn(className, styles.eventCalendarWeekRow)}
      style={style}
      {...trProps}
    >
      {Children.map(children, (child, colIndex) => {
        if (!isValidElement(child)) return child
        const td = child as ReactElement<TdProps>
        const cellSegments = segments
          .filter(
            (s) => colIndex >= s.startCol && colIndex <= getSegmentEndCol(s),
          )
          .slice()
          .sort((a, b) => a.lane - b.lane)

        if (cellSegments.length === 0) {
          return cloneElement(td, {
            className: cn(td.props.className, styles.dayCellWithBars),
          })
        }

        return cloneElement(td, {
          className: cn(td.props.className, styles.dayCellWithBars),
          children: (
            <>
              {td.props.children}
              <div className={styles.eventBarsLayer}>
                {cellSegments.map((seg) => {
                  const shape = getSegmentShape(colIndex, seg)
                  const isBarStart = colIndex === seg.startCol
                  const trackCls = cn(
                    styles.eventBarTrack,
                    trackShapeClass[shape],
                    seg.event.trackClassName,
                  )
                  const faceCls = cn(
                    styles.eventBarFace,
                    faceShapeClass[shape],
                    seg.event.barClassName,
                  )

                  const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
                    barInteraction.cancelCloseDetail()
                    barInteraction.openDetail(
                      seg.event,
                      e.currentTarget.getBoundingClientRect(),
                    )
                  }

                  const key = `${seg.eventId}-${weekKey}-c${colIndex}`

                  if (isBarStart) {
                    return (
                      <div
                        key={key}
                        className={styles.eventBarAnchor}
                        style={laneAnchorTopStyle(seg.lane, stackHeightPx)}
                      >
                        <div className={trackCls}>
                          <button
                            type="button"
                            className={faceCls}
                            tabIndex={0}
                            aria-label={`일정: ${seg.event.title}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={barInteraction.scheduleCloseDetail}
                            onFocus={(e) => {
                              barInteraction.cancelCloseDetail()
                              barInteraction.openDetail(
                                seg.event,
                                e.currentTarget.getBoundingClientRect(),
                              )
                            }}
                            onBlur={barInteraction.scheduleCloseDetail}
                          >
                            <span className={styles.eventBarTitle}>
                              {seg.event.title}
                            </span>
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={key}
                      className={cn(
                        styles.eventBarAnchor,
                        styles.eventBarAnchorContinuation,
                      )}
                      style={laneAnchorTopStyle(seg.lane, stackHeightPx)}
                    >
                      <div className={trackCls}>
                        <div
                          role="presentation"
                          aria-hidden
                          className={cn(faceCls, styles.eventBarFaceContinuation)}
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={barInteraction.scheduleCloseDetail}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ),
        })
      })}
    </tr>
  )
}
