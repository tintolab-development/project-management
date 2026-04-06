import type { ItemStatus } from "@/shared/constants/labels"

export type ItemType =
  | "information_request"
  | "decision"
  | "review"
  | "issue"
  | "change_request"

export type Priority = "P0" | "P1" | "P2"

export type Item = {
  id: string
  code: string
  type: ItemType
  domain: string
  title: string
  description: string
  priority: Priority
  status: ItemStatus
  owner: string
  dueDate: string
  clientResponse: string
  finalConfirmedValue: string
  isLocked: boolean
  /** 같은 status 컬럼 내 칸반 정렬(오름차순). */
  boardRank: number
  createdAt: string
  updatedAt: string
}
