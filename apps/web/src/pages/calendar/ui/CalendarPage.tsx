import { useMemo, useState } from "react"

import { Heading } from "@/shared/ui/typography"
import {
  EventCalendar,
  type EventCalendarItem,
} from "@/shared/ui/event-calendar"

import styles from "./CalendarPage.module.css"

function marchDay(day: number) {
  return new Date(2026, 2, day)
}

export function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(2026, 2, 1))

  const events = useMemo<EventCalendarItem[]>(
    () => [
      {
        id: "d-001",
        title: "D-001 | 판매 기능 재고의 authoritative source 확정",
        start: marchDay(6),
        end: marchDay(11),
        preview: {
          itemCode: "아이템코드",
          itemName: "아이템명",
          tags: [
            { label: "의사결정", className: "bg-sky-100 text-sky-900 ring-1 ring-sky-200" },
            { label: "예약", className: "bg-blue-600 text-white ring-0" },
            {
              label: "논의",
              className: "bg-amber-100 text-amber-950 ring-1 ring-amber-200",
            },
          ],
          assignees: "김민지(틴토랩), 박민수(설해원)",
          dueDate: "2026.04.01",
        },
      },
      {
        id: "short-1",
        title: "짧은 일정",
        start: marchDay(18),
        end: marchDay(18),
        barClassName: "!bg-emerald-600",
        trackClassName: "!bg-emerald-300/40",
        preview: {
          itemName: "단일 일정 미리보기",
          dueDate: "2026.03.20",
        },
      },
    ],
    [],
  )

  return (
    <div className={styles.root}>
      <header>
        <Heading as="h1" variant="display" className="mb-2">
          캘린더
        </Heading>
        <p className={styles.intro}>
          주 단위로 겹치는 일정은 자동으로 층(lane)을 나눕니다. 막대에 마우스를 올리면
          상세 미리보기가 열립니다.
        </p>
      </header>
      <EventCalendar
        month={month}
        onMonthChange={setMonth}
        events={events}
        weekStartsOn={0}
      />
    </div>
  )
}
