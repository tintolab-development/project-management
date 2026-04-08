export type EventCalendarPreviewTag = {
  label: string
  className?: string
}

export type EventCalendarItem = {
  id: string
  title: string
  start: Date
  end: Date
  barClassName?: string
  trackClassName?: string
  preview?: {
    itemCode?: string
    itemName?: string
    tags?: EventCalendarPreviewTag[]
    assignees?: string
    /** 단일·기간 표시(예: 완료예정일 또는 일정 구간) */
    dueDate?: string
    categoryLabel?: string
    description?: string
  }
  /** 페이지에서 필터링할 때만 사용(렌더링에 영향 없음) */
  calendarFilter?: {
    itemType: string
    domainId: string
    priority: string
    owner: string
  }
}

export type EventCalendarWeekSegment = {
  eventId: string
  startCol: number
  span: number
  lane: number
  event: EventCalendarItem
}
