import type { AuthRole } from "@/features/auth"

export type AssignedProjectRecord = {
  id: string
  name: string
  slug: string
}

export type MockUserRecord = {
  id: string
  email: string
  /**
   * MSW 전용 평문 비밀번호. 실서비스에서는 절대 사용하지 않습니다.
   */
  password: string
  displayName: string
  organization: string
  roles: AuthRole[]
  assignedProjects: AssignedProjectRecord[]
  accessibleProjectIds: string[]
  defaultProjectSlug: string | null
}

const allTintolabProjects: AssignedProjectRecord[] = [
  { id: "PRJ-001", name: "Seolhaewon Project", slug: "seohaewon" },
  { id: "proj-alpha", name: "알파 프로젝트", slug: "alpha" },
  { id: "proj-beta", name: "베타 프로젝트", slug: "beta" },
]

/**
 * MSW 로그인 QA
 * - 틴토랩 관리자: admin@tinto.co.kr / !Tinto0527
 * - 틴토랩 마스터 PM(전 프로젝트): master-pm@tinto.co.kr / MasterPm2026!
 * - 틴토랩 PM(복수 프로젝트 담당): pm@tinto.co.kr / PmTinto2026!
 * - 설해원 담당자: staff@seohaewon.co.kr / SeohaeStaff2026!
 */
const seedUsers: MockUserRecord[] = [
  {
    id: "usr-admin-dev",
    email: "admin@tinto.co.kr",
    password: "!Tinto0527",
    displayName: "Tintolab Admin (dev)",
    organization: "Tintolab",
    roles: ["tintolab_super_admin"],
    assignedProjects: allTintolabProjects,
    accessibleProjectIds: allTintolabProjects.map((p) => p.id),
    defaultProjectSlug: null,
  },
  {
    id: "usr-master-pm",
    email: "master-pm@tinto.co.kr",
    password: "MasterPm2026!",
    displayName: "Tintolab Master PM",
    organization: "Tintolab",
    roles: ["tintolab_master_pm"],
    assignedProjects: allTintolabProjects,
    accessibleProjectIds: allTintolabProjects.map((p) => p.id),
    defaultProjectSlug: null,
  },
  {
    id: "usr-tinto-pm",
    email: "pm@tinto.co.kr",
    password: "PmTinto2026!",
    displayName: "Tintolab PM",
    organization: "Tintolab",
    roles: ["tintolab_pm"],
    assignedProjects: [
      { id: "proj-alpha", name: "알파 프로젝트", slug: "alpha" },
      { id: "proj-beta", name: "베타 프로젝트", slug: "beta" },
    ],
    accessibleProjectIds: ["proj-alpha", "proj-beta"],
    defaultProjectSlug: null,
  },
  {
    id: "usr-seohaewon-temp",
    email: "staff@seohaewon.co.kr",
    password: "SeohaeStaff2026!",
    displayName: "설해원 담당자 (임시)",
    organization: "설해원",
    roles: ["project_stakeholder"],
    assignedProjects: [{ id: "PRJ-001", name: "Seolhaewon Project", slug: "seohaewon" }],
    accessibleProjectIds: ["PRJ-001"],
    defaultProjectSlug: "seohaewon",
  },
]

let users: MockUserRecord[] = structuredClone(seedUsers)

export const mockUsersStore = {
  findById(id: string): MockUserRecord | undefined {
    return users.find((u) => u.id === id)
  },

  findByEmail(email: string): MockUserRecord | undefined {
    const key = email.trim().toLowerCase()
    return users.find((u) => u.email.toLowerCase() === key)
  },

  verifyCredentials(email: string, password: string): MockUserRecord | null {
    const u = this.findByEmail(email)
    if (!u || u.password !== password) return null
    return u
  },

  reset(): void {
    users = structuredClone(seedUsers)
  },
}
