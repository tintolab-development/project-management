import type { AdminScheduleEvent } from "@/features/admin-schedule/model/adminScheduleEvent"

/** 관리자 일정 캘린더 목 데이터 — `ap-*` 프로젝트와 연결 */
export const ADMIN_SCHEDULE_EVENTS_SEED: AdminScheduleEvent[] = [
  {
    id: "as-001",
    adminProjectId: "ap-001",
    projectName: "고객 의사결정 워크스페이스",
    ownerName: "홍길동",
    affiliation: "Tintolab",
    startDate: "2026-03-06",
    endDate: "2026-03-11",
  },
  {
    id: "as-002",
    adminProjectId: "ap-001",
    projectName: "고객 의사결정 워크스페이스",
    ownerName: "김민수",
    affiliation: "Tintolab",
    startDate: "2026-03-07",
    endDate: "2026-03-11",
  },
  {
    id: "as-003",
    adminProjectId: "ap-002",
    projectName: "B2B 포털 리뉴얼",
    ownerName: "이서연",
    affiliation: "계약사 A",
    startDate: "2026-03-15",
    endDate: "2026-03-20",
  },
  {
    id: "as-004",
    adminProjectId: "ap-005",
    projectName: "CS 자동 분류",
    ownerName: "강도윤",
    affiliation: "CS본부",
    startDate: "2026-04-02",
    endDate: "2026-04-09",
  },
  {
    id: "as-005",
    adminProjectId: "ap-003",
    projectName: "모바일 알림 허브",
    ownerName: "한지우",
    affiliation: "모바일팀",
    startDate: "2026-05-10",
    endDate: "2026-05-14",
  },
]
