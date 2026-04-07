import { format, startOfDay, startOfMonth } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import { useMemo, useState, type HTMLAttributes, type ReactNode } from "react"
import type { CalendarWeek } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { Text } from "@/shared/ui/typography"
import { cn } from "@/lib/utils"

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
          {preview.tags.map((tag, idx) => (
            <span
              key={`${tag.label}-${idx}`}
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

type EventCalendarWeekRowProps = {
  week: CalendarWeek
  events: EventCalendarItem[]
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children">

function EventCalendarWeekRow({
  week,
  events,
  className,
  style,
  children,
  ...trProps
}: EventCalendarWeekRowProps) {
  const weekDates = useMemo(
    () => week.days.map((d) => startOfDay(d.date)),
    [week.days],
  )

  const segments = useMemo(
    () => layoutWeekSegments(weekDates, events),
    [weekDates, events],
  )

  const maxL = maxLaneIndex(segments)
  const stripMin =
    maxL < 0 ? 4 : (maxL + 1) * (LANE_PX + LANE_GAP_PX) + 4

  const weekKey = week.days[0]?.isoDate ?? String(week.weekNumber)

  return (
    <>
      <tr className={className} style={style} {...trProps}>
        {children}
      </tr>
      <tr className={styles.eventMetaRow}>
        <td className={styles.eventMetaCell} colSpan={week.days.length}>
          <div
            className={styles.eventStrip}
            style={{ minHeight: stripMin }}
          >
            {segments.map((seg) => {
              const leftPct = (seg.startCol / 7) * 100
              const widthPct = (seg.span / 7) * 100
              const topPx = seg.lane * (LANE_PX + LANE_GAP_PX)
              const ev = seg.event

              return (
                <Tooltip
                  key={`${ev.id}-${weekKey}-${seg.startCol}`}
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
        </td>
      </tr>
    </>
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

  const handleMonthChange = (next: Date) => {
    const normalized = startOfMonth(next)
    onMonthChange?.(normalized)
    if (controlledMonth === undefined) {
      setInnerMonth(normalized)
    }
  }

  const components = useMemo(
    () => ({
      Week: (
        props: {
          week: CalendarWeek
          className?: string
          style?: React.CSSProperties
          children?: ReactNode
        } & Omit<HTMLAttributes<HTMLTableRowElement>, "children">,
      ) => <EventCalendarWeekRow {...props} events={events} />,
    }),
    [events],
  )

  return (
    <div className={cn(styles.calendarShell, className)}>
      <Calendar
        month={viewMonth}
        onMonthChange={handleMonthChange}
        weekStartsOn={weekStartsOn}
        locale={enUS}
        showOutsideDays
        captionLayout="label"
        formatters={{
          formatCaption: (date) => format(date, "M월 yyyy", { locale: ko }),
        }}
        modifiersClassNames={{
          today:
            "!bg-primary !text-primary-foreground rounded-full font-medium shadow-none",
        }}
        components={components}
        className={cn(
          "w-full min-w-0 rounded-lg border bg-background p-2 shadow-none",
        )}
        classNames={{
          root: "w-full min-w-0",
          months: "w-full",
          month: "w-full gap-3",
          month_grid: "w-full table-fixed border-collapse",
        }}
      />
    </div>
  )
}
