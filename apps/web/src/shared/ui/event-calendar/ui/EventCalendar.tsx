import { format, startOfMonth } from "date-fns"
import { enUS, ko } from "date-fns/locale"
import {
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { getDefaultClassNames, type CalendarWeek } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { EventCalendarItem } from "../model/types"

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

type EventCalendarWeekRowProps = {
  week: CalendarWeek
  className?: string
  style?: CSSProperties
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLTableRowElement>, "children">

function EventCalendarWeekRow({
  week,
  className,
  style,
  children,
  ...trProps
}: EventCalendarWeekRowProps) {
  void week

  return (
    <tr className={className} style={style} {...trProps}>
      {children}
    </tr>
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
          style?: CSSProperties
          children?: ReactNode
        } & Omit<HTMLAttributes<HTMLTableRowElement>, "children">,
      ) => <EventCalendarWeekRow {...props} />,
    }),
    [],
  )

  void events

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
        }}
        modifiersClassNames={{
          today:
            "!bg-white font-semibold text-foreground shadow-none ring-2 ring-inset ring-primary z-[1] [&_button]:!bg-white [&_button]:text-foreground [&_button]:shadow-none data-[selected=true]:!bg-white data-[selected=true]:[&_button]:!bg-white",
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
            "!bg-white text-foreground shadow-none ring-0 data-[selected=true]:!bg-white",
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
    </div>
  )
}
