import { useEffect, useMemo, useState } from "react"
import { getMonth, getYear, startOfMonth } from "date-fns"
import { useSearchParams } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import type { ItemType, Priority } from "@/entities/item/model/types"
import {
  EventCalendar,
  type EventCalendarItem,
} from "@/shared/ui/event-calendar"

import { getAprilMockCalendarEvents } from "../lib/calendarAprilMockEvents"
import {
  CALENDAR_MONTH_QUERY_KEY,
  formatCalendarMonthQuery,
  parseCalendarMonthQuery,
} from "@/shared/lib/calendarMonthQuery"
import { CalendarBoardShell } from "@/widgets/calendar-board"
import { itemToCalendarEvent } from "../lib/itemToCalendarEvent"
import { CalendarFiltersPanel } from "./CalendarFiltersPanel"


export const CalendarPage = () => {
  const navigate = useNavigate()
  const paths = useProjectScopedPaths()

export const CalendarPage = () => {
  const items = useAppStore((s) => s.items)
  const domains = useAppStore((s) => s.domains)
  const [searchParams, setSearchParams] = useSearchParams()

  const [typeFilter, setTypeFilter] = useState<ItemType | "">("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("")
  const [domainFilter, setDomainFilter] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("")

  const viewMonth = useMemo(() => {
    const parsed = parseCalendarMonthQuery(
      searchParams.get(CALENDAR_MONTH_QUERY_KEY),
    )
    if (parsed) return parsed
    return startOfMonth(new Date())
  }, [searchParams])

  useEffect(() => {
    const raw = searchParams.get(CALENDAR_MONTH_QUERY_KEY)
    if (parseCalendarMonthQuery(raw)) return
    const next = formatCalendarMonthQuery(new Date())
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set(CALENDAR_MONTH_QUERY_KEY, next)
        return p
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  const handleMonthChange = (next: Date) => {
    const normalized = startOfMonth(next)
    const value = formatCalendarMonthQuery(normalized)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set(CALENDAR_MONTH_QUERY_KEY, value)
        return p
      },
      { replace: true },
    )
  }

  const allEvents = useMemo(() => {
    const list: EventCalendarItem[] = []
    for (const item of items) {
      const ev = itemToCalendarEvent(item, domains)
      if (ev) list.push(ev)
    }
    if (getMonth(viewMonth) === 3) {
      list.push(...getAprilMockCalendarEvents(getYear(viewMonth)))
    }
    return list
  }, [items, domains, viewMonth])

  const events = useMemo(
    () =>
      filterEvents(
        allEvents,
        typeFilter,
        priorityFilter,
        domainFilter,
        ownerFilter,
      ),
    [allEvents, typeFilter, priorityFilter, domainFilter, ownerFilter],
  )

  return (
    <CalendarBoardShell
      filters={
        <CalendarFiltersPanel
          domains={domains}
          items={items}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          domainFilter={domainFilter}
          onDomainFilterChange={setDomainFilter}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
        />
      }
      calendar={
        <EventCalendar
          month={viewMonth}
          onMonthChange={handleMonthChange}
          events={events}
          weekStartsOn={0}
        />
      }
    />
  )
}
