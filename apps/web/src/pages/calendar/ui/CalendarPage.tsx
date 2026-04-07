import { useMemo, useState } from "react"

import { useAppStore } from "@/app/store/useAppStore"
import {
  EventCalendar,
  type EventCalendarItem,
} from "@/shared/ui/event-calendar"
import type { ItemType, Priority } from "@/entities/item/model/types"

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

export function CalendarPage() {
  const items = useAppStore((s) => s.items)
  const domains = useAppStore((s) => s.domains)

  const [month, setMonth] = useState(() => new Date(2026, 2, 1))
  const [typeFilter, setTypeFilter] = useState<ItemType | "">("")
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("")
  const [domainFilter, setDomainFilter] = useState("")
  const [ownerFilter, setOwnerFilter] = useState("")

  const allEvents = useMemo(() => {
    const list: EventCalendarItem[] = []
    for (const item of items) {
      const ev = itemToCalendarEvent(item)
      if (ev) list.push(ev)
    }
    return list
  }, [items])

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
      <div className={styles.calendarWrap}>
        <EventCalendar
          month={month}
          onMonthChange={setMonth}
          events={events}
          weekStartsOn={0}
        />
      </div>
    </div>
  )
}
