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

export const STATUS_STYLE: Record<ItemStatus, string> = {
  논의: "warn",
  방향합의: "primary",
  확정: "success",
}

export const PRIORITY_LABELS = { P0: "P0", P1: "P1", P2: "P2" } as const

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
