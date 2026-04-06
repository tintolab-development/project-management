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
    dueDate?: string
  }
}

export type EventCalendarWeekSegment = {
  eventId: string
  startCol: number
  span: number
  lane: number
  event: EventCalendarItem
}
