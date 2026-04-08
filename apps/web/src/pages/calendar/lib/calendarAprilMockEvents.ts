import type { EventCalendarItem } from "@/shared/ui/event-calendar"

import barStyles from "../ui/calendarEventBars.module.css"

/** 데모용 — 4월에만 캘린더에 합류 (멀티데이·겹침 포함) */
export const getAprilMockCalendarEvents = (year: number): EventCalendarItem[] => {
  const ap = (day: number) => new Date(year, 3, day)

  const tagMuted = "bg-muted text-muted-foreground ring-1 ring-border/60"
  const tagBlue = "bg-sky-100 text-sky-900 ring-1 ring-sky-200"
  const tagAmber = "bg-amber-100 text-amber-950 ring-1 ring-amber-200"

  return [
    {
      id: "mock-cal-apr-sprint",
      title: "MOCK-001 | 4월 스프린트 범위·일정 합의",
      start: ap(3),
      end: ap(9),
      barClassName: barStyles.faceP0,
      trackClassName: barStyles.trackP0,
      preview: {
        itemCode: "MOCK-001",
        itemName: "4월 스프린트 범위·일정 합의",
        tags: [
          { label: "의사결정", className: tagBlue },
          { label: "예약", className: tagBlue },
          { label: "논의", className: tagAmber },
        ],
        assignees: "김민지(틴토랩), 박민수(설해원)",
        dueDate: `${year}.04.09`,
        categoryLabel: "제품",
        description: "목 데이터: 4/3–4/9 멀티데이 일정입니다.",
      },
    },
    {
      id: "mock-cal-apr-release",
      title: "MOCK-002 | 릴리즈 체크리스트 & QA",
      start: ap(7),
      end: ap(16),
      barClassName: barStyles.faceP1,
      trackClassName: barStyles.trackP1,
      preview: {
        itemCode: "MOCK-002",
        itemName: "릴리즈 체크리스트 & QA",
        tags: [
          { label: "릴리즈", className: tagMuted },
          { label: "P1", className: "bg-orange-100 text-orange-900 ring-1 ring-orange-200" },
        ],
        assignees: "이서연",
        dueDate: `${year}.04.16`,
        categoryLabel: "운영",
        description: "목 데이터: 4/7–4/16, MOCK-001과 기간이 겹칩니다.",
      },
    },
    {
      id: "mock-cal-apr-design",
      title: "MOCK-003 | 디자인 시스템 토큰 정리",
      start: ap(14),
      end: ap(22),
      barClassName: barStyles.faceP2,
      trackClassName: barStyles.trackP2,
      preview: {
        itemCode: "MOCK-003",
        itemName: "디자인 시스템 토큰 정리",
        tags: [{ label: "디자인", className: tagBlue }],
        assignees: "최다인",
        dueDate: `${year}.04.22`,
        categoryLabel: "디자인",
        description: "목 데이터: 4/14–4/22.",
      },
    },
    {
      id: "mock-cal-apr-docs",
      title: "MOCK-004 | API 문서 초안",
      start: ap(18),
      end: ap(25),
      barClassName: barStyles.faceP3,
      trackClassName: barStyles.trackP3,
      preview: {
        itemCode: "MOCK-004",
        itemName: "API 문서 초안",
        tags: [{ label: "문서", className: tagMuted }],
        assignees: "정우빈",
        dueDate: `${year}.04.25`,
        categoryLabel: "개발",
        description: "목 데이터: 4/18–4/25, MOCK-003과 겹침.",
      },
    },
    {
      id: "mock-cal-apr-short",
      title: "MOCK-005 | 월간 회고",
      start: ap(28),
      end: ap(30),
      barClassName: barStyles.faceP2,
      trackClassName: barStyles.trackP2,
      preview: {
        itemCode: "MOCK-005",
        itemName: "월간 회고",
        tags: [{ label: "회의", className: tagAmber }],
        assignees: "전체",
        dueDate: `${year}.04.30`,
        description: "목 데이터: 4/28–4/30 짧은 멀티데이.",
      },
    },
  ]
}
