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

const allMockProjects: AssignedProjectRecord[] = [
  { id: "PRJ-001", name: "DEMO Project", slug: "demo" },
  { id: "PRJ-SAMPLE-1", name: "샘플 프로젝트 1", slug: "sample-1" },
  { id: "PRJ-SAMPLE-2", name: "샘플 프로젝트 2", slug: "sample-2" },
]

/**
 * MSW 로그인 QA
 * - 틴토랩 마스터 관리자: master-pm@tinto.co.kr / MasterPm2026! (역할: 관리자 포털 기본 진입)
 * - 프로젝트 담당자: pm@project.com / ProjectPm2026!
 * - 멀티 프로젝트(샘플): multi@demo.local / MultiDemo2026!
 */
const seedUsers: MockUserRecord[] = [
  {
    id: "usr-tintolab-master-admin",
    email: "master-pm@tinto.co.kr",
    password: "MasterPm2026!",
    displayName: "Tintolab 마스터 관리자",
    organization: "Tintolab",
    roles: ["tintolab_master_admin"],
    assignedProjects: [...allMockProjects],
    accessibleProjectIds: allMockProjects.map((p) => p.id),
    defaultProjectSlug: null,
  },
  {
    id: "usr-project-main-stakeholder",
    email: "pm@project.com",
    password: "ProjectPm2026!",
    displayName: "프로젝트 담당자 (임시)",
    organization: "프로젝트",
    roles: ["project_stakeholder"],
    assignedProjects: [allMockProjects[0]],
    accessibleProjectIds: ["PRJ-001"],
    defaultProjectSlug: "demo",
  },
  {
    id: "usr-multi-sample",
    email: "multi@demo.local",
    password: "MultiDemo2026!",
    displayName: "샘플 멀티 프로젝트",
    organization: "데모",
    roles: ["project_stakeholder"],
    assignedProjects: [allMockProjects[1], allMockProjects[2]],
    accessibleProjectIds: [allMockProjects[1].id, allMockProjects[2].id],
    defaultProjectSlug: null,
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
