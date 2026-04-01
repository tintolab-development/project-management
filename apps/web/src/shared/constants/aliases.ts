export const HEADER_ALIASES: Record<string, string[]> = {
  code: ["code", "id", "itemcode", "itemid", "코드", "항목코드"],
  type: ["type", "유형"],
  domain: ["domain", "도메인"],
  title: ["title", "제목"],
  description: ["description", "설명"],
  priority: ["priority", "우선순위"],
  status: ["status", "상태"],
  owner: ["owner", "담당자"],
  dueDate: ["duedate", "due", "마감일", "일정"],
  clientResponse: ["clientresponse", "고객회신값", "고객회신", "회신값"],
  finalConfirmedValue: [
    "finalconfirmedvalue",
    "최종확인값",
    "최종 확인값",
    "확인값",
  ],
}

export const TYPE_VALUE_ALIASES: Record<string, string[]> = {
  information_request: [
    "information_request",
    "informationrequest",
    "고객정보요청",
    "고객정보 요청",
    "정보요청",
    "정보 요청",
  ],
  decision: ["decision", "의사결정"],
  review: ["review", "검토요청", "검토 요청", "검토"],
  issue: ["issue", "이슈"],
  change_request: [
    "change_request",
    "changerequest",
    "변경요청",
    "변경 요청",
  ],
}

export const STATUS_VALUE_ALIASES: Record<string, string[]> = {
  논의: [
    "논의",
    "underreview",
    "under review",
    "논의중",
    "논의 중",
    "검토중",
    "검토 중",
    "reviewing",
    "sent",
    "responded",
    "open",
    "optionproposed",
    "needclarification",
    "draft",
    "recommended",
    "closed",
    "superseded",
  ],
  방향합의: ["방향합의", "방향 합의", "agreed", "합의"],
  확정: [
    "확정",
    "locked",
    "잠금",
    "최종기준확정",
    "최종 기준 확정",
    "확정잠금",
  ],
}

export const DOMAIN_VALUE_ALIASES: Record<string, string[]> = {
  common: ["common", "공통"],
  reservation: ["reservation", "예약"],
  web: ["web", "website", "웹", "웹사이트", "웹 사이트"],
  app: ["app", "mobileapp", "모바일앱", "모바일 앱", "앱"],
  commerce: ["commerce", "쇼핑몰", "커머스"],
  ops: [
    "ops",
    "operation",
    "operations",
    "운영",
    "유지보수",
    "운영유지보수",
    "운영/유지보수",
  ],
  integration: ["integration", "api", "외부연동", "연동"],
}

export const FIXED_IMPORT_ORDER = [
  "type",
  "domain",
  "title",
  "description",
  "priority",
  "status",
  "owner",
  "dueDate",
  "clientResponse",
  "finalConfirmedValue",
  "code",
] as const
