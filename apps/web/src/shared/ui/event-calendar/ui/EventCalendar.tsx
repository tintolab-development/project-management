import { format, startOfMonth } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { getDefaultClassNames, type CalendarWeek } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { EventCalendarItem } from "../model/types"

import { EventCalendarItemDetailPanel } from "./EventCalendarItemDetailPanel"
import {
  EventCalendarWeekWithEvents,
  type EventCalendarBarInteraction,
} from "./EventCalendarWeekWithEvents"

import styles from "./EventCalendar.module.css"

const rdp = getDefaultClassNames()

export type EventCalendarProps = {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  events: EventCalendarItem[]
  weekStartsOn?: 0 | 1
  className?: string
}

type CalendarWeekRowProps = {
  week: CalendarWeek
  className?: string
  style?: CSSProperties
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children">

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

  const [detail, setDetail] = useState<{
    event: EventCalendarItem
    anchorRect: DOMRect
  } | null>(null)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const cancelCloseDetail = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleCloseDetail = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = setTimeout(() => {
      setDetail(null)
      closeTimerRef.current = null
    }, 180)
  }, [])

  const openDetail = useCallback(
    (eventItem: EventCalendarItem, anchorRect: DOMRect) => {
      cancelCloseDetail()
      setDetail({ event: eventItem, anchorRect })
    },
    [cancelCloseDetail],
  )

  const barInteraction = useMemo<EventCalendarBarInteraction>(
    () => ({
      openDetail,
      scheduleCloseDetail,
      cancelCloseDetail,
    }),
    [openDetail, scheduleCloseDetail, cancelCloseDetail],
  )

  const components = useMemo(
    () => ({
      Week: (props: CalendarWeekRowProps) => (
        <EventCalendarWeekWithEvents
          {...props}
          events={events}
          barInteraction={barInteraction}
        />
      ),
    }),
    [events, barInteraction],
  )

  return (
    <div className={cn(styles.calendarShell, className)}>
      <Calendar
        month={viewMonth}
        onMonthChange={handleMonthChange}
        weekStartsOn={weekStartsOn}
        locale={enUS}
        showOutsideDays
        navLayout="around"
        captionLayout="label"
        formatters={{
          formatCaption: (date) => format(date, "M월 yyyy", { locale: ko }),
          formatWeekdayName: (weekday) =>
            format(weekday, "EEE", { locale: enUS }),
        }}
        modifiersClassNames={{
          /* modifiersClassNames 가 있으면 classNames.today 는 무시됨 — 여기에 배경·rdp 클래스 포함 */
          today: cn(
            rdp.today,
            styles.todayDayCell,
            "font-semibold text-foreground shadow-none !ring-0 ring-offset-0 outline-none",
            "[&_button]:!bg-transparent [&_button]:text-foreground [&_button]:shadow-none [&_button]:!ring-0 [&_button]:border-0",
          ),
          outside:
            "!bg-white text-muted-foreground opacity-50 aria-selected:opacity-40",
        }}
        components={components}
        className={cn(
          "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col rounded-xl border border-border bg-card p-3 shadow-sm",
        )}
        classNames={{
          root: cn(rdp.root, "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col"),
          months: cn(
            rdp.months,
            "relative flex h-full min-h-0 w-full flex-1 flex-col gap-0",
          ),
          month: cn(
            rdp.month,
            "grid h-full min-h-0 w-full flex-1 self-stretch gap-0",
            styles.monthShell,
          ),
          month_caption: cn(
            rdp.month_caption,
            "h-auto w-auto shrink-0 items-center justify-center px-0",
          ),
          caption_label: cn(rdp.caption_label, styles.calendarCaptionLabel),
          button_previous: cn(
            buttonVariants({ variant: "ghost" }),
            "select-none aria-disabled:opacity-50",
            rdp.button_previous,
            styles.navIconButton,
          ),
          button_next: cn(
            buttonVariants({ variant: "ghost" }),
            "select-none aria-disabled:opacity-50",
            rdp.button_next,
            styles.navIconButton,
          ),
          month_grid: cn(rdp.month_grid, styles.monthGrid),
          weekday: cn(rdp.weekday, styles.weekdayCell),
          today: cn(
            rdp.today,
            styles.todayDayCell,
            "text-foreground shadow-none ring-0 data-[selected=true]:rounded-none",
          ),
          day: cn(
            rdp.day,
            "!aspect-auto max-w-none min-w-0 align-top",
            styles.dayCell,
          ),
          day_button: cn(
            rdp.day_button,
            "h-full min-h-0 w-full min-w-0 max-w-none rounded-none border-0 shadow-none [&>span]:text-xs [&>span]:opacity-70",
            styles.dayButton,
          ),
        }}
      />

      {detail != null
        ? createPortal(
            <EventCalendarItemDetailPanel
              event={detail.event}
              anchorRect={detail.anchorRect}
              onRequestClose={() => {
                cancelCloseDetail()
                setDetail(null)
              }}
              onPointerEnterPanel={cancelCloseDetail}
              onPointerLeavePanel={scheduleCloseDetail}
            />,
            document.body,
          )
        : null}
    </div>
  )
}
