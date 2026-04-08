import type { AdminAccountMember } from "@/features/admin-accounts/model/adminAccount"

/** 진행 중 프로젝트와 동일한 ID·소속명으로 멤버 시드 (페이지네이션 검증용 행 수) */
const PROJECTS: { id: string; name: string }[] = [
  { id: "ap-001", name: "고객 의사결정 워크스페이스" },
  { id: "ap-002", name: "B2B 포털 리뉴얼" },
  { id: "ap-005", name: "CS 자동 분류" },
  { id: "ap-008", name: "영업 실적 대시보드" },
  { id: "ap-011", name: "재고 최적화 실험" },
]

const JOB_TITLES = ["프로덕트 디자이너", "프론트엔드", "백엔드", "PM", "QA", "데이터 분석가"]
const PERMS = ["관리자", "편집자", "뷰어"]

function buildPhone(seed: number): string {
  const p = String(10000000 + (seed % 89999999)).padStart(8, "0")
  return `010-${p.slice(0, 4)}-${p.slice(4)}`
}

export const ADMIN_ACCOUNTS_MEMBERS_SEED: AdminAccountMember[] = PROJECTS.flatMap(
  (project, pi) =>
    Array.from({ length: 12 }, (_, i) => {
      const n = pi * 12 + i + 1
      return {
        id: `acc-m-${project.id}-${i + 1}`,
        projectId: project.id,
        loginId: `user${n}`,
        affiliation: project.name,
        name: `사용자 ${n}`,
        jobTitle: JOB_TITLES[(n + i) % JOB_TITLES.length],
        email: `user${n}@example.com`,
        phone: buildPhone(n * 17 + pi),
        permission: PERMS[n % PERMS.length],
      }
    }),
)
