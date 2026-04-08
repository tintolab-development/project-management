import { useEffect, useMemo, useState } from "react"
import { startOfMonth } from "date-fns"
import { useSearchParams } from "react-router-dom"

import { useAppStore } from "@/app/store/useAppStore"
import type { ItemType, Priority } from "@/entities/item/model/types"
import {
  EventCalendar,
  type EventCalendarItem,
} from "@/shared/ui/event-calendar"

import {
  CALENDAR_MONTH_QUERY_KEY,
  formatCalendarMonthQuery,
  parseCalendarMonthQuery,
} from "../lib/calendarMonthQuery"
import { itemToCalendarEvent } from "../lib/itemToCalendarEvent"
import { CalendarFiltersPanel } from "./CalendarFiltersPanel"

import styles from "./CalendarPage.module.css"

const filterEvents = (
  events: EventCalendarItem[],
  typeFilter: ItemType | "",
  priorityFilter: Priority | "",
  domainFilter: string,
  ownerFilter: string,
): EventCalendarItem[] =>
  events.filter((ev) => {
    const f = ev.calendarFilter
    if (!f) return true
    if (typeFilter !== "" && f.itemType !== typeFilter) {
      return false
    }
    if (priorityFilter !== "" && f.priority !== priorityFilter) {
      return false
    }
    if (domainFilter !== "" && f.domainId !== domainFilter) {
      return false
    }
    if (ownerFilter !== "" && f.owner !== ownerFilter) {
      return false
    }
    return true
  })

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
    return list
  }, [items, domains])

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
    <div className={styles.root}>
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
      <div className={styles.calendarSection}>
        <EventCalendar
          month={viewMonth}
          onMonthChange={handleMonthChange}
          events={events}
          weekStartsOn={0}
        />
      </div>
    </div>
  )
}
