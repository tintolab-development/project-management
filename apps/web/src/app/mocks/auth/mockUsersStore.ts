export type AssignedProjectRecord = {
  id: string
  name: string
}

export type MockUserRecord = {
  id: string
  email: string
  /**
   * MSW 전용 평문 비밀번호. 실서비스에서는 절대 사용하지 않습니다.
   */
  password: string
  displayName: string
  assignedProjects: AssignedProjectRecord[]
}

/** MSW 로그인 QA: 이메일 / 비밀번호 (예: admin@tinto.co.kr / !Tinto0527) */
const seedUsers: MockUserRecord[] = [
  {
    id: "usr-admin-dev",
    email: "admin@tinto.co.kr",
    password: "!Tinto0527",
    displayName: "Tintolab Admin (dev)",
    assignedProjects: [
      { id: "proj-alpha", name: "알파 프로젝트" },
      { id: "proj-beta", name: "베타 프로젝트" },
    ],
  },
  {
    id: "usr-member-sample",
    email: "member@tinto.co.kr",
    password: "Member1234!",
    displayName: "샘플 멤버",
    assignedProjects: [{ id: "proj-gamma", name: "감마 프로젝트" }],
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
