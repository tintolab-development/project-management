import type { PillTone } from "@/shared/ui/pill"

export const TYPE_LABELS: Record<string, string> = {
  information_request: "고객정보 요청",
  decision: "의사결정",
  review: "검토 요청",
  issue: "이슈",
  change_request: "변경 요청",
}

export const STATUS_VALUES = ["논의", "방향합의", "확정"] as const
export type ItemStatus = (typeof STATUS_VALUES)[number]

export const STATUS_LABELS: Record<ItemStatus, string> = {
  논의: "논의",
  방향합의: "방향합의",
  확정: "확정",
}

/**
 * 아이템 상태(논의·방향합의·확정)별 Pill/Badge 색상 톤.
 * {@link Pill}·{@link Badge} pill* 변형과 동일한 의미의 토큰이다.
 */
export const STATUS_PILL_TONE: Record<ItemStatus, PillTone> = {
  논의: "warn",
  방향합의: "primary",
  확정: "success",
}

export const isItemStatus = (value: string): value is ItemStatus =>
  (STATUS_VALUES as readonly string[]).includes(value)

/** 알 수 없는 status 문자열은 `dark` 톤으로 폴백 */
export const statusToPillTone = (status: string): PillTone =>
  isItemStatus(status) ? STATUS_PILL_TONE[status] : "dark"

export const PRIORITY_LABELS = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
} as const

export const WORKSPACE_TYPES = ["information_request", "decision"] as const

export const BASE_DOMAIN_SEED = [
  { id: "common", name: "공통" },
  { id: "reservation", name: "예약" },
  { id: "web", name: "웹사이트" },
  { id: "app", name: "모바일 앱" },
  { id: "commerce", name: "쇼핑몰" },
  { id: "ops", name: "운영/유지보수" },
  { id: "integration", name: "외부연동" },
] as const
