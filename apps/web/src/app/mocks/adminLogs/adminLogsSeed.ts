import type { AdminLogRow } from "@/features/admin-logs/model/adminLog"

const PROJECTS: { id: string; name: string }[] = [
  { id: "ap-001", name: "고객 의사결정 워크스페이스" },
  { id: "ap-002", name: "B2B 포털 리뉴얼" },
  { id: "ap-003", name: "모바일 알림 허브" },
  { id: "ap-004", name: "데이터 거버넌스 PoC" },
  { id: "ap-005", name: "CS 자동 분류" },
  { id: "ap-006", name: "파트너 API 연동" },
  { id: "ap-007", name: "사내 위키 마이그레이션" },
  { id: "ap-008", name: "영업 실적 대시보드" },
  { id: "ap-009", name: "보안 점검 자동화" },
  { id: "ap-010", name: "온보딩 키트" },
  { id: "ap-011", name: "재고 최적화 실험" },
  { id: "ap-012", name: "고객 여정 맵" },
]

const AFFILIATIONS = [
  "(주)아르바이텐",
  "디자인파트너스",
  "클라우드팀",
  "데이터랩",
  "CS운영팀",
  "외부 파트너",
] as const

const EDITORS = [
  "김민수",
  "이서연",
  "박민지",
  "최수민",
  "정하늘",
  "한지우",
  "오준혁",
  "윤서아",
  "강도윤",
  "문채원",
  "신우석",
  "장세희",
] as const

const ITEMS = [
  "로그인 개선",
  "대시보드 위젯",
  "알림 템플릿",
  "API 스펙",
  "티켓 분류",
  "웹훅 연동",
  "문서 마이그레이션",
  "실적 차트",
  "스캔 정책",
  "온보딩 체크리스트",
  "수요 예측",
  "여정 다이어그램",
] as const

const IPS = [
  "10.12.0.34",
  "192.168.10.2",
  "172.16.4.88",
  "10.0.0.15",
  "203.248.252.1",
] as const

type CatSpec = {
  category: string
  editContent: (item: string) => string
}

const CATEGORY_SPECS: CatSpec[] = [
  {
    category: "태스크 생성",
    editContent: (item) => `태스크 '${item}' 생성`,
  },
  {
    category: "코멘트 등록",
    editContent: (item) => `아이템 '${item}'에 코멘트 등록`,
  },
  {
    category: "수정",
    editContent: (item) => `아이템 '${item}' 설명 수정`,
  },
  {
    category: "확정",
    editContent: (item) => `아이템 '${item}' 일정 확정`,
  },
  {
    category: "상태 변경",
    editContent: (item) => `아이템 '${item}' 상태 변경`,
  },
  {
    category: "첨부파일",
    editContent: (item) => `아이템 '${item}'에 첨부파일 추가`,
  },
]

const editedAtIso = (index: number): string => {
  const day = 25 - (index % 20)
  const hour = 9 + (index % 9)
  const minute = (index * 13) % 60
  const second = (index * 17) % 60
  return new Date(
    Date.UTC(2026, 3, day, hour, minute, second),
  ).toISOString()
}

export const ADMIN_LOGS_SEED: AdminLogRow[] = Array.from(
  { length: 48 },
  (_, i) => {
    const p = PROJECTS[i % PROJECTS.length]
    const spec = CATEGORY_SPECS[i % CATEGORY_SPECS.length]
    const itemName = ITEMS[i % ITEMS.length]
    return {
      id: `alog-${String(i + 1).padStart(4, "0")}`,
      projectId: p.id,
      editedAt: editedAtIso(i),
      projectName: p.name,
      category: spec.category,
      itemName,
      editContent: spec.editContent(itemName),
      affiliation: AFFILIATIONS[i % AFFILIATIONS.length],
      editor: EDITORS[i % EDITORS.length],
      ip: IPS[i % IPS.length],
    }
  },
)
