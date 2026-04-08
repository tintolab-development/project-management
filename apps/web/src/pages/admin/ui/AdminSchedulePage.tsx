import { startOfMonth } from "date-fns"
import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import {
  EMPTY_ADMIN_PROJECTS_FILTERS,
  useAdminProjectsQuery,
} from "@/features/admin-projects"
import {
  AdminScheduleFilters,
  adminScheduleEventToCalendarItem,
  adminScheduleRangeFromViewMonth,
  mergeAdminScheduleViewMonthIntoParams,
  parseAdminScheduleListState,
  useAdminScheduleQuery,
} from "@/features/admin-schedule"
import { EventCalendar, type EventCalendarItem } from "@/shared/ui/event-calendar"
import { CalendarBoardShell } from "@/widgets/calendar-board"

import styles from "./AdminSchedulePage.module.css"

export const AdminSchedulePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const applied = useMemo(
    () => parseAdminScheduleListState(searchParams),
    [searchParams],
  )

  const range = useMemo(
    () => adminScheduleRangeFromViewMonth(applied.viewMonth),
    [applied.viewMonth],
  )

  const { data: projects = [] } = useAdminProjectsQuery(
    EMPTY_ADMIN_PROJECTS_FILTERS,
  )

  const projectOptions = useMemo(
    () => [
      { value: "", label: "전체" },
      ...projects.map((p) => ({ value: p.id, label: p.name })),
    ],
    [projects],
  )

  const { data: eventsRaw = [], isPending, isError, error } =
    useAdminScheduleQuery(range)

  const calendarItems = useMemo(() => {
    const items: EventCalendarItem[] = []
    for (const ev of eventsRaw) {
      const mapped = adminScheduleEventToCalendarItem(ev)
      if (mapped) items.push(mapped)
    }
    const project = applied.project.trim()
    const q = applied.q.trim().toLowerCase()
    let list = items
    if (project.length > 0) {
      list = list.filter(
        (mappedEv) => mappedEv.calendarFilter?.projectId === project,
      )
    }
    if (q.length > 0) {
      list = list.filter((mappedEv) => {
        const title = mappedEv.title.toLowerCase()
        const aff = mappedEv.calendarFilter?.affiliation?.toLowerCase() ?? ""
        const owner = mappedEv.calendarFilter?.owner?.toLowerCase() ?? ""
        return (
          title.includes(q) ||
          aff.includes(q) ||
          owner.includes(q)
        )
      })
    }
    return list
  }, [eventsRaw, applied.project, applied.q])

  const viewMonth = useMemo(
    () => startOfMonth(applied.viewMonth),
    [applied.viewMonth],
  )

  const handleMonthChange = useCallback(
    (next: Date) => {
      const normalized = startOfMonth(next)
      const nextParams = mergeAdminScheduleViewMonthIntoParams(
        searchParams,
        normalized,
      )
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return (
    <main className={styles.root}>
      <CalendarBoardShell
        filters={
          <>
            <AdminScheduleFilters
              key={`${applied.project}|${applied.q}`}
              projectOptions={projectOptions}
            />
            {isError ? (
              <p
                className={`${styles.stateMessage} ${styles.stateError}`}
                role="alert"
              >
                {error instanceof Error
                  ? error.message
                  : "일정을 불러오지 못했습니다."}
              </p>
            ) : null}
            {isPending && !isError ? (
              <p className={styles.stateMessage} aria-live="polite">
                불러오는 중…
              </p>
            ) : null}
          </>
        }
        calendar={
          <div className={styles.calendarWrap}>
            <EventCalendar
              month={viewMonth}
              onMonthChange={handleMonthChange}
              events={calendarItems}
            />
          </div>
        }
      />
    </main>
  )
}
