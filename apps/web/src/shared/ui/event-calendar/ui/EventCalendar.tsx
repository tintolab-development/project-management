import { addMonths, format, isSameMonth, startOfMonth } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/typography"

import { getMonthWeeks } from "../lib/get-month-weeks"
import { layoutWeekSegments, maxLaneIndex } from "../lib/layout-week-segments"
import type { EventCalendarItem } from "../model/types"

import styles from "./EventCalendar.module.css"

const LANE_PX = 22
const LANE_GAP_PX = 6

export type EventCalendarProps = {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  events: EventCalendarItem[]
  weekStartsOn?: 0 | 1
  className?: string
}

function EventPreviewBody({ event }: { event: EventCalendarItem }) {
  const preview = event.preview
  if (!preview) {
    return (
      <div className="w-64 p-3 text-left">
        <Text variant="small" className="font-semibold">
          {event.title}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex w-72 flex-col gap-3 p-3 text-left">
      {preview.itemCode ? (
        <Text variant="detailCode" className="mb-0">
          {preview.itemCode}
        </Text>
      ) : null}
      {preview.itemName ? (
        <Text variant="listTitle" className="mb-0 text-base">
          {preview.itemName}
        </Text>
      ) : (
        <Text variant="listTitle" className="mb-0 text-base">
          {event.title}
        </Text>
      )}
      {preview.tags && preview.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {preview.tags.map((tag) => (
            <span
              key={tag.label}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                tag.className ??
                  "bg-muted text-muted-foreground ring-1 ring-border/60",
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
      ) : null}
      {preview.assignees ? (
        <Text variant="muted" className="mb-0 text-[13px]">
          담당자 : {preview.assignees}
        </Text>
      ) : null}
      {preview.dueDate ? (
        <Text variant="muted" className="mb-0 text-[13px]">
          완료예정일 : {preview.dueDate}
        </Text>
      ) : null}
    </div>
  )
}

export function EventCalendar({
  month: controlledMonth,
  defaultMonth,
  onMonthChange,
  events,
  weekStartsOn = 0,
  className,
}: EventCalendarProps) {
  const [innerMonth, setInnerMonth] = useState(() =>
    startOfMonth(defaultMonth ?? new Date()),
  )

  const viewMonth = controlledMonth
    ? startOfMonth(controlledMonth)
    : innerMonth

  const setMonth = (next: Date) => {
    const normalized = startOfMonth(next)
    onMonthChange?.(normalized)
    if (controlledMonth === undefined) {
      setInnerMonth(normalized)
    }
  }

  const weeks = useMemo(
    () => getMonthWeeks(viewMonth, weekStartsOn),
    [viewMonth, weekStartsOn],
  )

  const weekdaySeed = weeks[0]?.[0] ?? viewMonth

  const monthTitle = format(viewMonth, "M월 yyyy", { locale: ko })

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.header}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="이전 달"
          onClick={() => setMonth(addMonths(viewMonth, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className={styles.monthLabel}>{monthTitle}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="다음 달"
          onClick={() => setMonth(addMonths(viewMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className={styles.weekdayRow}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekdaySeed)
          d.setDate(weekdaySeed.getDate() + i)
          return (
            <div key={i} className={styles.weekdayCell}>
              {format(d, "EEE", { locale: ko })}
            </div>
          )
        })}
      </div>

      <div className={styles.body}>
        {weeks.map((week) => {
          const segments = layoutWeekSegments(week, events)
          const maxL = maxLaneIndex(segments)
          const stripMin =
            maxL < 0 ? 4 : (maxL + 1) * (LANE_PX + LANE_GAP_PX) + 4

          return (
            <div key={week[0].toISOString()} className={styles.weekRow}>
              {week.map((day, col) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    styles.dayCell,
                    col === 6 && styles.dayCellLast,
                  )}
                  style={{ gridColumn: col + 1 }}
                >
                  <span
                    className={
                      isSameMonth(day, viewMonth)
                        ? styles.dayNum
                        : styles.dayNumMuted
                    }
                  >
                    {format(day, "d")}
                  </span>
                </div>
              ))}
              <div
                className={styles.eventStrip}
                style={{ minHeight: stripMin }}
              >
                {segments.map((seg) => {
                  const leftPct = (seg.startCol / 7) * 100
                  const widthPct = (seg.span / 7) * 100
                  const topPx = seg.lane * (LANE_PX + LANE_GAP_PX)
                  const ev = seg.event
                  const badge = ev.badge
                  const badgeOffset = badge?.dayOffsetInSegment ?? 0
                  const badgeLeftPct =
                    seg.span > 0
                      ? Math.min(
                          92,
                          Math.max(8, ((0.5 + badgeOffset) / seg.span) * 100),
                        )
                      : 50

                  return (
                    <Tooltip
                      key={`${ev.id}-${week[0].toISOString()}-${seg.startCol}`}
                    >
                      <TooltipTrigger
                        delay={180}
                        closeOnClick={false}
                        render={
                          <button
                            type="button"
                            className={styles.eventBar}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              top: topPx,
                            }}
                          >
                            <span
                              className={cn(styles.track, ev.trackClassName)}
                            />
                            <span className={cn(styles.face, ev.barClassName)}>
                              {ev.title}
                            </span>
                            {badge ? (
                              <span
                                className={styles.badge}
                                style={{
                                  left: `${badgeLeftPct}%`,
                                  top: "50%",
                                  transform: "translate(-50%, -50%)",
                                }}
                              >
                                {badge.label}
                              </span>
                            ) : null}
                          </button>
                        }
                      />
                      <TooltipContent
                        side="top"
                        sideOffset={10}
                        align="start"
                        className={cn(
                          "z-50 max-w-none border border-border bg-card p-0 text-card-foreground shadow-lg",
                          "[&>svg]:hidden",
                        )}
                      >
                        <EventPreviewBody event={ev} />
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
